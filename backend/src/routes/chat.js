const express = require('express');
const https = require('https');

const router = express.Router();

const SYSTEM_INSTRUCTION = `You are the UniPak admissions assistant for students applying to universities in Pakistan.
Help users understand university programs, entry tests, aggregate calculations, fees, hostels, merit cutoffs, and how to use UniPak.
Be concise, friendly, and practical. Use short paragraphs or bullet points when useful.
Never guarantee admission. Explain that merit cutoffs and fee figures can change and that students should confirm final details with the university's official admissions office.
When a question requires data you do not have, say so clearly instead of inventing an answer.
UniPak has these main tools: Explore Universities, Aggregate Calculator, Test Breakdown, and Prediction Analysis. Prediction compares selected programs using separate admission formulas and the latest linked program cutoff available in the database.`;

function cleanText(value, maximumLength) {
    return typeof value === 'string' ? value.trim().slice(0, maximumLength) : '';
}

function normalizeHistory(history) {
    if (!Array.isArray(history)) return [];
    return history
        .slice(-12)
        .map((message) => ({
            role: message?.role === 'assistant' ? 'assistant' : 'user',
            content: cleanText(message?.text, 2000)
        }))
        .filter((message) => message.content);
}

function extractReply(data) {
    return data?.choices?.[0]?.message?.content?.trim();
}

function postJson(url, payload, apiKey) {
    return new Promise((resolve, reject) => {
        const target = new URL(url);
        const body = JSON.stringify(payload);
        const request = https.request({
            hostname: target.hostname,
            path: `${target.pathname}${target.search}`,
            method: 'POST',
            family: 4,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            },
            timeout: 20000
        }, (response) => {
            let raw = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => { raw += chunk; });
            response.on('end', () => {
                let data = {};
                try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }
                resolve({
                    status: response.statusCode || 500,
                    ok: response.statusCode >= 200 && response.statusCode < 300,
                    data
                });
            });
        });
        request.on('timeout', () => request.destroy(Object.assign(new Error('Chat request timed out'), { code: 'ETIMEDOUT' })));
        request.on('error', reject);
        request.write(body);
        request.end();
    });
}

router.get('/', (req, res) => {
    res.json({
        success: true,
        configured: Boolean(process.env.GROQ_API_KEY),
        model: process.env.CHAT_MODEL || 'openai/gpt-oss-20b'
    });
});

router.post('/', async (req, res) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(503).json({
            success: false,
            error: 'The UniPak assistant is not configured yet. Add the chat API key to the backend environment.'
        });
    }

    const message = cleanText(req.body?.message, 3000);
    if (!message) {
        return res.status(400).json({ success: false, error: 'Enter a message to continue' });
    }

    const model = process.env.CHAT_MODEL || 'openai/gpt-oss-20b';
    try {
        const response = await postJson(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model,
                messages: [
                    { role: 'system', content: SYSTEM_INSTRUCTION },
                    ...normalizeHistory(req.body?.history),
                    { role: 'user', content: message }
                ],
                temperature: 0.35,
                max_completion_tokens: 700
            },
            apiKey
        );

        const data = response.data;
        if (!response.ok) {
            const providerMessage = data?.error?.message || '';
            console.error(`Chat API error (${response.status}):`, providerMessage);
            if (response.status === 429) {
                return res.status(429).json({ success: false, error: 'The assistant is busy right now. Please try again shortly.' });
            }
            if (response.status === 400 || response.status === 401 || response.status === 403 || data?.error?.code === 'model_not_found') {
                return res.status(502).json({ success: false, error: 'The chat service configuration was rejected.' });
            }
            return res.status(502).json({ success: false, error: 'The assistant could not complete this request.' });
        }

        const reply = extractReply(data);
        if (!reply) {
            return res.status(502).json({ success: false, error: 'The assistant returned an empty response. Please try again.' });
        }

        return res.json({ success: true, reply, model });
    } catch (error) {
        if (error.code === 'ETIMEDOUT') {
            return res.status(504).json({ success: false, error: 'The assistant took too long to respond. Please try again.' });
        }
        console.error('Chat request failed:', error.message);
        return res.status(502).json({ success: false, error: 'Could not connect to the chat service.' });
    }
});

module.exports = router;
