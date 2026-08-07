const express = require('express');
const router = express.Router();
const { getAllMeritCutoffs, getMeritCutoffs, getMeritCutoffsByProgram } = require('../services/universityService');

// GET /api/merit-cutoffs - Get all merit cutoffs with filters
router.get('/', async (req, res) => {
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
        console.error('Error fetching merit cutoffs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch merit cutoffs' });
    }
});

// GET /api/merit-cutoffs/university/:id
router.get('/university/:id', async (req, res) => {
    try {
        const cutoffs = await getMeritCutoffs(req.params.id);
        res.json({ success: true, count: cutoffs.length, data: cutoffs });
    } catch (error) {
        console.error('Error fetching merit cutoffs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch merit cutoffs' });
    }
});

// GET /api/merit-cutoffs/program/:id
router.get('/program/:id', async (req, res) => {
    try {
        const cutoffs = await getMeritCutoffsByProgram(req.params.id);
        res.json({ success: true, count: cutoffs.length, data: cutoffs });
    } catch (error) {
        console.error('Error fetching merit cutoffs:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch merit cutoffs' });
    }
});

module.exports = router;
