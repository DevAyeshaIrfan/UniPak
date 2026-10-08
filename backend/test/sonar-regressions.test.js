const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const frontend = fs.existsSync(path.join(root, 'frontend')) ? 'frontend' : 'unipak-frontend';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const supportSource = read('backend/src/routes/support.js');
const meritSource = read(`${frontend}/src/lib/meritCutoffs.js`);
const pageSource = read(`${frontend}/src/pages/SupportPage.jsx`);
const componentSource = read(`${frontend}/src/components/shared/UniversityMeritCutoffs.jsx`);

function patternFromLine(line) {
    const start = line.indexOf('/');
    const end = line.lastIndexOf('/');
    const flags = line.slice(end + 1).match(/^[a-z]*/)[0];
    return new RegExp(line.slice(start + 1, end), flags);
}

// Retain the original patterns as compatibility fixtures, including their flags.
const patterns = [
    ['server email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternFromLine(supportSource.split('\n').find(line => line.startsWith('const EMAIL_PATTERN')))],
    ['browser email', /^\S+@\S+\.\S+$/,
        patternFromLine(pageSource.split('\n').find(line => line.includes('.test(form.email.trim())')))],
    ['merit tests', /\b(?:NTS\s*[/ -]?\s*NAT|NAT\s+NTS|NAT|NTS|NU|SAT|ACT|NET|ECAT|MDCAT|USAT|HAT|LCAT|NED(?:\s+Entry\s+Test)?)\b/gi,
        patternFromLine(meritSource.split('\n')[0])],
    ['merit notes', /^(NTS\s*[/ -]?\s*NAT|NAT\s+NTS|NAT|NTS|NU|SAT|ACT|NET|ECAT|MDCAT|USAT|HAT|LCAT|NED(?:\s+Entry\s+Test)?)\b\s*(?:column\s+value\s+)?[:=-]?\s*(\d+(?:\.\d+)?|n\/a)(?:%|\b)/i,
        patternFromLine(meritSource.split('\n').find(line => line.includes('const match =')))],
];

function corpus() {
    const inputs = ['', 'a@b.c', '@@b.c', 'a@b@c.d', 'a@..b', 'a@b..', 'a@b.c\n', 'a@b.c\r\n',
        'NTS/NAT 83.5%', 'NTS - NAT column value : 82', 'NAT column value42', 'NED Entry Test: n/a',
        'NET / SAT', 'NAT: 12.34.5', 'NAT: 12x', 'NAT 12%', 'NTS NATNET', 'NTS\n\tNAT 99'];
    const labels = ['NTS', 'NTS/NAT', 'NTS - NAT', 'NAT NTS', 'NAT', 'NU', 'SAT', 'ACT', 'NET', 'ECAT',
        'MDCAT', 'USAT', 'HAT', 'LCAT', 'NED', 'NED Entry Test', 'nts nat', 'not a test'];
    const whitespace = ['', ' ', '\t', '\n', '\r\n', '\u00a0', '\u2028', '\u2029', '\ufeff', '\u200b'];
    for (const label of labels) for (const space of whitespace) {
        for (const suffix of ['80', '80%', '80.5', '80.5x', '80.', '0', 'n/a', 'N/A', '', '80 90']) {
            inputs.push(label + space + suffix, label + space + 'column value' + space + ':' + space + suffix);
        }
        inputs.push(label, label + space + 'NAT', 'prefix ' + label + space + 'SAT suffix');
    }
    // Exhaustive short emails cover multiple @ signs, dots, whitespace and missing parts.
    let words = [''];
    for (let length = 1; length <= 6; length++) {
        words = words.flatMap(word => ['a', '@', '.', ' ', '\n'].map(char => word + char));
        inputs.push(...words);
    }
    let seed = 0x6a09e667;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
    const alphabet = 'NTSAnatUEC0192837465@./ -:%=\t\r\n\u00a0\u2028é中😀';
    for (let index = 0; index < 20000; index++) {
        let value = '';
        const length = random() % 81;
        for (let offset = 0; offset < length; offset++) value += alphabet[random() % alphabet.length];
        inputs.push(value, labels[random() % labels.length] + value);
    }
    return inputs;
}

const inputs = corpus();
for (const [name, oldPattern, currentPattern] of patterns) {
    test(`${name}: original and current matches are identical across ${inputs.length} inputs`, () => {
        for (const input of inputs) {
            oldPattern.lastIndex = 0;
            currentPattern.lastIndex = 0;
            const expected = input.match(oldPattern);
            const actual = name === 'merit notes' && meritSource.includes('.exec(part.trim())')
                ? currentPattern.exec(input) : input.match(currentPattern);
            assert.deepEqual(actual, expected, `${name}: ${JSON.stringify(input)}`);
        }
    });
}

test('50,000-character hostile inputs finish within milliseconds', context => {
    const repeated = 'a'.repeat(50000);
    const spaces = ' '.repeat(50000);
    const dots = '.'.repeat(50000);
    const cases = [
        ['server email', [repeated, 'a@b' + dots + ' ', 'a@' + repeated]],
        ['browser email', [repeated, 'a' + '@'.repeat(50000), 'a@b' + dots + ' ']],
        ['merit tests', ['NTS' + spaces + 'X', 'NED' + spaces + 'Entry' + spaces + 'X']],
        ['merit notes', ['NTS' + spaces + 'X', 'NAT' + spaces + 'X', 'NU column value' + spaces + 'X',
            'NU ' + '9'.repeat(50000) + 'x']],
    ];
    for (const [name, hostileInputs] of cases) {
        const pattern = patterns.find(entry => entry[0] === name)[2];
        let maximum = 0;
        for (const input of hostileInputs) {
            pattern.lastIndex = 0;
            const start = performance.now();
            input.match(pattern);
            const elapsed = performance.now() - start;
            maximum = Math.max(maximum, elapsed);
            assert.ok(elapsed < 100, `${name} took ${elapsed.toFixed(2)} ms`);
        }
        context.diagnostic(`${name}: slowest hostile input ${maximum.toFixed(2)} ms`);
    }
});

async function submitSupport({ configured = true, failure } = {}) {
    const calls = { logs: [], saved: [], sent: [], failed: [] };
    let handler;
    const router = { get() {}, post(_path, _limiter, callback) { handler = callback; } };
    const emailService = {
        isConfigured: () => configured,
        async sendSupportNotification(value) {
            calls.sent.push(value);
            if (failure) throw new Error(failure);
            return { providerId: 'fake-provider-id' };
        }
    };
    const supportService = {
        async createSupportRequest(value) {
            calls.saved.push(value);
            return { SupportRequestID: 7, ReferenceCode: value.referenceCode };
        },
        async markEmailSent(...values) { calls.sent.push(values); },
        async markEmailFailed(...values) { calls.failed.push(values); }
    };
    vm.runInNewContext(supportSource, {
        module: { exports: {} }, Date: { now: () => 123456 },
        console: { error: (...values) => calls.logs.push(values) },
        require: name => {
            if (name === 'express') return { Router: () => router };
            if (name === '../services/emailService') return emailService;
            if (name === '../services/supportService') return supportService;
            if (name === '../middleware/submissionRateLimit') return { createSubmissionLimiter: () => () => {} };
            if (name === 'crypto' || name === 'node:crypto') return { randomBytes: () => Buffer.from('123456', 'hex') };
            throw new Error('Unexpected test import');
        }
    });
    let status;
    let body;
    const response = { status(value) { status = value; return this; }, json(value) { body = JSON.parse(JSON.stringify(value)); } };
    await handler({ body: { requestType: 'contact', name: 'Example Visitor', email: 'visitor@example.invalid', subject: 'Example subject', message: 'A normal support message.' } }, response);
    return { calls, status, body };
}

test('support retains success, unconfigured and failed email responses and side effects', async () => {
    for (const [options, email] of [[{}, { sent: true, status: 'sent' }],
        [{ configured: false }, { sent: false, status: 'not_configured' }],
        [{ failure: 'Provider rejected the message' }, { sent: false, status: 'failed' }]]) {
        const { status, body, calls } = await submitSupport(options);
        assert.equal(status, 201);
        assert.deepEqual(body, { success: true, referenceCode: 'UP-2N9C-123456', email });
        assert.equal(calls.saved.length, 1);
        assert.equal(calls.saved[0].emailStatus, options.configured === false ? 'NotConfigured' : 'Pending');
        if (options.failure) assert.deepEqual(calls.failed[0], [7, options.failure]);
    }
});

test('provider text containing line breaks cannot forge a support log line', async () => {
    const failure = 'Rejected subject\nFAKE SUCCESS\r\n\u2028another fake line\u001b[31m';
    const { calls, status, body } = await submitSupport({ failure });
    assert.equal(status, 201);
    assert.equal(body.email.status, 'failed');
    assert.deepEqual(calls.failed[0], [7, failure]);
    assert.equal(calls.logs.length, 1);
    const log = calls.logs[0].join(' ');
    assert.equal(log, 'Support email failed for UP-2N9C-123456:');
    assert.equal(log.includes('FAKE SUCCESS'), false);
    assert.equal(/[\r\n\u2028\u2029\u001b]/.test(log), false);
});

test('Number.parseFloat and the global function retain all conversion results and errors', () => {
    assert.equal(Number.parseFloat, parseFloat);
    for (const value of [null, undefined, true, false, {}, [], [8], 0, -0, NaN, Infinity, '80', ' 80 ',
        '80.5', '1e2', '0x10', '0b10', '', '80x', 'Infinity', '\u00a080', Symbol('example')]) {
        const convert = fn => { try { return { value: fn(value) }; } catch (error) { return { error: error.name }; } };
        assert.deepEqual(convert(Number.parseFloat), convert(parseFloat));
    }
});

test('node-prefixed imports resolve to the same built-in modules on this Node version', () => {
    assert.equal(require('node:https'), require('https'));
    assert.equal(require('node:crypto'), require('crypto'));
});

test('both merit label sorts retain the original string order', () => {
    for (const source of [componentSource, meritSource]) {
        const line = source.split('\n').find(value => value.includes('new Set(') && value.includes('.sort('));
        const start = source.indexOf('.sort(', source.indexOf(line));
        let end = start + 5;
        let depth = 0;
        do {
            if (source[end] === '(') depth++;
            if (source[end] === ')') depth--;
            end++;
        } while (depth > 0);
        const sortCall = source.slice(start, end);
        const labels = ['NTS NAT', 'NU Test', 'SAT', 'ECAT · Category A2', 'ECAT · Category A1',
            '10', '2', 'a', 'A', 'é', '中', '😀', '\ud800', '\udfff', '', 'SAT'];
        for (const subset of [labels, ...Array.from({ length: 200 }, (_, i) => inputs.slice(i * 20, i * 20 + 20))]) {
            const sandbox = { labels: [...subset], result: null };
            vm.runInNewContext(`result = labels${sortCall}`, sandbox);
            assert.deepEqual([...sandbox.result], [...subset].sort());
        }
    }
});
