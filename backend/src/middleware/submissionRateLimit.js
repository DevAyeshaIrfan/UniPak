const { rateLimit } = require('express-rate-limit');

function positiveSetting(name, fallback) {
    const value = Number(process.env[name]);
    return Number.isInteger(value) && value > 0 && value <= 2147483647 ? value : fallback;
}

function createSubmissionLimiter(prefix, defaultLimit) {
    return rateLimit({
        windowMs: positiveSetting(`${prefix}_RATE_LIMIT_WINDOW_MS`, 15 * 60 * 1000),
        limit: positiveSetting(`${prefix}_RATE_LIMIT_MAX`, defaultLimit),
        ipv6Subnet: 64,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { success: false, error: 'Too many requests. Please try again later.' }
    });
}

module.exports = { createSubmissionLimiter };
