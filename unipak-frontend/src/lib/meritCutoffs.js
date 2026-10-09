const TEST_PATTERN = /\b(?:NTS\s*(?:[/-]\s*)?NAT|NAT\s+NTS|NAT|NTS|NU|SAT|ACT|NET|ECAT|MDCAT|USAT|HAT|LCAT|NED(?:\s+Entry\s+Test)?)\b/gi;

function testLabel(value) {
  const name = value.toUpperCase().replace(/\s+/g, ' ');
  if (/NAT|NTS/.test(name)) return 'NTS NAT';
  if (name === 'NU') return 'NU Test';
  if (name.startsWith('NED')) return 'NED Entry Test';
  return name;
}

export function numericMerit(value) {
  if (value == null || String(value).trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 100 ? number : null;
}

export function meritProgramKey(row) {
  return String(row.ProgramNameSource || row.ProgramName || 'Program merit')
    .toLowerCase().replace(/\btechnologies\b/g, 'technology').replace(/\s+/g, ' ').trim();
}

// Expand only explicitly labelled values, never a test weighting or an inferred cutoff.
export function expandMeritCutoffs(records) {
  const expanded = [];
  records.forEach((row) => {
    const basis = row.CategoryTestBasis || 'Not specified';
    const basisTests = [...new Set((basis.match(TEST_PATTERN) || []).map(testLabel))];
    const values = new Map();
    const unavailableTests = new Set();
    String(row.Notes || '').split(/[|;]/).forEach((part) => {
      const match = /^(NTS\s*(?:[/-]\s*)?NAT|NAT\s+NTS|NAT|NTS|NU|SAT|ACT|NET|ECAT|MDCAT|USAT|HAT|LCAT|NED(?:\s+Entry\s+Test)?)\b\s*(?:column\s+value\s+)?(?:[:=-]\s*)?(\d+(?:\.\d+)?|n\/a)(?:%|\b)/i.exec(part.trim());
      if (match) {
        const label = testLabel(match[1]);
        values.set(label, numericMerit(match[2]));
        if (match[2].toLowerCase() === 'n/a') unavailableTests.add(label);
      }
    });
    const closing = numericMerit(row.ClosingMeritPercent);
    if (basisTests.length === 1 && !values.has(basisTests[0])) values.set(basisTests[0], closing);

    // Keep category distinctions (e.g. ECAT A1/A2) even when the test is the same.
    const category = basis.match(/\bCategory\s+(.+)/i)?.[0] || '';
    const append = (label, value, displayBasis) => expanded.push({
      ...row,
      ClosingMeritPercent: value,
      MeritStatus: unavailableTests.has(label) ? 'Unavailable' : row.MeritStatus,
      testLabel: label,
      displayBasis,
      seriesLabel: category ? `${label} · ${category}` : label,
      programKey: meritProgramKey(row),
    });
    if (values.size) {
      for (const [label, value] of values) append(label, value, category ? `${label} · ${category}` : label);
    } else {
      // Combined routes without individual figures stay combined; do not copy one value to every test.
      append(basis, closing, basis);
    }
  });

  // Some source notes repeat a value also stored as a standalone test row.
  const unique = new Map();
  expanded.forEach(row => {
    const key = JSON.stringify([row.UniversityID, row.programKey, row.AdmissionYear, row.SessionName,
      row.MeritListRound, row.seriesLabel, row.ClosingMeritPercent]);
    if (!unique.has(key)) unique.set(key, { ...row, displayKey: key });
  });
  return [...unique.values()].sort((a, b) => b.AdmissionYear - a.AdmissionYear
    || (b.ClosingMeritPercent ?? -1) - (a.ClosingMeritPercent ?? -1)
    || a.ProgramNameSource.localeCompare(b.ProgramNameSource));
}

export function buildMeritTrend(rows, programKey) {
  const candidates = rows.filter(row => row.programKey === programKey && numericMerit(row.ClosingMeritPercent) != null);
  const labels = [...new Set(candidates.map(row => row.seriesLabel))].sort((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
  const series = labels.map((name, i) => ({ key: `merit${i}`, name }));
  const byYear = new Map();
  // A year/category may have several lists. Plot its most recently recorded numeric list.
  [...candidates].sort((a, b) => (a.MeritCutoffID || 0) - (b.MeritCutoffID || 0)).forEach(row => {
    const year = String(row.AdmissionYear);
    if (!byYear.has(year)) byYear.set(year, { year, ...Object.fromEntries(series.map(s => [s.key, null])) });
    const key = series.find(s => s.name === row.seriesLabel).key;
    byYear.get(year)[key] = row.ClosingMeritPercent;
  });
  return { series, data: [...byYear.values()].sort((a, b) => Number(a.year) - Number(b.year)) };
}
