/**
 * API Test Suite for AI Journal System
 * Run with: node test.js
 */

const http = require('http');

const API_BASE = 'http://localhost:5000/api';
let testsPassed = 0;
let testsFailed = 0;

// Helper to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(body),
          });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   Error: ${error.message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('🧪 AI Journal System API Tests\n');

  // Test 1: Health Check
  await test('Health check endpoint', async () => {
    const res = await makeRequest('GET', '/health');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.status) throw new Error('No status field');
  });

  // Test 2: Create Journal Entry
  const testEntry = {
    userId: 'testuser123',
    ambience: 'forest',
    text: 'I felt peaceful in the forest today. The sound of birds was calming.',
  };

  await test('Create journal entry', async () => {
    const res = await makeRequest('POST', '/journal', testEntry);
    if (res.status !== 201) throw new Error(`Status ${res.status}`);
    if (!res.body.message) throw new Error('No message in response');
  });

  // Test 3: Get User Entries
  await test('Get user entries', async () => {
    const res = await makeRequest('GET', '/journal/testuser123');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(res.body)) throw new Error('Response not an array');
  });

  // Test 4: Analyze Emotion
  await test('Analyze emotion', async () => {
    const res = await makeRequest('POST', '/journal/analyze', {
      text: 'I felt peaceful in the forest today. The sound of birds was calming.',
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.emotion) throw new Error('No emotion in response');
    if (!Array.isArray(res.body.keywords)) throw new Error('Keywords not array');
    if (!res.body.summary) throw new Error('No summary in response');
    // Ensure it's not dummy text - real LLM response
    if (res.body.emotion === 'dummy' || res.body.summary === 'dummy') {
      throw new Error('Response contains dummy data - LLM not working');
    }
  });

  // Test 5: Get Insights
  await test('Get user insights', async () => {
    const res = await makeRequest('GET', '/journal/insights/testuser123');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (typeof res.body.totalEntries !== 'number') {
      throw new Error('No totalEntries');
    }
  });

  // Test 6: Multiple Entries
  await test('Create multiple entries', async () => {
    const entries = [
      {
        userId: 'user456',
        ambience: 'ocean',
        text: 'The waves were soothing and relaxing.',
      },
      {
        userId: 'user456',
        ambience: 'mountain',
        text: 'The fresh air made me feel energized.',
      },
    ];

    for (const entry of entries) {
      const res = await makeRequest('POST', '/journal', entry);
      if (res.status !== 201) throw new Error(`Failed to create entry: ${res.status}`);
    }
  });

  // Test 7: Cache Test - Analyze Same Text
  await test('Emotion analysis caching', async () => {
    const text = 'This is a test for caching functionality.';

    // First call (should hit LLM)
    const start1 = Date.now();
    const res1 = await makeRequest('POST', '/journal/analyze', { text });
    const time1 = Date.now() - start1;

    if (res1.status !== 200) throw new Error('First analysis failed');

    // Second call (should hit cache)
    const start2 = Date.now();
    const res2 = await makeRequest('POST', '/journal/analyze', { text });
    const time2 = Date.now() - start2;

    if (res2.status !== 200) throw new Error('Second analysis failed');
    if (res1.body.emotion !== res2.body.emotion) {
      throw new Error('Different emotions for same text');
    }

    // Cache should be significantly faster
    console.log(
      `   First call: ${time1}ms, Second call (cached): ${time2}ms`
    );
  });

  // Test 8: Error Handling - Missing Fields
  await test('Error handling for missing fields', async () => {
    const res = await makeRequest('POST', '/journal', {
      userId: 'test',
      // Missing ambience and text
    });

    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // Print Summary
  console.log(`\n${'━'.repeat(50)}`);
  console.log(`Tests Passed: ✅ ${testsPassed}`);
  console.log(`Tests Failed: ❌ ${testsFailed}`);
  console.log(`Total: ${testsPassed + testsFailed}`);

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
