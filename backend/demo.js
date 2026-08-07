/**
 * Demo: Test calculator and comparison with real data
 */
const http = require('http');

function request(method, path, body, port = 3000) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port,
            path,
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function demo() {
    console.log('\n=== UniPak Backend Demo ===\n');

    // 1. List universities in Lahore
    console.log('📍 Universities in Lahore:');
    const lahore = await request('GET', '/api/universities/city/Lahore');
    console.log(`   Found ${lahore.data.count} universities`);
    lahore.data.data.forEach(u => console.log(`   - ${u.UniversityName} (${u.Sector}) - Rank: ${u.Ranking}`));

    // 2. Get NUST programs
    console.log('\n📚 NUST Programs:');
    const nustPrograms = await request('GET', '/api/universities/14/programs');
    console.log(`   Found ${nustPrograms.data.count} programs`);
    nustPrograms.data.data.slice(0, 5).forEach(p => console.log(`   - ${p.ProgramName} (${p.MajorCategory})`));

    // 3. Search CS programs
    console.log('\n🔍 Computer Science Programs (all universities):');
    const cs = await request('GET', '/api/universities/programs/search?category=Computer%20Science');
    console.log(`   Found ${cs.data.count} CS programs`);
    cs.data.data.slice(0, 5).forEach(p => console.log(`   - ${p.ProgramName} at ${p.UniversityName} (${p.CityName})`));

    // 4. Aggregate Calculator - FAST Lahore Computing
    console.log('\n🧮 Aggregate Calculator:');
    const calc = await request('POST', '/api/calculator/calculate', {
        facultyIds: [1, 31, 34], // FAST Lahore Computing, NUST SEECS, COMSATS Eng/CS
        matricMarks: 950,
        matricTotal: 1100,
        intermediateMarks: 880,
        intermediateTotal: 1100,
        entryTestScore: 85,
        entryTestTotal: 100,
        studentName: 'Ahmed Ali',
        studentEmail: 'ahmed@example.com'
    });
    console.log(`   Student: ${calc.data.studentData.matricPercentage}% Matric, ${calc.data.studentData.intermediatePercentage}% Intermediate, ${calc.data.studentData.entryTestPercentage}% Entry Test`);
    calc.data.results.forEach(r => {
        console.log(`   - ${r.universityName} (${r.facultyName}): Aggregate = ${r.result?.aggregateScore || 'Holistic Review'}%, Chance = ${r.chancePercent || 'N/A'}%`);
    });

    // 5. Compare NUST vs FAST
    console.log('\n⚖️  Predictive Comparison: NUST vs FAST');
    const compare = await request('POST', '/api/calculator/compare', {
        facultyId1: 31,  // NUST SEECS
        facultyId2: 1,   // FAST Lahore Computing
        matricMarks: 950,
        matricTotal: 1100,
        intermediateMarks: 880,
        intermediateTotal: 1100,
        entryTestScore: 85,
        entryTestTotal: 100,
        studentName: 'Ahmed Ali'
    });
    const c = compare.data.comparison;
    console.log(`   NUST: Aggregate = ${c.university1.aggregateScore}%, Chance = ${c.university1.chancePercent}%`);
    console.log(`   FAST: Aggregate = ${c.university2.aggregateScore}%, Chance = ${c.university2.chancePercent}%`);
    console.log(`   Recommendation: ${c.verdict}`);

    console.log('\n✅ Demo completed successfully!\n');
    process.exit(0);
}

// Start server, run demo, then stop
const app = require('./src/app');
const server = app.listen(3000, async () => {
    try {
        await demo();
    } catch (err) {
        console.error('Demo error:', err);
    } finally {
        server.close();
    }
});
