"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Pill, 
  TestTube, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Play,
  Database
} from "lucide-react";
import { toast } from "sonner";

export default function PharmacyTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  // Test data initialization
  const initializeTestData = async () => {
    setIsLoading(true);
    const results = [];

    try {
      // Test 1: Initialize pharmacy data
      results.push({ test: "Initializing pharmacy data...", status: "running" });
      setTestResults([...results]);

      const setupResponse = await fetch("/api/setup/pharmacy-integration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (setupResponse.ok) {
        const setupResult = await setupResponse.json();
        results[results.length - 1] = {
          test: "Initialize pharmacy data",
          status: "success",
          data: setupResult
        };
      } else {
        const errorData = await setupResponse.json().catch(() => ({ error: "Unknown error" }));
        results[results.length - 1] = {
          test: "Initialize pharmacy data",
          status: "error",
          error: `${setupResponse.status}: ${errorData.error || "Failed to initialize"}`
        };
      }

      setTestResults([...results]);
    } catch (error) {
      results[results.length - 1] = {
        test: "Initialize pharmacy data",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      };
      setTestResults([...results]);
    }

    setIsLoading(false);
  };

  // Test pharmacy search
  const testPharmacySearch = async () => {
    setIsLoading(true);
    const results = [...testResults];

    try {
      results.push({ test: "Testing pharmacy search...", status: "running" });
      setTestResults([...results]);

      const response = await fetch("/api/pharmacies/search?zipCode=10001&limit=5");
      const result = await response.json();

      if (result.success) {
        results[results.length - 1] = { 
          test: "Pharmacy search", 
          status: "success", 
          data: result.data 
        };
      } else {
        results[results.length - 1] = { 
          test: "Pharmacy search", 
          status: "error", 
          error: result.message 
        };
      }
    } catch (error) {
      results[results.length - 1] = { 
        test: "Pharmacy search", 
        status: "error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }

    setTestResults([...results]);
    setIsLoading(false);
  };

  // Test drug interaction checking
  const testDrugInteractions = async () => {
    setIsLoading(true);
    const results = [...testResults];

    try {
      results.push({ test: "Testing drug interactions...", status: "running" });
      setTestResults([...results]);

      const response = await fetch("/api/drug-interactions/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medications: ["Warfarin", "Aspirin"]
        }),
      });

      const result = await response.json();

      if (result.success) {
        results[results.length - 1] = { 
          test: "Drug interaction check", 
          status: "success", 
          data: result.data 
        };
      } else {
        results[results.length - 1] = { 
          test: "Drug interaction check", 
          status: "error", 
          error: result.message 
        };
      }
    } catch (error) {
      results[results.length - 1] = { 
        test: "Drug interaction check", 
        status: "error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }

    setTestResults([...results]);
    setIsLoading(false);
  };

  // Run all tests
  const runAllTests = async () => {
    setTestResults([]);
    await initializeTestData();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await testPharmacySearch();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await testDrugInteractions();
    toast.success("All tests completed!");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "running":
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "default";
      case "error":
        return "destructive";
      case "running":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <TestTube className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Pharmacy Integration Test Suite</h1>
          <p className="text-muted-foreground">Test all pharmacy integration features</p>
        </div>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Test Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Button 
              onClick={runAllTests} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Run All Tests
            </Button>
            
            <Button 
              variant="outline" 
              onClick={initializeTestData} 
              disabled={isLoading}
            >
              <Database className="h-4 w-4 mr-2" />
              Initialize Data
            </Button>
            
            <Button 
              variant="outline" 
              onClick={testPharmacySearch} 
              disabled={isLoading}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Test Pharmacy Search
            </Button>
            
            <Button 
              variant="outline" 
              onClick={testDrugInteractions} 
              disabled={isLoading}
            >
              <Pill className="h-4 w-4 mr-2" />
              Test Drug Interactions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                    <Badge variant={getStatusColor(result.status) as any}>
                      {result.status}
                    </Badge>
                  </div>
                </div>
                
                {result.data && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <pre className="text-sm text-green-800 overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
                
                {result.error && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{result.error}</p>
                  </div>
                )}
                
                {index < testResults.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Manual Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Prerequisites:</strong> Make sure you're logged in as a doctor and have at least one patient in the system.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">1. Test Prescription Form</h4>
              <p className="text-sm text-muted-foreground">
                Go to a patient's treatment plan → Create treatment plan → <strong>After creation</strong>, look for "E-Prescribing" section
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Note: The prescription button only appears AFTER you successfully create a treatment plan
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">2. Test Drug Interactions</h4>
              <p className="text-sm text-muted-foreground">
                In prescription form, try entering "Warfarin" and then "Aspirin" to see interaction warnings
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">3. Test Pharmacy Selection</h4>
              <p className="text-sm text-muted-foreground">
                Select a pharmacy from the dropdown and verify the details are displayed correctly
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">4. Test Prescription Creation</h4>
              <p className="text-sm text-muted-foreground">
                Fill out a complete prescription form and click "Send Electronically"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Testing Examples */}
      <Card>
        <CardHeader>
          <CardTitle>API Testing Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Search Pharmacies</h4>
              <code className="text-sm bg-muted p-2 rounded block">
                GET /api/pharmacies/search?zipCode=10001&limit=5
              </code>
            </div>
            
            <div>
              <h4 className="font-medium">Check Drug Interactions</h4>
              <code className="text-sm bg-muted p-2 rounded block">
                POST /api/drug-interactions/check<br/>
                {"{"}"medications": ["Warfarin", "Aspirin"]{"}"}
              </code>
            </div>
            
            <div>
              <h4 className="font-medium">Create Prescription</h4>
              <code className="text-sm bg-muted p-2 rounded block">
                POST /api/prescriptions<br/>
                {"{"}"patientId": "...", "medication": {"{"}"name": "Amoxicillin"{"}"}, ...{"}"}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
