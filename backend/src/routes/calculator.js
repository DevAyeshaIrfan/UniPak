const express = require('express');
const router = express.Router();
const { calculateAggregate, predictChance, generateRecommendation } = require('../services/calculatorService');
const universityService = require('../services/universityService');
const { isValidId } = require('../middleware/validation');
const MAX_FACULTY_SELECTIONS = 256;

function isNumericValue(value) {
    return (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) &&
        Number.isFinite(Number(value)) && Number(value) === Number.parseFloat(value);
}

function isValidMarkPair(marks, total) {
    return isNumericValue(marks) && isNumericValue(total) &&
        Number(marks) >= 0 && Number(total) > 0 && Number(marks) <= Number(total);
}

function hasValidAcademicMarks({ matricMarks, matricTotal, intermediateMarks, intermediateTotal }) {
    return isValidMarkPair(matricMarks, matricTotal) &&
        isValidMarkPair(intermediateMarks, intermediateTotal);
}

function predictionStatus(aggregate, cutoff) {
    if (!Number.isFinite(aggregate)) return { code: 'holistic', label: 'Holistic review', tone: 'neutral' };
    if (!Number.isFinite(cutoff)) return { code: 'no-cutoff', label: 'Cutoff unavailable', tone: 'neutral' };

    const margin = Number((aggregate - cutoff).toFixed(2));
    if (margin >= 3) return { code: 'above', label: 'Above recent cutoff', tone: 'positive', margin };
    if (margin >= 0) return { code: 'competitive', label: 'Competitive', tone: 'positive', margin };
    if (margin >= -3) return { code: 'reach', label: 'Close to cutoff', tone: 'warning', margin };
    return { code: 'below', label: 'Below recent cutoff', tone: 'negative', margin };
}

function chanceFromMargin(margin) {
    if (!Number.isFinite(margin)) return null;
    const estimate = Math.round(100 / (1 + Math.exp(-0.5 * margin)));
    return Math.max(5, Math.min(95, estimate));
}

async function buildProgramPrediction(programId, profile = {}) {
    if (!isValidId(programId)) {
        const error = new Error('Select a program for both universities');
        error.status = 400;
        throw error;
    }
    if (!profile || typeof profile !== 'object' || Array.isArray(profile) || !hasValidAcademicMarks(profile)) {
        const error = new Error('Provide valid Matric and Intermediate marks and totals for both programs');
        error.status = 400;
        throw error;
    }

    const program = await universityService.getProgramById(programId);
    if (!program) {
        const error = new Error('One or both programs were not found');
        error.status = 404;
        throw error;
    }

    const parsedFormula = universityService.parseAggregateFormula(program.AggregateFormula);
    const acceptedTests = await universityService.getAdmissionTestsByFaculty(program.FacultyID);
    const requiresTest = acceptedTests.length > 0 || parsedFormula.weights.some(weight => weight.ComponentType === 'entry_test');
    let selectedTest = null;
    let entryTestScore = null;
    let entryTestTotal = null;

    if (requiresTest) {
        selectedTest = isValidId(profile.admissionTestId)
            ? await universityService.getAdmissionTestById(profile.admissionTestId, program.FacultyID)
            : null;
        if (!selectedTest) {
            const error = new Error(`Select an accepted entry test for ${program.ProgramName}`);
            error.status = 400;
            throw error;
        }
        if (!isValidMarkPair(profile.entryTestScore, selectedTest.TotalMarks == null ? profile.entryTestTotal : selectedTest.TotalMarks)) {
            const error = new Error(`Provide valid ${selectedTest.TestName} marks for ${program.ProgramName}`);
            error.status = 400;
            throw error;
        }
        entryTestScore = Number(profile.entryTestScore);
        entryTestTotal = selectedTest.TotalMarks == null
            ? Number(profile.entryTestTotal)
            : Number(selectedTest.TotalMarks);
    }

    const result = await calculateAggregate(program.FacultyID, {
        matricMarks: Number(profile.matricMarks),
        matricTotal: Number(profile.matricTotal),
        intermediateMarks: Number(profile.intermediateMarks),
        intermediateTotal: Number(profile.intermediateTotal),
        entryTestScore,
        entryTestTotal
    });
    const usesTestSpecificCutoffs = /FAST-NUCES/i.test(program.UniversityName);
    const cutoffRecord = await universityService.getLatestCutoffForProgram(
        program.ProgramID,
        selectedTest?.TestName,
        usesTestSpecificCutoffs
    );
    const aggregateScore = result && !result.isHolistic ? Number(result.aggregateScore) : null;
    const cutoff = cutoffRecord && Number.isFinite(Number(cutoffRecord.ResolvedCutoff))
        ? Number(cutoffRecord.ResolvedCutoff)
        : null;
    const status = predictionStatus(aggregateScore, cutoff);
    const chancePercent = chanceFromMargin(status.margin);

    return {
        programId: program.ProgramID,
        programName: program.ProgramName,
        majorCategory: program.MajorCategory,
        facultyId: program.FacultyID,
        facultyName: program.FacultyName,
        universityId: program.UniversityID,
        universityName: program.UniversityName,
        cityName: program.CityName,
        sector: program.Sector,
        aggregateFormula: program.AggregateFormula,
        applicationMethod: program.ApplicationMethod,
        selectedTest: selectedTest ? {
            admissionTestId: selectedTest.AdmissionTestID,
            testName: selectedTest.TestName,
            totalMarks: entryTestTotal
        } : null,
        result,
        aggregateScore,
        cutoff,
        cutoffYear: cutoffRecord?.AdmissionYear ?? null,
        cutoffSession: cutoffRecord?.SessionName ?? null,
        cutoffRound: cutoffRecord?.MeritListRound ?? null,
        cutoffBasis: cutoffRecord?.CutoffBasis ?? null,
        margin: status.margin ?? null,
        chancePercent,
        status
    };
}

function buildProgramRecommendation(first, second) {
    const scored = [first, second].filter(item => Number.isFinite(item.margin));
    if (!scored.length) {
        return 'A program-specific closing merit is not available for these selections. Compare the calculated aggregates and confirm the latest merit list with each university.';
    }
    if (scored.length === 1) {
        const only = scored[0];
        const other = only === first ? second : first;
        const position = only.margin >= 0 ? 'above' : 'below';
        return `${only.programName} at ${only.universityName} is ${position} its latest recorded cutoff by ${Math.abs(only.margin).toFixed(2)}%. A linked program cutoff is not yet available for ${other.programName} at ${other.universityName}.`;
    }
    const best = [...scored].sort((a, b) => b.margin - a.margin)[0];
    if (best.margin >= 0) {
        return `${best.programName} at ${best.universityName} is the stronger position based on your aggregate versus its latest recorded closing merit.`;
    }
    return 'Both aggregates are below their latest recorded closing merits. Treat both as reach options and keep additional programs as backups.';
}

// GET /api/calculator
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'UniPak Aggregate Calculator API',
        endpoints: {
            universities: 'GET /api/calculator/universities',
            faculties: 'GET /api/calculator/faculties/:universityId',
            calculate: 'POST /api/calculator/calculate',
            compare: 'POST /api/calculator/compare'
        }
    });
});

// GET /api/calculator/universities
router.get('/universities', async (req, res) => {
    try {
        const universities = await universityService.getAllUniversitiesForDropdown();
        res.json({ success: true, count: universities.length, data: universities });
    } catch (error) {
        console.error('Error fetching universities for calculator:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch universities' });
    }
});

// GET /api/calculator/faculties/:universityId
router.get('/faculties/:universityId', async (req, res) => {
    try {
        const faculties = await universityService.getFacultiesByUniversity(req.params.universityId);
        const facultiesWithWeights = faculties.map(f => {
            const parsed = universityService.parseAggregateFormula(f.AggregateFormula);
            return {
                ...f,
                structuredWeights: parsed.weights || [],
                isHolistic: parsed.isHolistic || false
            };
        });
        res.json({ success: true, data: facultiesWithWeights });
    } catch (error) {
        console.error('Error fetching faculties for calculator:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch faculties' });
    }
});

// POST /api/calculator/calculate
router.post('/calculate', async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({ success: false, error: 'Provide valid calculator inputs' });
        }
        const { facultyIds, matricMarks, matricTotal, intermediateMarks, intermediateTotal, entryTestScore, entryTestTotal, entryTestSelections = [] } = req.body;

        // Validate
        if (!hasValidAcademicMarks({ matricMarks, matricTotal, intermediateMarks, intermediateTotal })) {
            return res.status(400).json({ success: false, error: 'Provide valid Matric and Intermediate marks and totals' });
        }
        if (!facultyIds || !Array.isArray(facultyIds) || facultyIds.length === 0) {
            return res.status(400).json({ success: false, error: 'At least one faculty must be selected' });
        }

        if (facultyIds.length > MAX_FACULTY_SELECTIONS) {
            return res.status(400).json({ success: false, error: `Select at most ${MAX_FACULTY_SELECTIONS} faculties per request` });
        }
        if (!facultyIds.every(isValidId)) {
            return res.status(400).json({ success: false, error: 'Provide valid faculty IDs' });
        }
        if (!Array.isArray(entryTestSelections) || entryTestSelections.length > MAX_FACULTY_SELECTIONS ||
            !entryTestSelections.every(item => item && typeof item === 'object' && !Array.isArray(item) &&
                isValidId(item.facultyId) && isValidId(item.admissionTestId) && isNumericValue(item.score) &&
                (item.total == null || isValidMarkPair(item.score, item.total)))) {
            return res.status(400).json({ success: false, error: 'Provide valid entry-test selections' });
        }

        const baseStudentData = {
            matricMarks: parseFloat(matricMarks),
            matricTotal: parseFloat(matricTotal),
            intermediateMarks: parseFloat(intermediateMarks),
            intermediateTotal: parseFloat(intermediateTotal),
            entryTestScore: entryTestScore == null ? null : Number.parseFloat(entryTestScore),
            entryTestTotal: entryTestTotal ? parseFloat(entryTestTotal) : null
        };

        if ((entryTestScore !== undefined || entryTestTotal !== undefined) && !isValidMarkPair(entryTestScore, entryTestTotal)) {
            return res.status(400).json({ success: false, error: 'Provide valid entry-test marks and total, or omit both' });
        }

        const results = [];
        for (const facultyId of new Set(facultyIds.map(Number))) {
            const faculty = await universityService.getFacultyById(facultyId);
            if (!faculty) continue;

            const parsed = universityService.parseAggregateFormula(faculty.AggregateFormula);
            const requiresTest = parsed.weights.some(weight => weight.ComponentType === 'entry_test');
            const selection = entryTestSelections.find(item => Number(item.facultyId) === Number(facultyId));
            let selectedTest = null;
            let facultyStudentData = { ...baseStudentData };
            if (selection) {
                selectedTest = await universityService.getAdmissionTestById(selection.admissionTestId, facultyId);
                if (!selectedTest) return res.status(400).json({ success: false, error: `Invalid admission test selection for faculty ${facultyId}` });
                const selectedTotal = Number(selectedTest.TotalMarks);
                const suppliedTotal = selection.total != null ? Number(selection.total) : selectedTotal;
                if (!isValidMarkPair(selection.score, suppliedTotal)) {
                    return res.status(400).json({ success: false, error: `Provide valid ${selectedTest.TestName} marks` });
                }
                facultyStudentData.entryTestScore = Number(selection.score);
                facultyStudentData.entryTestTotal = suppliedTotal;
            }
            if (requiresTest && !isValidMarkPair(facultyStudentData.entryTestScore, facultyStudentData.entryTestTotal)) {
                return res.status(400).json({ success: false, error: `Select a test and enter valid marks for ${faculty.FacultyName}` });
            }

            const result = await calculateAggregate(facultyId, facultyStudentData);

            // Get avg cutoff from UniversityMeritCutoffs
            const cutoffData = await universityService.getAvgCutoffForUniversity(faculty.UniversityID);
            const avgCutoff = cutoffData ? cutoffData.AvgCutOff : null;

            let chancePercent = null;
            if (result && !result.isHolistic && avgCutoff) {
                chancePercent = predictChance(result.aggregateScore, avgCutoff);
            }

            results.push({
                facultyId: parseInt(facultyId),
                facultyName: faculty.FacultyName,
                universityId: faculty.UniversityID,
                universityName: faculty.UniversityName,
                cityName: faculty.CityName,
                sector: faculty.Sector,
                aggregateFormula: faculty.AggregateFormula,
                applicationMethod: faculty.ApplicationMethod,
                selectedTest,
                result,
                minRequired: avgCutoff,
                chancePercent
            });
        }

        res.json({
            success: true,
            studentData: {
                matricMarks: baseStudentData.matricMarks,
                matricTotal: baseStudentData.matricTotal,
                matricPercentage: Math.round((baseStudentData.matricMarks / baseStudentData.matricTotal) * 100 * 100) / 100,
                intermediateMarks: baseStudentData.intermediateMarks,
                intermediateTotal: baseStudentData.intermediateTotal,
                intermediatePercentage: Math.round((baseStudentData.intermediateMarks / baseStudentData.intermediateTotal) * 100 * 100) / 100
            },
            results
        });
    } catch (error) {
        console.error('Error calculating aggregate:', error);
        res.status(500).json({ success: false, error: 'Failed to calculate aggregate' });
    }
});

// POST /api/calculator/compare
router.post('/compare', async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({ success: false, error: 'Provide valid calculator inputs' });
        }
        const { programId1, programId2, profile1, profile2 } = req.body;
        if (programId1 || programId2 || profile1 || profile2) {
            if (!isValidId(programId1) || !isValidId(programId2)) {
                return res.status(400).json({ success: false, error: 'Select a program for both universities' });
            }
            if (Number(programId1) === Number(programId2)) {
                return res.status(400).json({ success: false, error: 'Choose two different programs to compare' });
            }
            const [university1, university2] = await Promise.all([
                buildProgramPrediction(programId1, profile1),
                buildProgramPrediction(programId2, profile2)
            ]);
            if (Number(university1.universityId) === Number(university2.universityId)) {
                return res.status(400).json({ success: false, error: 'Choose programs from two different universities' });
            }
            return res.json({
                success: true,
                comparison: {
                    university1,
                    university2,
                    recommendation: buildProgramRecommendation(university1, university2)
                }
            });
        }

        const { facultyId1, facultyId2, matricMarks, matricTotal, intermediateMarks, intermediateTotal, entryTestScore, entryTestTotal } = req.body;

        // Validate
        if (!hasValidAcademicMarks({ matricMarks, matricTotal, intermediateMarks, intermediateTotal })) {
            return res.status(400).json({ success: false, error: 'Provide valid Matric and Intermediate marks and totals' });
        }
        if (!isValidId(facultyId1) || !isValidId(facultyId2)) {
            return res.status(400).json({ success: false, error: 'Two faculties required' });
        }
        if (Number(facultyId1) === Number(facultyId2)) {
            return res.status(400).json({ success: false, error: 'Choose two different faculties to compare' });
        }

        const studentData = {
            matricMarks: parseFloat(matricMarks),
            matricTotal: parseFloat(matricTotal),
            intermediateMarks: parseFloat(intermediateMarks),
            intermediateTotal: parseFloat(intermediateTotal),
            entryTestScore: entryTestScore == null ? null : Number.parseFloat(entryTestScore),
            entryTestTotal: entryTestTotal ? parseFloat(entryTestTotal) : null
        };

        if ((entryTestScore !== undefined || entryTestTotal !== undefined) && !isValidMarkPair(entryTestScore, entryTestTotal)) {
            return res.status(400).json({ success: false, error: 'Provide valid entry-test marks and total, or omit both' });
        }

        const faculty1 = await universityService.getFacultyById(facultyId1);
        const faculty2 = await universityService.getFacultyById(facultyId2);
        if (!faculty1 || !faculty2) {
            return res.status(404).json({ success: false, error: 'One or both faculties not found' });
        }

        const result1 = await calculateAggregate(facultyId1, studentData);
        const result2 = await calculateAggregate(facultyId2, studentData);

        const cutoff1 = await universityService.getAvgCutoffForUniversity(faculty1.UniversityID);
        const cutoff2 = await universityService.getAvgCutoffForUniversity(faculty2.UniversityID);
        const avgCutoff1 = cutoff1 ? cutoff1.AvgCutOff : null;
        const avgCutoff2 = cutoff2 ? cutoff2.AvgCutOff : null;

        const chance1 = (result1 && !result1.isHolistic && avgCutoff1) ? predictChance(result1.aggregateScore, avgCutoff1) : null;
        const chance2 = (result2 && !result2.isHolistic && avgCutoff2) ? predictChance(result2.aggregateScore, avgCutoff2) : null;

        const recommendation = generateRecommendation({
            aggregate1: result1 && !result1.isHolistic ? result1.aggregateScore : null,
            aggregate2: result2 && !result2.isHolistic ? result2.aggregateScore : null,
            chance1, chance2,
            university1: faculty1,
            university2: faculty2,
            avgCutoff1, avgCutoff2
        });

        res.json({
            success: true,
            comparison: {
                university1: {
                    facultyId: parseInt(facultyId1),
                    facultyName: faculty1.FacultyName,
                    universityId: faculty1.UniversityID,
                    universityName: faculty1.UniversityName,
                    cityName: faculty1.CityName,
                    sector: faculty1.Sector,
                    aggregateFormula: faculty1.AggregateFormula,
                    applicationMethod: faculty1.ApplicationMethod,
                    result: result1,
                    aggregateScore: result1 && !result1.isHolistic ? result1.aggregateScore : null,
                    minCutoff: avgCutoff1,
                    chancePercent: chance1
                },
                university2: {
                    facultyId: parseInt(facultyId2),
                    facultyName: faculty2.FacultyName,
                    universityId: faculty2.UniversityID,
                    universityName: faculty2.UniversityName,
                    cityName: faculty2.CityName,
                    sector: faculty2.Sector,
                    aggregateFormula: faculty2.AggregateFormula,
                    applicationMethod: faculty2.ApplicationMethod,
                    result: result2,
                    aggregateScore: result2 && !result2.isHolistic ? result2.aggregateScore : null,
                    minCutoff: avgCutoff2,
                    chancePercent: chance2
                },
                recommendation,
                verdict: chance1 && chance2 ? (
                    chance1 > chance2 ? faculty1.UniversityName :
                    chance2 > chance1 ? faculty2.UniversityName : 'Both are equally viable'
                ) : 'Predictive analysis not available for holistic review universities'
            }
        });
    } catch (error) {
        console.error('Error comparing universities:', error);
        res.status(error.status || 500).json({ success: false, error: error.status ? error.message : 'Failed to compare universities' });
    }
});

module.exports = router;
