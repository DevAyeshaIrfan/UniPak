import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expandMeritCutoffs, buildMeritTrend, numericMerit } from './meritCutoffs.js';

const record = { UniversityID: 1, MeritCutoffID: 20, ProgramNameSource: 'BS Computer Science', AdmissionYear: 2025, SessionName: '2025', MeritListRound: 'Closing', MeritStatus: 'Reported', CategoryTestBasis: 'NU / NAT / SAT (see notes)', ClosingMeritPercent: 76, Notes: 'NU 76 | NAT 90 | SAT 85' };

test('FAST workbook notes become separate test values without modifying source data', () => {
  const rows = expandMeritCutoffs([record]);
  assert.deepEqual(Object.fromEntries(rows.map(r => [r.testLabel, r.ClosingMeritPercent])), { 'NTS NAT': 90, SAT: 85, 'NU Test': 76 });
  assert.equal(record.CategoryTestBasis, 'NU / NAT / SAT (see notes)');
});

test('unavailable NAT/SAT values never inherit NU or become zero', () => {
  const rows = expandMeritCutoffs([{ ...record, Notes: 'NU 73 | NAT n/a | SAT 85.02' }]);
  const nat = rows.find(r => r.testLabel === 'NTS NAT');
  assert.equal(nat.ClosingMeritPercent, null);
  assert.equal(nat.MeritStatus, 'Unavailable');
  assert.deepEqual(buildMeritTrend([nat], nat.programKey), { series: [], data: [] });
  assert.equal(numericMerit(null), null);
  assert.equal(numericMerit(''), null);
  assert.equal(numericMerit(0), 0);
});

test('Karachi SAT references are not duplicated when a standalone SAT record exists', () => {
  const nu = { ...record, CategoryTestBasis: 'NU (Regular) aggregate', ClosingMeritPercent: 68.26, Notes: 'SAT column value 75.3; NAT not applicable/0 for this campus' };
  const sat = { ...nu, MeritCutoffID: 21, CategoryTestBasis: 'SAT-based', ClosingMeritPercent: 75.3, Notes: null };
  const rows = expandMeritCutoffs([nu, sat]);
  assert.equal(rows.length, 2);
  assert.equal(rows.find(r => r.testLabel === 'SAT').ClosingMeritPercent, 75.3);
  assert.equal(rows.some(r => r.testLabel === 'NTS NAT'), false);
});

test('graphs keep each test and year separate and leave missing 2026 NAT/SAT values blank', () => {
  const rows = expandMeritCutoffs([record, { ...record, MeritCutoffID: 99, AdmissionYear: 2026, CategoryTestBasis: 'NU Test only', ClosingMeritPercent: 73.6, Notes: null }]);
  const trend = buildMeritTrend(rows, rows[0].programKey);
  const nu = trend.series.find(s => s.name === 'NU Test').key;
  const sat = trend.series.find(s => s.name === 'SAT').key;
  assert.equal(trend.data[0][nu], 76);
  assert.equal(trend.data[1][nu], 73.6);
  assert.equal(trend.data[0][sat], 85);
  assert.equal(trend.data[1][sat], null);
  assert.equal(buildMeritTrend(rows, 'unlisted program').data.length, 0);
});

test('other university tests work and combined routes without individual values stay combined', () => {
  const rows = expandMeritCutoffs([{ ...record, CategoryTestBasis: 'NET / SAT', Notes: 'NET: 74 | SAT: 82' }]);
  assert.deepEqual(rows.map(r => r.testLabel).sort(), ['NET', 'SAT']);
  const combined = expandMeritCutoffs([{ ...record, CategoryTestBasis: 'LCAT/SAT + holistic profile review', Notes: null, ClosingMeritPercent: null }]);
  assert.equal(combined.length, 1);
  assert.equal(combined[0].testLabel, 'LCAT/SAT + holistic profile review');
  const nat = expandMeritCutoffs([{ ...record, CategoryTestBasis: 'NTS/NAT + academic aggregate', Notes: null, ClosingMeritPercent: 85.68 }]);
  assert.equal(nat[0].testLabel, 'NTS NAT');
  const estimate = expandMeritCutoffs([{ ...record, CategoryTestBasis: 'ECAT-based', Notes: null, ClosingMeritPercent: null, MeritStatus: 'Estimated' }]);
  assert.equal(estimate[0].MeritStatus, 'Estimated');
});

test('graphs separate ECAT categories and choose the most recent recorded list within a category', () => {
  const rows = expandMeritCutoffs([
    { ...record, MeritCutoffID: 1, CategoryTestBasis: 'ECAT, Category A1', Notes: null, ClosingMeritPercent: 81 },
    { ...record, MeritCutoffID: 2, CategoryTestBasis: 'ECAT, Category A1', Notes: null, ClosingMeritPercent: 79 },
    { ...record, MeritCutoffID: 3, CategoryTestBasis: 'ECAT, Category A2', Notes: null, ClosingMeritPercent: 71 },
  ]);
  const trend = buildMeritTrend(rows, rows[0].programKey);
  assert.equal(trend.series.length, 2);
  assert.equal(trend.data[0][trend.series.find(s => s.name.includes('A1')).key], 79);
  assert.equal(trend.data[0][trend.series.find(s => s.name.includes('A2')).key], 71);
});
