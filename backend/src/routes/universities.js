const express = require('express');
const router = express.Router();
const { 
    getUniversities, 
    getUniversityById, 
    getFacultiesByUniversity, 
    getProgramsByUniversity,
    searchPrograms, 
    getMajorCategories, 
    getUniversitiesByCity,
    getHostelInfo, 
    getFeeStructure, 
    getAggregateFormula, 
    getAdmissionTestTypes,
    getMeritCutoffs,
    getMeritCutoffsByProgram,
    getAllMeritCutoffs,
    getAvgCutoffForUniversity,
    parseAggregateFormula,
    getFacultyById,
    getAllUniversitiesForDropdown
} = require('../services/universityService');
const { query } = require('../config/database');
const { validateQuery } = require('../middleware/validation');

// GET /api/universities
router.get('/', validateQuery({ city: 'text', sector: 'text', search: 'text' }), async (req, res) => {
    try {
        const filters = {
            city: req.query.city,
            sector: req.query.sector,
            search: req.query.search
        };
        const universities = await getUniversities(filters);
        res.json({ success: true, count: universities.length, data: universities });
    } catch (error) {
        console.error('Error fetching universities:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch universities' });
    }
});

// GET /api/universities/dropdown
router.get('/dropdown', async (req, res) => {
    try {
        const universities = await getAllUniversitiesForDropdown();
        res.json({ success: true, count: universities.length, data: universities });
    } catch (error) {
        console.error('Error fetching universities for dropdown:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch universities' });
    }
});

// GET /api/universities/cities
router.get('/cities', async (req, res) => {
    try {
        const result = await query('SELECT * FROM Cities ORDER BY CityName');
        res.json({ success: true, count: result.recordset.length, data: result.recordset });
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch cities' });
    }
});

// GET /api/universities/city/:cityName
router.get('/city/:cityName', async (req, res) => {
    try {
        const universities = await getUniversitiesByCity(req.params.cityName);
        res.json({ success: true, count: universities.length, data: universities });
    } catch (error) {
        console.error('Error fetching universities by city:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch universities for city' });
    }
});

// GET /api/universities/admission-tests
router.get('/admission-tests', async (req, res) => {
    try {
        const testTypes = await getAdmissionTestTypes();
        res.json({ success: true, count: testTypes.length, data: testTypes });
    } catch (error) {
        console.error('Error fetching admission tests:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch admission tests' });
    }
});

// GET /api/universities/test-breakdowns
router.get('/test-breakdowns', validateQuery({ universityId: 'id', facultyId: 'id', search: 'text' }), async (req, res) => {
    try {
        const tests = await require('../services/universityService').getAllAdmissionTests({
            universityId: req.query.universityId ? parseInt(req.query.universityId, 10) : undefined,
            facultyId: req.query.facultyId ? parseInt(req.query.facultyId, 10) : undefined,
            search: req.query.search
        });
        res.json({ success: true, count: tests.length, data: tests });
    } catch (error) {
        console.error('Error fetching test breakdowns:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch test breakdowns' });
    }
});

// GET /api/universities/programs/search
router.get('/programs/search', validateQuery({ search: 'text', category: 'text', city: 'text', sector: 'text', hostel: 'text', universityId: 'id', limit: 'id', offset: 'offset' }), async (req, res) => {
    try {
        const filters = {
            search: req.query.search,
            category: req.query.category,
            cityName: req.query.city,
            sector: req.query.sector,
            hostelStatus: req.query.hostel,
            universityId: req.query.universityId ? parseInt(req.query.universityId, 10) : undefined,
            limit: req.query.limit,
            offset: req.query.offset
        };
        const programs = await searchPrograms(filters);
        res.json({ success: true, count: programs.length, data: programs });
    } catch (error) {
        console.error('Error searching programs:', error);
        res.status(500).json({ success: false, error: 'Failed to search programs' });
    }
});

// GET /api/universities/programs/categories
router.get('/programs/categories', async (req, res) => {
    try {
        const categories = await getMajorCategories();
        res.json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch program categories' });
    }
});

// GET /api/universities/merit-cutoffs
router.get('/merit-cutoffs', validateQuery({ universityId: 'id', city: 'text', year: 'year', program: 'text' }), async (req, res) => {
    try {
        const filters = {
            universityId: req.query.universityId ? parseInt(req.query.universityId) : undefined,
            city: req.query.city,
            year: req.query.year ? parseInt(req.query.year) : undefined,
            program: req.query.program
        };
        const cutoffs = await getAllMeritCutoffs(filters);
        res.json({ success: true, count: cutoffs.length, data: cutoffs });
    } catch (error) {
        console.error('Error fetching all merit cutoffs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch merit cutoffs' });
    }
});

// GET /api/universities/faculties/:id/aggregate-formula
router.get('/faculties/:id/aggregate-formula', async (req, res) => {
    try {
        const formula = await getAggregateFormula(req.params.id);
        if (!formula) return res.status(404).json({ success: false, error: 'Faculty not found' });
        const structuredWeights = parseAggregateFormula(formula.AggregateFormula);
        res.json({ success: true, data: { ...formula, structuredWeights } });
    } catch (error) {
        console.error('Error fetching aggregate formula:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch aggregate formula' });
    }
});

// GET /api/universities/:id
router.get('/:id', async (req, res) => {
    try {
        const university = await getUniversityById(req.params.id);
        if (!university) {
            return res.status(404).json({ success: false, error: 'University not found' });
        }
        res.json({ success: true, data: university });
    } catch (error) {
        console.error('Error fetching university:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch university details' });
    }
});

// GET /api/universities/:id/faculties
router.get('/:id/faculties', async (req, res) => {
    try {
        const faculties = await getFacultiesByUniversity(req.params.id);
        res.json({ success: true, count: faculties.length, data: faculties });
    } catch (error) {
        console.error('Error fetching faculties:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch faculties' });
    }
});

router.get('/:id/admission-tests', async (req, res) => {
    try {
        const tests = await require('../services/universityService').getAdmissionTestsByUniversity(req.params.id);
        res.json({ success: true, count: tests.length, data: tests });
    } catch (error) {
        console.error('Error fetching university admission tests:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch admission tests' });
    }
});

// GET /api/universities/:id/programs
router.get('/:id/programs', async (req, res) => {
    try {
        const programs = await getProgramsByUniversity(req.params.id);
        res.json({ success: true, count: programs.length, data: programs });
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch programs' });
    }
});

// GET /api/universities/:id/fee-structure
router.get('/:id/fee-structure', async (req, res) => {
    try {
        const feeStructure = await getFeeStructure(req.params.id);
        res.json({ success: true, count: feeStructure.length, data: feeStructure });
    } catch (error) {
        console.error('Error fetching fee structure:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch fee structure' });
    }
});

// GET /api/universities/:id/hostels
router.get('/:id/hostels', async (req, res) => {
    try {
        const hostels = await getHostelInfo(req.params.id);
        res.json({ success: true, count: hostels.length, data: hostels });
    } catch (error) {
        console.error('Error fetching hostels:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch hostel information' });
    }
});

// GET /api/universities/:id/merit-cutoffs
router.get('/:id/merit-cutoffs', validateQuery({ year: 'year' }), async (req, res) => {
    try {
        const cutoffs = await getMeritCutoffs(req.params.id);
        let filtered = cutoffs;
        if (req.query.year) {
            filtered = cutoffs.filter(c => c.AdmissionYear == req.query.year);
        }
        res.json({ success: true, count: filtered.length, data: filtered });
    } catch (error) {
        console.error('Error fetching merit cutoffs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch merit cutoffs' });
    }
});

module.exports = router;
