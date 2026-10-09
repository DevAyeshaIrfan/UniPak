const crypto = require('node:crypto');
const express = require('express');
const emailService = require('../services/emailService');
const supportService = require('../services/supportService');
const { createSubmissionLimiter } = require('../middleware/submissionRateLimit');

const router = express.Router();
const VALID_REQUEST_TYPES = new Set(['contact', 'bug', 'feature']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@][^\s@.]*\.[^\s@]+$/;

function cleanText(value, maximumLength) {
    return typeof value === 'string' ? value.trim().slice(0, maximumLength) : '';
}

function createReferenceCode() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `UP-${timestamp}-${suffix}`;
}

router.get('/', (req, res) => {
    res.json({
        success: true,
        emailConfigured: emailService.isConfigured()
    });
});

router.post('/', createSubmissionLimiter('SUPPORT', 120), async (req, res) => {
    const requestType = cleanText(req.body?.requestType, 20).toLowerCase();
    const name = cleanText(req.body?.name, 120);
    const email = cleanText(req.body?.email, 254).toLowerCase();
    const subject = cleanText(req.body?.subject, 200);
    const message = cleanText(req.body?.message, 4000);

    if (!VALID_REQUEST_TYPES.has(requestType)) {
        return res.status(400).json({ success: false, error: 'Choose a valid support request type' });
    }
    if (!name) {
        return res.status(400).json({ success: false, error: 'Enter your name' });
    }
    if (!EMAIL_PATTERN.test(email)) {
        return res.status(400).json({ success: false, error: 'Enter a valid email address' });
    }
    if (!subject) {
        return res.status(400).json({ success: false, error: 'Add a short subject' });
    }
    if (message.length < 10) {
        return res.status(400).json({ success: false, error: 'Enter at least 10 characters in the message' });
    }

    const referenceCode = createReferenceCode();
    const supportRequest = { referenceCode, requestType, name, email, subject, message };
    const emailConfigured = emailService.isConfigured();

    try {
        const saved = await supportService.createSupportRequest({
            ...supportRequest,
            emailStatus: emailConfigured ? 'Pending' : 'NotConfigured'
        });

        if (!emailConfigured) {
            return res.status(201).json({
                success: true,
                referenceCode: saved.ReferenceCode,
                email: { sent: false, status: 'not_configured' }
            });
        }

        try {
            const emailResult = await emailService.sendSupportNotification(supportRequest);
            await supportService.markEmailSent(saved.SupportRequestID, emailResult.providerId);
            return res.status(201).json({
                success: true,
                referenceCode: saved.ReferenceCode,
                email: { sent: true, status: 'sent' }
            });
        } catch (error) {
            console.error(`Support email failed for ${referenceCode}:`);
            await supportService.markEmailFailed(saved.SupportRequestID, error.message);
            return res.status(201).json({
                success: true,
                referenceCode: saved.ReferenceCode,
                email: { sent: false, status: 'failed' }
            });
        }
    } catch (error) {
        console.error('Support request could not be saved:', error.message);
        return res.status(500).json({ success: false, error: 'The request could not be saved. Please try again.' });
    }
});

module.exports = router;
