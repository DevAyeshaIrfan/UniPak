const universityService = require('./universityService');

async function calculateAggregate(facultyId, studentData) {
    // 1. Get the faculty
    const faculty = await universityService.getFacultyById(facultyId);
    if (!faculty) {
        throw new Error('Faculty not found');
    }

    // 2. Parse the formula
    const parsedFormula = universityService.parseAggregateFormula(faculty.AggregateFormula);

    // 3. If holistic, return holistic response
    if (parsedFormula.isHolistic) {
        return {
            isHolistic: true,
            aggregateScore: null,
            weights: [],
            breakdown: []
        };
    }

    // 4. Calculate weighted aggregate using the parsed weights
    let aggregateScore = 0;
    const breakdown = [];

    const scores = {
        matric: studentData.matricMarks / studentData.matricTotal * 100,
        intermediate: studentData.intermediateMarks / studentData.intermediateTotal * 100,
        entry_test: studentData.entryTestScore !== null && studentData.entryTestTotal !== null
            ? studentData.entryTestScore / studentData.entryTestTotal * 100
            : null
    };

    parsedFormula.weights.forEach(weight => {
        let studentScore = 0;
        if (scores[weight.ComponentType] !== undefined && scores[weight.ComponentType] !== null) {
            studentScore = scores[weight.ComponentType];
        }

        const weightedContribution = (studentScore * weight.WeightPercentage) / 100;
        aggregateScore += weightedContribution;

        breakdown.push({
            component: weight.ComponentName,
            percentage: weight.WeightPercentage,
            yourScore: studentScore,
            weightedContribution: parseFloat(weightedContribution.toFixed(2))
        });
    });

    return {
        isHolistic: false,
        aggregateScore: parseFloat(aggregateScore.toFixed(2)),
        weights: parsedFormula.weights.map(w => ({
            component: w.ComponentName,
            weight: w.WeightPercentage,
            type: w.ComponentType
        })),
        breakdown: breakdown
    };
}

function predictChance(aggregateScore, avgCutoff) {
    if (!aggregateScore || !avgCutoff) {
        return 'Unknown';
    }
    
    const diff = aggregateScore - avgCutoff;
    
    if (diff >= 3) {
        return 'High';
    } else if (diff >= -1) {
        return 'Medium';
    } else {
        return 'Low';
    }
}

function generateRecommendation(data) {
    const { chance, chance1, chance2, isHolistic } = data;
    
    if (isHolistic) {
        return 'This university uses a holistic admission process. Focus on extracurriculars, essays, and interviews.';
    }
    
    const effectiveChance = chance || (chance1 === 'High' || chance2 === 'High'
        ? 'High'
        : chance1 === 'Medium' || chance2 === 'Medium' ? 'Medium'
            : chance1 === 'Low' || chance2 === 'Low' ? 'Low' : null);

    switch (effectiveChance) {
        case 'High':
            return 'You have a strong chance of admission based on historical merit cutoffs.';
        case 'Medium':
            return 'Your score is competitive, but admission is not guaranteed. Consider improving your entry test score if possible.';
        case 'Low':
            return 'Your aggregate is below the historical average. Consider applying to other programs as well as a backup.';
        default:
            return 'Not enough data to generate a recommendation.';
    }
}

module.exports = {
    calculateAggregate,
    predictChance,
    generateRecommendation
};
