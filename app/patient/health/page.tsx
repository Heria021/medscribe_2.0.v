"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Activity, TrendingUp, Target, Thermometer, Zap, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MetricCard } from "@/components/ui/metric-card";
import { MiniChart, ProgressRing } from "@/components/ui/mini-chart";
import { HealthStatus, StatusIndicator } from "@/components/ui/status-indicator";
import { ActionCard, ActionCardGrid } from "@/components/ui/action-card";

export default function HealthTrackerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "patient") {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "patient") {
    return null;
  }

  // Mock health data for demonstration
  const healthData = {
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 98.6,
    weight: 150,
    steps: 8500,
    sleep: 7.5,
    heartRateHistory: [68, 70, 72, 69, 74, 71, 72],
    weightHistory: [152, 151, 150, 149, 150, 150, 150],
    stepsHistory: [7200, 8100, 8500, 9200, 7800, 8500, 8500],
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Health Tracker</h2>
            <p className="text-muted-foreground">
              Monitor your health metrics and track your wellness journey
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Reading
          </Button>
        </div>

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Heart Rate"
            value={`${healthData.heartRate} BPM`}
            change={{
              value: 2.1,
              type: "increase",
              period: "vs last week"
            }}
            icon={<Heart className="h-4 w-4" />}
            description="Resting heart rate"
            status={healthData.heartRate >= 60 && healthData.heartRate <= 100 ? "success" : "warning"}
            chart={
              <MiniChart
                data={healthData.heartRateHistory.map(v => ({ value: v }))}
                type="line"
                color="hsl(var(--chart-1))"
              />
            }
          />

          <MetricCard
            title="Blood Pressure"
            value={`${healthData.bloodPressure.systolic}/${healthData.bloodPressure.diastolic}`}
            icon={<Activity className="h-4 w-4" />}
            description="Latest reading"
            status="success"
          />

          <MetricCard
            title="Weight"
            value={`${healthData.weight} lbs`}
            change={{
              value: -1.3,
              type: "decrease",
              period: "this month"
            }}
            icon={<Target className="h-4 w-4" />}
            description="Current weight"
            chart={
              <MiniChart
                data={healthData.weightHistory.map(v => ({ value: v }))}
                type="area"
                color="hsl(var(--chart-3))"
              />
            }
          />

          <MetricCard
            title="Daily Steps"
            value={healthData.steps.toLocaleString()}
            change={{
              value: 12.5,
              type: "increase",
              period: "vs yesterday"
            }}
            icon={<Zap className="h-4 w-4" />}
            description="Today's activity"
            status={healthData.steps >= 10000 ? "success" : "warning"}
            chart={
              <MiniChart
                data={healthData.stepsHistory.map(v => ({ value: v }))}
                type="bar"
                color="hsl(var(--chart-4))"
              />
            }
          />
        </div>

        {/* Detailed Health Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vital Signs */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Vital Signs
              </CardTitle>
              <CardDescription>
                Your latest health measurements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <HealthStatus
                label="Heart Rate"
                value={healthData.heartRate}
                range={{ min: 60, max: 100, optimal: { min: 60, max: 80 } }}
                unit="BPM"
              />
              <HealthStatus
                label="Temperature"
                value={healthData.temperature}
                range={{ min: 97.0, max: 99.0, optimal: { min: 98.0, max: 98.8 } }}
                unit="°F"
              />
              <HealthStatus
                label="Weight"
                value={healthData.weight}
                range={{ min: 140, max: 160, optimal: { min: 145, max: 155 } }}
                unit="lbs"
              />
            </CardContent>
          </Card>

          {/* Health Goals */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Health Goals
              </CardTitle>
              <CardDescription>
                Track your progress towards health targets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Daily Steps</span>
                  <span className="text-sm text-muted-foreground">
                    {healthData.steps.toLocaleString()} / 10,000
                  </span>
                </div>
                <ProgressRing
                  value={healthData.steps}
                  max={10000}
                  size={80}
                  strokeWidth={6}
                  color="hsl(var(--chart-1))"
                >
                  <span className="text-sm font-bold">
                    {Math.round((healthData.steps / 10000) * 100)}%
                  </span>
                </ProgressRing>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sleep Goal</span>
                  <span className="text-sm text-muted-foreground">
                    {healthData.sleep}h / 8h
                  </span>
                </div>
                <ProgressRing
                  value={healthData.sleep}
                  max={8}
                  size={80}
                  strokeWidth={6}
                  color="hsl(var(--chart-2))"
                >
                  <span className="text-sm font-bold">
                    {Math.round((healthData.sleep / 8) * 100)}%
                  </span>
                </ProgressRing>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <ActionCardGrid columns={4}>
          <ActionCard
            title="Log Vitals"
            description="Record your health measurements"
            icon={<Heart className="h-5 w-5" />}
            href="/patient/health/log"
            color="red"
          />
          <ActionCard
            title="Track Exercise"
            description="Log your physical activities"
            icon={<Activity className="h-5 w-5" />}
            href="/patient/health/exercise"
            color="green"
          />
          <ActionCard
            title="Set Goals"
            description="Define your health targets"
            icon={<Target className="h-5 w-5" />}
            href="/patient/health/goals"
            color="blue"
          />
          <ActionCard
            title="View Reports"
            description="Analyze your health trends"
            icon={<TrendingUp className="h-5 w-5" />}
            href="/patient/health/reports"
            color="purple"
          />
        </ActionCardGrid>
      </div>
    </DashboardLayout>
  );
}
