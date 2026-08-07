const { query } = require('../config/database');

async function getUniversities(filters = {}) {
    let sql = `
        SELECT u.UniversityID, u.UniversityName, u.Sector, c.CityName,
               (SELECT COUNT(*) FROM Programs p JOIN Faculties f ON p.FacultyID = f.FacultyID WHERE f.UniversityID = u.UniversityID) as ProgramCount
        FROM Universities u
        JOIN Cities c ON u.CityID = c.CityID
        WHERE 1=1
    `;
    const params = [];

    if (filters.city) {
        sql += ` AND c.CityName = ?`;
        params.push(filters.city);
    }
    
    if (filters.sector) {
        sql += ` AND u.Sector = ?`;
        params.push(filters.sector);
    }
    
    if (filters.search) {
        sql += ` AND (u.UniversityName LIKE '%' + ? + '%' OR c.CityName LIKE '%' + ? + '%')`;
        params.push(filters.search, filters.search);
    }

    sql += ` ORDER BY u.UniversityName`;

    if (filters.limit) {
        const limit = parseInt(filters.limit, 10) || 10;
        const offset = parseInt(filters.offset, 10) || 0;
        sql += ` OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`;
        params.push(offset, limit);
    }

    const result = await query(sql, params);
    return result.recordset;
}

async function getUniversityById(id) {
    const sql = `
        SELECT u.*, c.CityName
        FROM Universities u
        JOIN Cities c ON u.CityID = c.CityID
        WHERE u.UniversityID = ?
    `;
    const result = await query(sql, [id]);
    return result.recordset[0] || null;
}

async function getFacultiesByUniversity(universityId) {
    const sql = `
        SELECT f.*
        FROM Faculties f
        WHERE f.UniversityID = ?
        ORDER BY f.FacultyID
    `;
    const result = await query(sql, [universityId]);
    const faculties = result.recordset;
    if (!faculties.length) return faculties;
    const tests = await getAdmissionTestsByUniversity(universityId);
    return faculties.map(faculty => ({
        ...faculty,
        admissionTests: tests.filter(test => test.FacultyID === faculty.FacultyID)
    }));
}

async function getAdmissionTestsByUniversity(universityId) {
    const sql = `
        SELECT at.AdmissionTestID, at.FacultyID, at.TestName, at.TotalMarks,
               at.TotalMarksText, at.IsPrimary, at.SubjectBreakdown,
               at.QuestionFormat, at.NegativeMarking, at.Notes,
               f.FacultyName, u.UniversityID, u.UniversityName, c.CityName
        FROM AdmissionTests at
        JOIN Faculties f ON at.FacultyID = f.FacultyID
        JOIN Universities u ON f.UniversityID = u.UniversityID
        JOIN Cities c ON u.CityID = c.CityID
        WHERE u.UniversityID = ?
        ORDER BY f.FacultyID, at.IsPrimary DESC, at.TestName
    `;
    const result = await query(sql, [universityId]);
    return result.recordset;
}

async function getAllAdmissionTests(filters = {}) {
    let sql = `
        SELECT at.AdmissionTestID, at.FacultyID, at.TestName, at.TotalMarks,
               at.TotalMarksText, at.IsPrimary, at.SubjectBreakdown,
               at.QuestionFormat, at.NegativeMarking, at.Notes,
               f.FacultyName, u.UniversityID, u.UniversityName, c.CityName
        FROM AdmissionTests at
        JOIN Faculties f ON at.FacultyID = f.FacultyID
        JOIN Universities u ON f.UniversityID = u.UniversityID
        JOIN Cities c ON u.CityID = c.CityID
        WHERE 1=1`;
    const params = [];
    if (filters.universityId) { sql += ' AND u.UniversityID = ?'; params.push(filters.universityId); }
    if (filters.facultyId) { sql += ' AND f.FacultyID = ?'; params.push(filters.facultyId); }
    if (filters.search) { sql += ` AND (at.TestName LIKE '%' + ? + '%' OR at.SubjectBreakdown LIKE '%' + ? + '%')`; params.push(filters.search, filters.search); }
    sql += ' ORDER BY c.CityName, u.UniversityName, f.FacultyName, at.IsPrimary DESC, at.TestName';
    const result = await query(sql, params);
    return result.recordset;
}

async function getAdmissionTestById(admissionTestId, facultyId) {
    const result = await query(
        'SELECT * FROM AdmissionTests WHERE AdmissionTestID = ? AND FacultyID = ?',
        [admissionTestId, facultyId]
    );
    return result.recordset[0] || null;
}

async function getAdmissionTestsByFaculty(facultyId) {
    const result = await query(
        `SELECT AdmissionTestID, FacultyID, TestName, TotalMarks, TotalMarksText,
                IsPrimary, SubjectBreakdown, QuestionFormat, NegativeMarking, Notes
         FROM AdmissionTests
         WHERE FacultyID = ?
         ORDER BY IsPrimary DESC, TestName`,
        [facultyId]
    );
    return result.recordset;
}

async function getProgramsByUniversity(universityId) {
    const sql = `
        SELECT p.ProgramID, p.ProgramName, p.MajorCategory,
               f.FacultyID, f.FacultyName, f.HostelStatus, f.SemesterFee, f.AggregateFormula, f.Duration, f.Semesters
        FROM Programs p
        JOIN Faculties f ON p.FacultyID = f.FacultyID
        WHERE f.UniversityID = ?
        ORDER BY p.MajorCategory, p.ProgramName
    `;
    const result = await query(sql, [universityId]);
    return result.recordset;
}

async function getProgramById(programId) {
    const sql = `
        SELECT p.ProgramID, p.ProgramName, p.MajorCategory,
               f.FacultyID, f.FacultyName, f.UniversityID,
               f.AggregateFormula, f.ApplicationMethod,
               u.UniversityName, u.Sector, c.CityName
        FROM Programs p
        JOIN Faculties f ON p.FacultyID = f.FacultyID
        JOIN Universities u ON f.UniversityID = u.UniversityID
        JOIN Cities c ON u.CityID = c.CityID
        WHERE p.ProgramID = ?
    `;
    const result = await query(sql, [programId]);
    return result.recordset[0] || null;
}

async function searchPrograms(filters = {}) {
    let sql = `SELECT * FROM ProgramSearchView WHERE 1=1`;
    const params = [];

    if (filters.programName || filters.search) {
        sql += ` AND ProgramName LIKE '%' + ? + '%'`;
        params.push(filters.programName || filters.search);
    }
    if (filters.majorCategory || filters.category) {
        sql += ` AND MajorCategory = ?`;
        params.push(filters.majorCategory || filters.category);
    }
    if (filters.cityName) {
        sql += ` AND CityName = ?`;
        params.push(filters.cityName);
    }
    if (filters.sector) {
        sql += ` AND Sector = ?`;
        params.push(filters.sector);
    }
    if (filters.hostelStatus) {
        sql += ` AND HostelStatus = ?`;
        params.push(filters.hostelStatus);
    }
    if (filters.universityId) {
        sql += ` AND UniversityID = ?`;
        params.push(filters.universityId);
    }

    sql += ` ORDER BY UniversityName, MajorCategory, ProgramName`;

    if (filters.limit) {
        const limit = parseInt(filters.limit, 10) || 50;
        const offset = parseInt(filters.offset, 10) || 0;
        sql += ` OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`;
        params.push(offset, limit);
    }

    const result = await query(sql, params);
    return result.recordset;
}

async function getMajorCategories() {
    const sql = `SELECT DISTINCT MajorCategory FROM Programs ORDER BY MajorCategory`;
    const result = await query(sql);
    return result.recordset;
}

async function getUniversitiesByCity(cityName) {
    const sql = `
        SELECT u.*, c.CityName,
               (SELECT COUNT(*) FROM Programs p JOIN Faculties f ON p.FacultyID = f.FacultyID WHERE f.UniversityID = u.UniversityID) as ProgramCount
        FROM Universities u
        JOIN Cities c ON u.CityID = c.CityID
        WHERE c.CityName = ?
        ORDER BY u.UniversityName
    `;
    const result = await query(sql, [cityName]);
    return result.recordset;
}

async function getHostelInfo(universityId) {
    const sql = `
        SELECT FacultyName, HostelStatus, HostelNote, Duration, Semesters
        FROM Faculties
        WHERE UniversityID = ? AND HostelStatus != 'Unspecified'
    `;
    const result = await query(sql, [universityId]);
    return result.recordset;
}

async function getFeeStructure(universityId) {
    const sql = `
        SELECT FacultyName, SemesterFee, Duration, Semesters
        FROM Faculties
        WHERE UniversityID = ?
        ORDER BY FacultyName
    `;
    const result = await query(sql, [universityId]);
    return result.recordset;
}

async function getAggregateFormula(facultyId) {
    const sql = `
        SELECT f.FacultyName, f.AggregateFormula, f.ApplicationMethod,
               u.UniversityName
        FROM Faculties f
        JOIN Universities u ON f.UniversityID = u.UniversityID
        WHERE f.FacultyID = ?
    `;
    const result = await query(sql, [facultyId]);
    return result.recordset[0] || null;
}

async function getAdmissionTestTypes() {
    const sql = `SELECT DISTINCT ApplicationMethod FROM Faculties WHERE ApplicationMethod IS NOT NULL ORDER BY ApplicationMethod`;
    const result = await query(sql);
    return result.recordset;
}

async function getMeritCutoffs(universityId) {
    const sql = `
        SELECT mc.*, p.ProgramName, u.UniversityName, c.CityName
        FROM UniversityMeritCutoffs mc
        LEFT JOIN Programs p ON mc.ProgramID = p.ProgramID
        LEFT JOIN Universities u ON mc.UniversityID = u.UniversityID
        LEFT JOIN Cities c ON mc.CityID = c.CityID
        WHERE mc.UniversityID = ?
        ORDER BY mc.AdmissionYear DESC, mc.ClosingMeritPercent DESC
    `;
    const result = await query(sql, [universityId]);
    return result.recordset;
}

async function getMeritCutoffsByProgram(programId) {
    const sql = `
        SELECT mc.*, u.UniversityName, c.CityName
        FROM UniversityMeritCutoffs mc
        LEFT JOIN Universities u ON mc.UniversityID = u.UniversityID
        LEFT JOIN Cities c ON mc.CityID = c.CityID
        WHERE mc.ProgramID = ?
        ORDER BY mc.AdmissionYear DESC
    `;
    const result = await query(sql, [programId]);
    return result.recordset;
}

function getTestRoute(testName) {
    const normalized = String(testName || '').toUpperCase();
    if (/\bSAT\b/.test(normalized)) return 'SAT';
    if (/\bNAT\b/.test(normalized)) return 'NAT';
    if (/\bNU\b/.test(normalized)) return 'NU';
    return null;
}

function cutoffFromNotes(notes, route) {
    if (!notes || !route) return null;
    const match = String(notes).match(new RegExp(`(?:^|\\|)\\s*${route}\\s*[:=-]?\\s*(\\d+(?:\\.\\d+)?)`, 'i'));
    return match ? Number(match[1]) : null;
}

async function getLatestCutoffForProgram(programId, testName = null, strictTestBasis = false) {
    const sql = `
        SELECT TOP 12 mc.MeritCutoffID, mc.ProgramID, mc.UniversityID,
               mc.AdmissionYear, mc.SessionName, mc.ClosingMeritPercent,
               mc.MeritListRound, mc.MeritStatus, mc.CategoryTestBasis, mc.Notes
        FROM UniversityMeritCutoffs mc
        WHERE mc.ProgramID = ?
        ORDER BY mc.AdmissionYear DESC, mc.MeritCutoffID DESC
    `;
    const result = await query(sql, [programId]);
    const rows = result.recordset;
    const route = getTestRoute(testName);

    if (strictTestBasis && route) {
        for (const row of rows) {
            const noteCutoff = cutoffFromNotes(row.Notes, route);
            if (Number.isFinite(noteCutoff)) {
                return { ...row, ResolvedCutoff: noteCutoff, CutoffBasis: route };
            }
            const basis = String(row.CategoryTestBasis || '').toUpperCase();
            const closing = row.ClosingMeritPercent == null ? null : Number(row.ClosingMeritPercent);
            if (route === 'NU' && /\bNU\b/.test(basis) && Number.isFinite(closing)) {
                return { ...row, ResolvedCutoff: closing, CutoffBasis: 'NU' };
            }
        }
        return null;
    }

    const latest = rows.find(row => row.ClosingMeritPercent != null && Number.isFinite(Number(row.ClosingMeritPercent)));
    return latest ? { ...latest, ResolvedCutoff: Number(latest.ClosingMeritPercent), CutoffBasis: latest.CategoryTestBasis } : null;
}

async function getAllMeritCutoffs(filters = {}) {
    let sql = `
        SELECT mc.MeritCutoffID, mc.UniversityNameSource, mc.ProgramNameSource, 
               mc.AdmissionYear, mc.CategoryTestBasis, mc.ClosingMeritPercent,
               mc.MeritListRound, mc.MeritStatus, mc.Notes,
               u.UniversityID, c.CityName
        FROM UniversityMeritCutoffs mc
        LEFT JOIN Universities u ON mc.UniversityID = u.UniversityID
        LEFT JOIN Cities c ON mc.CityID = c.CityID
        WHERE 1=1
    `;
    const params = [];

    if (filters.universityId) {
        sql += ` AND mc.UniversityID = ?`;
        params.push(filters.universityId);
    }
    if (filters.city) {
        sql += ` AND c.CityName = ?`;
        params.push(filters.city);
    }
    if (filters.year) {
        sql += ` AND mc.AdmissionYear = ?`;
        params.push(filters.year);
    }
    if (filters.program) {
        sql += ` AND mc.ProgramNameSource LIKE '%' + ? + '%'`;
        params.push(filters.program);
    }

    sql += ` ORDER BY mc.AdmissionYear DESC, mc.UniversityNameSource, mc.ClosingMeritPercent DESC`;

    if (filters.limit) {
        const limit = parseInt(filters.limit, 10) || 50;
        const offset = parseInt(filters.offset, 10) || 0;
        sql += ` OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`;
        params.push(offset, limit);
    }

    const result = await query(sql, params);
    return result.recordset;
}

async function getAvgCutoffForUniversity(universityId) {
    const sql = `
        SELECT AVG(ClosingMeritPercent) as AvgCutOff, COUNT(*) as DataPoints
        FROM UniversityMeritCutoffs
        WHERE UniversityID = ? AND ClosingMeritPercent IS NOT NULL
    `;
    const result = await query(sql, [universityId]);
    return result.recordset[0] || null;
}

function parseAggregateFormula(formulaText) {
    if (!formulaText) return { isHolistic: true, weights: [] };

    const lowerText = formulaText.toLowerCase();
    
    // Check for holistic buzzwords first
    if (lowerText.includes('holistic') || lowerText.includes('interview') || 
        lowerText.includes('essay') || lowerText.includes('extracurriculars')) {
        return { isHolistic: true, weights: [] };
    }

    // Keep one applicable route only. Several source descriptions include an
    // alternate A-Level formula, a historical merit note, or an eligibility
    // percentage after the actual aggregate formula. Those numbers are not
    // additional weights and must not be added to the student's aggregate.
    let calculationText = formulaText;
    const academicRecordBreakdown = calculationText.match(
        /Academic Record\s*50\s*%\s*\(([^)]+)\)\s*\+\s*(.+)/i
    );
    if (academicRecordBreakdown) {
        calculationText = `${academicRecordBreakdown[1]} + ${academicRecordBreakdown[2]}`;
    }
    calculationText = calculationText
        .split(';')[0]
        .split('—')[0]
        .replace(/\([^()]*\d+(?:\.\d+)?\s*%[^()]*\)/g, '')
        .trim();

    const weights = [];
    // Match something like "Matric 10%" or "Matric(SSC) 10%"
    // Capture group 1: Component Name, Group 2: Percentage
    // Slashes are part of common component labels such as Matric/O-Level,
    // Intermediate/equivalent, and NAT/BCAT. Keeping them in the captured
    // label ensures those required calculator fields are classified correctly.
    const regex = /([a-zA-Z\(\)\/\-\s]+?)\s*(\d+(?:\.\d+)?)\s*%/g;
    let match;
    let totalWeightFound = 0;

    while ((match = regex.exec(calculationText)) !== null) {
        let componentName = match[1].trim();
        let weightPercentage = parseFloat(match[2]);
        let componentType = 'other';
        let lowerName = componentName.toLowerCase();

        // Check HSSC/FSc before SSC: "HSSC" contains the letters "ssc".
        if (lowerName.match(/fsc|hssc|intermediate|inter|a-level/)) {
            componentType = 'intermediate';
        } else if (lowerName.match(/matric|ssc|matriculation/)) {
            componentType = 'matric';
        } else if (lowerName.match(/test|cbt|ecat|net|nat|npt|mdcat|sat|act|nts|nums|lcats/)) {
            componentType = 'entry_test';
        }

        weights.push({
            ComponentName: componentName,
            WeightPercentage: weightPercentage,
            ComponentType: componentType
        });
        
        totalWeightFound += weightPercentage;
    }

    if (weights.length === 0 || totalWeightFound > 100.01) {
        return { isHolistic: true, weights: [] };
    }

    return { isHolistic: false, weights: weights };
}

async function getFacultyById(facultyId) {
    const sql = `
        SELECT f.*, u.UniversityName, u.Sector, c.CityName
        FROM Faculties f
        JOIN Universities u ON f.UniversityID = u.UniversityID
        JOIN Cities c ON u.CityID = c.CityID
        WHERE f.FacultyID = ?
    `;
    const result = await query(sql, [facultyId]);
    return result.recordset[0] || null;
}

async function getAllUniversitiesForDropdown() {
    const sql = `
        SELECT u.UniversityID, u.UniversityName, u.Sector, c.CityName,
               (SELECT COUNT(*) FROM Faculties f WHERE f.UniversityID = u.UniversityID) as FacultyCount,
               (SELECT COUNT(*) FROM Programs p JOIN Faculties f ON p.FacultyID = f.FacultyID WHERE f.UniversityID = u.UniversityID) as ProgramCount
        FROM Universities u
        JOIN Cities c ON u.CityID = c.CityID
        ORDER BY c.CityName, u.UniversityName
    `;
    const result = await query(sql);
    return result.recordset;
}

module.exports = {
    getUniversities,
    getUniversityById,
    getFacultiesByUniversity,
    getProgramsByUniversity,
    getProgramById,
    searchPrograms,
    getMajorCategories,
    getUniversitiesByCity,
    getHostelInfo,
    getFeeStructure,
    getAggregateFormula,
    getAdmissionTestTypes,
    getMeritCutoffs,
    getMeritCutoffsByProgram,
    getLatestCutoffForProgram,
    getAllMeritCutoffs,
    getAvgCutoffForUniversity,
    parseAggregateFormula,
    getFacultyById,
    getAllUniversitiesForDropdown
    ,getAdmissionTestsByUniversity
    ,getAllAdmissionTests
    ,getAdmissionTestById
    ,getAdmissionTestsByFaculty
};
