const { test, before, after, mock } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const vm = require('node:vm');
const express = require('express');

const databasePath = require.resolve('../src/config/database');
require.cache[databasePath] = {
    id: databasePath, filename: databasePath, loaded: true,
    exports: { query: async () => ({ recordset: [] }) }
};
const service = require('../src/services/universityService');
const calls = [];
const academic = { matricMarks: '880', matricTotal: '1100', intermediateMarks: '880', intermediateTotal: '1100' };
const marks = { ...academic, entryTestScore: '80', entryTestTotal: '100' };
const faculty = id => ({
    FacultyID: Number(id), UniversityID: Number(id), FacultyName: `Faculty ${id}`,
    UniversityName: `University ${id}`, AggregateFormula: Number(id) === 3
        ? 'Holistic review' : 'Matric 10% + Intermediate 40% + Entry Test 50%'
});
const spy = (name, implementation) => async (...args) => {
    calls.push({ name, args });
    return implementation(...args);
};
for (const name of Object.keys(service)) {
    if (name !== 'parseAggregateFormula') service[name] = spy(name, () => []);
}
service.getFacultyById = spy('getFacultyById', id => [1, 2, 3].includes(Number(id)) ? faculty(id) : null);
service.getAvgCutoffForUniversity = spy('getAvgCutoffForUniversity', () => ({ AvgCutOff: 75 }));
service.getAdmissionTestById = spy('getAdmissionTestById', (id, facultyId) => Number(id) === Number(facultyId) * 10
    ? { AdmissionTestID: Number(id), TotalMarks: 100, TestName: 'Example Test' } : null);
service.getAdmissionTestsByFaculty = spy('getAdmissionTestsByFaculty', id => Number(id) === 3 ? [] : [{ AdmissionTestID: Number(id) * 10 }]);
service.getProgramById = spy('getProgramById', id => [101, 202, 303].includes(Number(id)) ? {
    ...faculty(Number(id) / 101), ProgramID: Number(id), ProgramName: 'Example Program',
    AggregateFormula: Number(id) === 303 ? 'Holistic review' : faculty(1).AggregateFormula
} : null);
service.getLatestCutoffForProgram = spy('getLatestCutoffForProgram', () => null);
service.getAllMeritCutoffs = spy('getAllMeritCutoffs', () => Array.from({ length: 300 }, (_, id) => ({ MeritCutoffID: id })));

const app = express();
app.use(express.json());
app.use('/api/calculator', require('../src/routes/calculator'));
app.use('/api/universities', require('../src/routes/universities'));
app.use('/api/merit-cutoffs', require('../src/routes/meritCutoffs'));
let server;
let base;
before(async () => {
    mock.method(console, 'error', () => {});
    server = http.createServer(app);
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { await new Promise(resolve => server.close(resolve)); });

async function request(path, body) {
    const response = await fetch(base + path, body === undefined ? {} : {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    return { status: response.status, body: await response.json() };
}

test('calculator validates the entire faculty list before querying', async () => {
    for (const facultyIds of [null, {}, [], [true], [null], [{}], [0], [-1], [1.5], ['bad'], [2147483648], Array(257).fill(1), [1, false]]) {
        calls.length = 0;
        const response = await request('/api/calculator/calculate', { ...marks, facultyIds });
        assert.equal(response.status, 400);
        assert.equal(response.body.success, false);
        assert.equal(calls.length, 0);
    }
});

test('multiple faculties, numeric strings and repeated IDs retain valid results', async () => {
    calls.length = 0;
    const response = await request('/api/calculator/calculate', { ...marks, facultyIds: [1, '01', '2', 1] });
    assert.equal(response.status, 200);
    assert.deepEqual(response.body.results.map(row => row.facultyId), [1, 2]);
    assert.deepEqual(response.body.results.map(row => row.result.aggregateScore), [80, 80]);
    assert.equal(calls.filter(call => call.name === 'getFacultyById').length, 4);
    const unknown = await request('/api/calculator/calculate', { ...marks, facultyIds: [999] });
    assert.equal(unknown.status, 200);
    assert.deepEqual(unknown.body.results, []);
});

test('invalid raw mark types are rejected in calculate and legacy compare', async () => {
    for (const matricMarks of [null, true, false, {}, [880], '', '   ']) {
        for (const route of ['calculate', 'compare']) {
            calls.length = 0;
            const response = await request(`/api/calculator/${route}`, {
                ...marks, matricMarks, facultyIds: [1], facultyId1: 1, facultyId2: 2
            });
            assert.equal(response.status, 400);
            assert.equal(calls.length, 0);
        }
    }
});

test('malformed selections are rejected before querying, while zero scores and default totals work', async () => {
    for (const entryTestSelections of [null, {}, true, [null], [false], [[]], [{ facultyId: 1, admissionTestId: 10, score: true }]]) {
        calls.length = 0;
        const response = await request('/api/calculator/calculate', { ...academic, facultyIds: [1], entryTestSelections });
        assert.equal(response.status, 400);
        assert.equal(calls.length, 0);
    }
    for (const total of [undefined, null, '100']) {
        const response = await request('/api/calculator/calculate', {
            ...academic, facultyIds: [1], entryTestSelections: [{ facultyId: '1', admissionTestId: '10', score: '0', total }]
        });
        assert.equal(response.status, 200);
        assert.equal(response.body.results[0].result.aggregateScore, 40);
    }
});

test('program comparisons validate raw profiles and preserve the browser numeric-string payload', async () => {
    const profile = { ...academic, admissionTestId: '10', entryTestScore: '80', entryTestTotal: '100' };
    for (const profile1 of [null, true, [], { ...profile, matricMarks: {} }, { ...profile, entryTestScore: false }]) {
        const response = await request('/api/calculator/compare', { programId1: '101', programId2: '202', profile1, profile2: { ...profile, admissionTestId: '20' } });
        assert.equal(response.status, 400);
    }
    const response = await request('/api/calculator/compare', { programId1: '101', programId2: '202', profile1: profile, profile2: { ...profile, admissionTestId: '20' } });
    assert.equal(response.status, 200);
    assert.equal(response.body.comparison.university1.aggregateScore, 80);
    const holistic = await request('/api/calculator/compare', {
        programId1: 303, programId2: 202,
        profile1: { ...academic, admissionTestId: '', entryTestScore: '', entryTestTotal: '' },
        profile2: { ...profile, admissionTestId: '20' }
    });
    assert.equal(holistic.status, 200);
    assert.equal(holistic.body.comparison.university1.aggregateScore, null);
});

test('numeric encodings and coercion objects cannot bypass validation, and numeric zero remains valid', async () => {
    for (const matricTotal of ['0x10', '0b10', '0o10']) {
        for (const route of ['calculate', 'compare']) {
            calls.length = 0;
            const response = await request('/api/calculator/' + route, { ...marks, matricMarks: 1, matricTotal, facultyIds: [1], facultyId1: 1, facultyId2: 2 });
            assert.equal(response.status, 400);
            assert.equal(calls.length, 0);
        }
    }
    for (const entryTestScore of [0, '0']) {
        const response = await request('/api/calculator/calculate', { ...marks, entryTestScore, facultyIds: [1] });
        assert.equal(response.status, 200);
        assert.equal(response.body.results[0].result.aggregateScore, 40);
    }
    const profile = { ...academic, admissionTestId: 10, entryTestScore: 80, entryTestTotal: 100 };
    for (const programId1 of [{ toString: null }, { valueOf: null }, true, [101]]) {
        const response = await request('/api/calculator/compare', { programId1, programId2: 202, profile1: profile, profile2: { ...profile, admissionTestId: 20 } });
        assert.equal(response.status, 400);
    }
    const score = await request('/api/calculator/compare', { programId1: 101, programId2: 202, profile1: { ...profile, entryTestScore: { toString: null } }, profile2: { ...profile, admissionTestId: 20 } });
    assert.equal(score.status, 400);
});

test('all filter entry points reject repeated values and invalid integer ranges before querying', async () => {
    const paths = [
        '/api/universities?search=a&search=b', '/api/universities?sector=a&sector=b',
        '/api/universities/test-breakdowns?facultyId=-1', '/api/universities/test-breakdowns?universityId=bad',
        '/api/universities/programs/search?limit=0', '/api/universities/programs/search?offset=-1',
        '/api/universities/programs/search?limit=1.5', '/api/universities/programs/search?universityId=2147483648',
        '/api/universities/merit-cutoffs?year=32768', '/api/merit-cutoffs?year=bad',
        '/api/merit-cutoffs?city=a&city=b', '/api/universities/1/merit-cutoffs?year=0'
    ];
    for (const path of paths) {
        calls.length = 0;
        const response = await request(path);
        assert.equal(response.status, 400, path);
        assert.match(response.body.error, /^Invalid .* filter$/);
        assert.equal(calls.length, 0, path);
    }
});

test('valid and empty filters keep working without new result caps', async () => {
    for (const path of [
        '/api/universities?search=&city=&sector=', '/api/universities/test-breakdowns?universityId=1',
        '/api/universities/programs/search?limit=2147483647&offset=0',
        '/api/universities/merit-cutoffs?year=2026', '/api/merit-cutoffs?year=2026',
        '/api/universities/1/merit-cutoffs?year=2026'
    ]) assert.equal((await request(path)).status, 200, path);
    assert.equal((await request('/api/merit-cutoffs')).body.data.length, 300);
});

test('submission quotas are configurable and blocked requests do not reach the handler', async () => {
    process.env.TEST_RATE_LIMIT_MAX = '2';
    process.env.TEST_RATE_LIMIT_WINDOW_MS = '60000';
    const { createSubmissionLimiter } = require('../src/middleware/submissionRateLimit');
    const limited = express();
    let handlerCalls = 0;
    limited.post('/submit', createSubmissionLimiter('TEST', 100), (req, res) => {
        handlerCalls++;
        res.json({ success: true });
    });
    limited.get('/browse', (req, res) => res.json({ success: true }));
    assert.equal(limited.get('trust proxy'), false);
    const listener = limited.listen(0, '127.0.0.1');
    await new Promise(resolve => listener.once('listening', resolve));
    const url = `http://127.0.0.1:${listener.address().port}`;
    try {
        for (let index = 0; index < 3; index++) {
            const response = await fetch(url + '/submit', { method: 'POST' });
            assert.equal(response.status, index < 2 ? 200 : 429);
            if (index === 2) {
                assert.ok(response.headers.get('retry-after'));
                assert.equal((await response.json()).success, false);
            } else await response.json();
        }
        for (let index = 0; index < 4; index++) assert.equal((await fetch(url + '/browse')).status, 200);
        assert.equal(handlerCalls, 2);
    } finally {
        await new Promise(resolve => listener.close(resolve));
        delete process.env.TEST_RATE_LIMIT_MAX;
        delete process.env.TEST_RATE_LIMIT_WINDOW_MS;
    }
});

test('database certificate verification is opt-in and keeps encryption enabled', async () => {
    const source = fs.readFileSync(databasePath, 'utf8');
    for (const [value, expected] of [[undefined, true], ['false', true], ['true', false]]) {
        let configuration;
        class ConnectionPool {
            constructor(config) { configuration = config; }
            async connect() { return this; }
        }
        const sandbox = {
            module: { exports: {} }, process: { env: { DB_VERIFY_CERTIFICATE: value } },
            console: { log() {}, error() {} },
            require: name => name === 'mssql' ? { ConnectionPool } : { config() {} }
        };
        vm.runInNewContext(source, sandbox);
        await sandbox.module.exports.getPool();
        assert.equal(configuration.options.encrypt, true);
        assert.equal(configuration.options.trustServerCertificate, expected);
    }
});

test('CORS allows configured origins and preserves empty and wildcard settings', async () => {
    const original = process.env.CORS_ORIGIN;
    const appPath = require.resolve('../src/app');
    try {
        for (const value of ['http://localhost:5173, https://example.invalid', '', '*']) {
            process.env.CORS_ORIGIN = value;
            delete require.cache[appPath];
            const application = require(appPath);
            assert.equal(application.get('trust proxy'), false);
            const listener = application.listen(0, '127.0.0.1');
            await new Promise(resolve => listener.once('listening', resolve));
            const url = `http://127.0.0.1:${listener.address().port}/api/health`;
            try {
                for (const origin of ['http://localhost:5173', 'https://example.invalid', 'https://blocked.invalid']) {
                    const response = await fetch(url, { headers: { Origin: origin } });
                    assert.equal(response.status, 200);
                    assert.equal(response.headers.get('access-control-allow-origin'), value === '' || value === '*'
                        ? '*' : origin === 'https://blocked.invalid' ? null : origin);
                    await response.json();
                }
            } finally { await new Promise(resolve => listener.close(resolve)); }
        }
    } finally {
        if (original === undefined) delete process.env.CORS_ORIGIN;
        else process.env.CORS_ORIGIN = original;
        delete require.cache[appPath];
    }
});
