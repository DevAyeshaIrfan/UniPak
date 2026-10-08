const https = require('https');

const REQUEST_LABELS = {
    contact: 'Contact request',
    bug: 'Bug report',
    feature: 'Feature request'
};

function isConfigured() {
    return Boolean(process.env.RESEND_API_KEY && process.env.SUPPORT_NOTIFICATION_EMAIL);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function postJson(url, payload, apiKey, idempotencyKey) {
    return new Promise((resolve, reject) => {
        const target = new URL(url);
        const body = JSON.stringify(payload);
        const request = https.request({
            hostname: target.hostname,
            path: target.pathname,
            method: 'POST',
            family: 4,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'Idempotency-Key': idempotencyKey
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
                    ok: response.statusCode >= 200 && response.statusCode < 300,
                    status: response.statusCode || 500,
                    data
                });
            });
        });

        request.on('timeout', () => request.destroy(Object.assign(new Error('Email request timed out'), { code: 'ETIMEDOUT' })));
        request.on('error', reject);
        request.write(body);
        request.end();
    });
}

async function sendSupportNotification(supportRequest) {
    if (!isConfigured()) {
        return { sent: false, status: 'not_configured' };
    }

    const label = REQUEST_LABELS[supportRequest.requestType] || 'Support request';
    const safeMessage = escapeHtml(supportRequest.message).replaceAll('\n', '<br>');
    const response = await postJson(
        'https://api.resend.com/emails',
        {
            from: process.env.SUPPORT_FROM_EMAIL || 'UniPak Support <onboarding@resend.dev>',
            to: [process.env.SUPPORT_NOTIFICATION_EMAIL],
            reply_to: supportRequest.email,
            subject: `[UniPak ${label}] ${supportRequest.subject}`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#1e1720">
                    <h1 style="font-size:24px;margin-bottom:8px">${escapeHtml(label)}</h1>
                    <p style="color:#667085;margin-top:0">Reference ${escapeHtml(supportRequest.referenceCode)}</p>
                    <table style="width:100%;border-collapse:collapse;margin:24px 0">
                        <tr><td style="padding:8px 0;color:#667085">From</td><td style="padding:8px 0">${escapeHtml(supportRequest.name)}</td></tr>
                        <tr><td style="padding:8px 0;color:#667085">Email</td><td style="padding:8px 0">${escapeHtml(supportRequest.email)}</td></tr>
                        <tr><td style="padding:8px 0;color:#667085">Subject</td><td style="padding:8px 0">${escapeHtml(supportRequest.subject)}</td></tr>
                    </table>
                    <div style="padding:18px;border:1px solid #e4e7ec;border-radius:8px;line-height:1.6">${safeMessage}</div>
                </div>
            `,
            text: `${label}\nReference: ${supportRequest.referenceCode}\nFrom: ${supportRequest.name} <${supportRequest.email}>\nSubject: ${supportRequest.subject}\n\n${supportRequest.message}`
        },
        process.env.RESEND_API_KEY,
        `support-${supportRequest.referenceCode}`
    );

    if (!response.ok) {
        const providerMessage = response.data?.message || response.data?.error || `Email provider returned ${response.status}`;
        throw new Error(String(providerMessage).slice(0, 500));
    }

    return { sent: true, status: 'sent', providerId: response.data?.id || null };
}

module.exports = {
    isConfigured,
    sendSupportNotification
};
