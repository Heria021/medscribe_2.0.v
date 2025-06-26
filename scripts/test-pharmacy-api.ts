#!/usr/bin/env tsx

/**
 * Pharmacy Integration API Test Script (TypeScript)
 * 
 * Usage:
 * npx tsx scripts/test-pharmacy-api.ts
 * or add to package.json scripts:
 * "test:pharmacy": "tsx scripts/test-pharmacy-api.ts"
 * 
 * Make sure your MedScribe app is running on localhost:3000
 */

const BASE_URL = 'http://localhost:3000';

// Test configuration - Update these with your actual values
interface TestConfig {
  DOCTOR_TOKEN: string;
  PATIENT_ID: string;
  ADMIN_TOKEN: string;
}

const TEST_CONFIG: TestConfig = {
  // You'll need to replace these with actual IDs from your system
  DOCTOR_TOKEN: 'your-doctor-jwt-token-here',
  PATIENT_ID: 'your-patient-id-here', 
  ADMIN_TOKEN: 'your-admin-jwt-token-here',
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
} as const;

type ColorKey = keyof typeof colors;

interface ApiResponse<T = any> {
  success: boolean;
  status?: number;
  data?: T;
  error?: string;
}

function log(message: string, color: ColorKey = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName: string): void {
  log(`\n${colors.bold}🧪 Testing: ${testName}${colors.reset}`, 'blue');
}

function logSuccess(message: string): void {
  log(`✅ ${message}`, 'green');
}

function logError(message: string): void {
  log(`❌ ${message}`, 'red');
}

function logWarning(message: string): void {
  log(`⚠️  ${message}`, 'yellow');
}

async function makeRequest<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function testInitializeData(): Promise<boolean> {
  logTest('Initialize Pharmacy Data');
  
  const result = await makeRequest('/api/setup/pharmacy-integration', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TEST_CONFIG.ADMIN_TOKEN}`,
    },
  });

  if (result.success) {
    logSuccess('Pharmacy data initialized successfully');
    console.log('  📊 Data:', JSON.stringify(result.data, null, 2));
  } else {
    logError(`Failed to initialize data: ${result.error || result.data?.message}`);
    if (result.status === 401) {
      logWarning('Make sure you have admin access and valid token');
    }
  }

  return result.success;
}

async function testPharmacySearch(): Promise<boolean> {
  logTest('Pharmacy Search');
  
  const result = await makeRequest('/api/pharmacies/search?zipCode=10001&limit=5');

  if (result.success && result.data?.data) {
    logSuccess(`Found ${result.data.data.length} pharmacies`);
    result.data.data.forEach((pharmacy: any, index: number) => {
      console.log(`  ${index + 1}. ${pharmacy.name} - ${pharmacy.address?.street || pharmacy.address}`);
    });
  } else {
    logError(`Pharmacy search failed: ${result.error || result.data?.message}`);
  }

  return result.success;
}

async function testDrugInteractions(): Promise<boolean> {
  logTest('Drug Interaction Check');
  
  const result = await makeRequest('/api/drug-interactions/check', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TEST_CONFIG.DOCTOR_TOKEN}`,
    },
    body: JSON.stringify({
      medications: ['Warfarin', 'Aspirin']
    }),
  });

  if (result.success && result.data?.data) {
    const { hasInteractions, interactions } = result.data.data;
    
    if (hasInteractions && interactions?.length > 0) {
      logSuccess(`Found ${interactions.length} drug interactions`);
      interactions.forEach((interaction: any, index: number) => {
        console.log(`  ${index + 1}. ${interaction.severity?.toUpperCase()}: ${interaction.description}`);
      });
    } else {
      logWarning('No interactions found (this might indicate missing test data)');
    }
  } else {
    logError(`Drug interaction check failed: ${result.error || result.data?.message}`);
    if (result.status === 401) {
      logWarning('Make sure you have doctor access and valid token');
    }
  }

  return result.success;
}

async function testPrescriptionCreation(): Promise<boolean> {
  logTest('Prescription Creation');
  
  if (!TEST_CONFIG.PATIENT_ID || TEST_CONFIG.PATIENT_ID === 'your-patient-id-here') {
    logWarning('Skipping prescription test - no patient ID configured');
    return false;
  }

  const prescriptionData = {
    patientId: TEST_CONFIG.PATIENT_ID,
    medication: {
      name: 'Amoxicillin',
      genericName: 'Amoxicillin',
      strength: '500mg',
      dosageForm: 'tablet'
    },
    dosage: {
      quantity: '30 tablets',
      frequency: 'Three times daily',
      instructions: 'Take one tablet by mouth three times daily with food',
      refills: 2
    },
    pharmacy: {
      ncpdpId: '0000001',
      name: 'CVS Pharmacy #1234',
      address: '123 Main St, New York, NY 10001',
      phone: '(555) 123-4567'
    },
    deliveryMethod: 'electronic',
    priority: 'routine',
    notes: 'Test prescription created by automated test'
  };

  const result = await makeRequest('/api/prescriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TEST_CONFIG.DOCTOR_TOKEN}`,
    },
    body: JSON.stringify(prescriptionData),
  });

  if (result.success && result.data?.data) {
    logSuccess('Prescription created successfully');
    console.log(`  📋 Prescription ID: ${result.data.data.prescriptionId}`);
    
    if (result.data.data.safetyChecks) {
      const { drugInteractions, allergyAlerts } = result.data.data.safetyChecks;
      console.log(`  🛡️  Safety checks: ${drugInteractions?.length || 0} interactions, ${allergyAlerts?.length || 0} allergy alerts`);
    }
  } else {
    logError(`Prescription creation failed: ${result.error || result.data?.message}`);
    if (result.status === 401) {
      logWarning('Make sure you have doctor access and valid token');
    }
  }

  return result.success;
}

async function testErrorHandling(): Promise<boolean> {
  logTest('Error Handling');
  
  // Test unauthorized access
  const unauthorizedResult = await makeRequest('/api/prescriptions', {
    method: 'POST',
    body: JSON.stringify({ patientId: 'test' }),
  });

  if (unauthorizedResult.status === 401) {
    logSuccess('Unauthorized access properly blocked');
  } else {
    logError('Unauthorized access not properly handled');
  }

  // Test invalid data
  const invalidDataResult = await makeRequest('/api/prescriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TEST_CONFIG.DOCTOR_TOKEN}`,
    },
    body: JSON.stringify({ invalid: 'data' }),
  });

  if (invalidDataResult.status === 400) {
    logSuccess('Invalid data properly rejected');
  } else {
    logError('Invalid data not properly handled');
  }

  return true;
}

interface TestResult {
  total: number;
  passed: number;
  failed: number;
}

interface TestCase {
  name: string;
  fn: () => Promise<boolean>;
}

async function runAllTests(): Promise<void> {
  log(`${colors.bold}🚀 Starting Pharmacy Integration Tests${colors.reset}`, 'blue');
  log(`📍 Testing against: ${BASE_URL}`);
  
  // Check if tokens are configured
  if (TEST_CONFIG.DOCTOR_TOKEN === 'your-doctor-jwt-token-here') {
    logWarning('Doctor token not configured - some tests will be skipped');
  }
  
  if (TEST_CONFIG.ADMIN_TOKEN === 'your-admin-jwt-token-here') {
    logWarning('Admin token not configured - initialization test will be skipped');
  }

  const results: TestResult = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  const tests: TestCase[] = [
    { name: 'Initialize Data', fn: testInitializeData },
    { name: 'Pharmacy Search', fn: testPharmacySearch },
    { name: 'Drug Interactions', fn: testDrugInteractions },
    { name: 'Prescription Creation', fn: testPrescriptionCreation },
    { name: 'Error Handling', fn: testErrorHandling },
  ];

  for (const test of tests) {
    results.total++;
    try {
      const success = await test.fn();
      if (success) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError(`Test "${test.name}" threw an error: ${errorMessage}`);
      results.failed++;
    }
  }

  // Summary
  log(`\n${colors.bold}📊 Test Summary${colors.reset}`, 'blue');
  log(`Total tests: ${results.total}`);
  logSuccess(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}`);
  }

  const successRate = Math.round((results.passed / results.total) * 100);
  if (successRate >= 80) {
    logSuccess(`Success rate: ${successRate}% 🎉`);
  } else {
    logWarning(`Success rate: ${successRate}% - needs improvement`);
  }

  log('\n📝 Next steps:');
  log('1. Update TEST_CONFIG with your actual tokens and IDs');
  log('2. Test the UI components at http://localhost:3000/test/pharmacy');
  log('3. Create real prescriptions through the treatment plan interface');
}

// Main execution
async function main(): Promise<void> {
  try {
    await runAllTests();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`Test runner failed: ${errorMessage}`);
    process.exit(1);
  }
}

// Check if we're running this file directly
if (require.main === module) {
  main();
}
