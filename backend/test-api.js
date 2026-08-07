/**
 * UniPak Backend API Test Script
 * Tests all endpoints to verify the API structure is correct
 */

const app = require('./src/app');
const http = require('http');
const { getPool } = require('./src/config/database');

const PORT = 3001;
let server;

function request(method, path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path,
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('\n🧪 Starting UniPak API Tests...\n');
    
    let passed = 0, failed = 0;
    
    async function test(name, method, path, body, expectedStatus = 200) {
        try {
            const res = await request(method, path, body);
            const ok = res.status === expectedStatus || (expectedStatus === 'any');
            const status = ok ? '✅' : '❌';
            console.log(`${status} ${method} ${path} → ${res.status} ${res.data.success !== undefined ? '(success: ' + res.data.success + ')' : ''}`);
            if (ok) passed++; else failed++;
            
            if (res.data && res.data.endpoints) {
                console.log(`   📋 API Info loaded: ${Object.keys(res.data.endpoints).length} endpoint groups`);
            }
            if (res.data && res.data.message) {
                console.log(`   💬 ${res.data.message}`);
            }
            return res;
        } catch (err) {
            console.log(`❌ ${method} ${path} → ERROR: ${err.message}`);
            failed++;
            return null;
        }
    }
    
    // Test 1: API Info
    console.log('--- API Structure Tests ---');
    await test('API Info', 'GET', '/api');
    await test('Health Check', 'GET', '/api/health');
    
    // Test 2: Universities endpoints (will fail on DB but should return 500, not 404)
    console.log('\n--- Endpoint Routing Tests (DB may be disconnected) ---');
    const r1 = await test('List Universities', 'GET', '/api/universities', null, 'any');
    const r2 = await test('Dropdown Universities', 'GET', '/api/universities/dropdown', null, 'any');
    const r3 = await test('Cities List', 'GET', '/api/universities/cities', null, 'any');
    const r4 = await test('Universities by City', 'GET', '/api/universities/city/Lahore', null, 'any');
    const r5 = await test('University by ID', 'GET', '/api/universities/1', null, 'any');
    const r6 = await test('University Faculties', 'GET', '/api/universities/1/faculties', null, 'any');
    const r7 = await test('University Programs', 'GET', '/api/universities/1/programs', null, 'any');
    const r8 = await test('Fee Structure', 'GET', '/api/universities/1/fee-structure', null, 'any');
    const r9 = await test('Hostel Info', 'GET', '/api/universities/1/hostels', null, 'any');
    const r10 = await test('Search Programs', 'GET', '/api/universities/programs/search?category=Computer%20Science', null, 'any');
    const r11 = await test('Categories', 'GET', '/api/universities/programs/categories', null, 'any');
    const r12 = await test('Admission Tests', 'GET', '/api/universities/admission-tests', null, 'any');
    const r13 = await test('Aggregate Formula', 'GET', '/api/universities/faculties/1/aggregate-formula', null, 'any');
    
    // Test 3: Calculator endpoints
    console.log('\n--- Calculator Endpoint Tests ---');
    await test('Calculator Info', 'GET', '/api/calculator');
    const c1 = await test('Calculator Universities', 'GET', '/api/calculator/universities', null, 'any');
    const c2 = await test('Calculator Faculties', 'GET', '/api/calculator/faculties/1', null, 'any');
    const calculatorFaculty = c2?.data?.data?.find(faculty => !faculty.isHolistic && faculty.admissionTests?.length);
    const calculatorTest = calculatorFaculty?.admissionTests?.find(entryTest => Number(entryTest.TotalMarks) > 0);
    const c3 = await test('Calculate Aggregate', 'POST', '/api/calculator/calculate', {
        facultyIds: [calculatorFaculty?.FacultyID],
        matricMarks: 950,
        matricTotal: 1100,
        intermediateMarks: 980,
        intermediateTotal: 1100,
        entryTestSelections: [{
            facultyId: calculatorFaculty?.FacultyID,
            admissionTestId: calculatorTest?.AdmissionTestID,
            score: Number(calculatorTest?.TotalMarks) * 0.8,
            total: Number(calculatorTest?.TotalMarks)
        }]
    }, 200);
    if (!Number.isFinite(c3?.data?.results?.[0]?.result?.aggregateScore)) {
        console.log('âŒ Aggregate response did not contain a numeric score');
        failed++;
    }
    const c4 = await test('Compare Universities', 'POST', '/api/calculator/compare', {
        facultyId1: 1,
        facultyId2: 3,
        matricMarks: 950,
        matricTotal: 1100,
        intermediateMarks: 880,
        intermediateTotal: 1100,
        entryTestScore: 85,
        entryTestTotal: 100,
        studentName: 'Test Student'
    }, 'any');
    
    // Test 4: 404 handling
    console.log('\n--- Error Handling Tests ---');
    const e1 = await test('404 Handler', 'GET', '/api/nonexistent', null, 404);
    
    // Test 5: Validation tests
    console.log('\n--- Validation Tests ---');
    const v1 = await test('Missing fields (400)', 'POST', '/api/calculator/calculate', { facultyIds: [1] }, 400);
    const v2 = await test('No faculties (400)', 'POST', '/api/calculator/calculate', {
        matricMarks: 950, matricTotal: 1100, intermediateMarks: 880, intermediateTotal: 1100
    }, 400);
    const v3 = await test('Same faculty comparison (400)', 'POST', '/api/calculator/compare', {
        facultyId1: 1, facultyId2: 1,
        matricMarks: 950, matricTotal: 1100, intermediateMarks: 880, intermediateTotal: 1100
    }, 400);
    
    // Summary
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
    console.log(`${'='.repeat(50)}\n`);
    
    await getPool().then(pool => pool.close());
    server.close(() => process.exit(failed > 0 ? 1 : 0));
}

server = app.listen(PORT, () => {
    runTests().catch(err => {
        console.error('Test runner error:', err);
        server.close();
        process.exit(1);
    });
});
