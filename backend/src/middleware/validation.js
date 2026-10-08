const MAX_ID = 2147483647;

function isValidId(value) {
    return (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value.trim()))) &&
        Number.isInteger(Number(value)) && Number(value) > 0 && Number(value) <= MAX_ID;
}

function validateQuery(fields) {
    return (req, res, next) => {
        for (const [name, type] of Object.entries(fields)) {
            const value = req.query[name];
            if (value === undefined || value === '') continue;
            const maximum = type === 'year' ? 32767 : MAX_ID;
            const minimum = type === 'offset' ? 0 : 1;
            const valid = type === 'text'
                ? typeof value === 'string'
                : typeof value === 'string' && /^\d+$/.test(value) &&
                    Number(value) >= minimum && Number(value) <= maximum;
            if (!valid) {
                return res.status(400).json({ success: false, error: `Invalid ${name} filter` });
            }
        }
        next();
    };
}

module.exports = { isValidId, validateQuery };
