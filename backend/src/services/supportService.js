const { getPool, sql } = require('../config/database');

async function createSupportRequest(requestData) {
    const pool = await getPool();
    const request = pool.request();

    request.input('ReferenceCode', sql.NVarChar(32), requestData.referenceCode);
    request.input('RequestType', sql.NVarChar(20), requestData.requestType);
    request.input('Name', sql.NVarChar(120), requestData.name);
    request.input('Email', sql.NVarChar(254), requestData.email);
    request.input('Subject', sql.NVarChar(200), requestData.subject);
    request.input('Message', sql.NVarChar(4000), requestData.message);
    request.input('EmailStatus', sql.NVarChar(20), requestData.emailStatus);

    const result = await request.query(`
        INSERT INTO dbo.SupportRequests
            (ReferenceCode, RequestType, Name, Email, Subject, Message, EmailStatus)
        OUTPUT INSERTED.SupportRequestID, INSERTED.ReferenceCode, INSERTED.CreatedAt
        VALUES
            (@ReferenceCode, @RequestType, @Name, @Email, @Subject, @Message, @EmailStatus)
    `);

    return result.recordset[0];
}

async function markEmailSent(supportRequestId, providerId) {
    const pool = await getPool();
    const request = pool.request();
    request.input('SupportRequestID', sql.Int, supportRequestId);
    request.input('EmailProviderID', sql.NVarChar(120), providerId || null);
    await request.query(`
        UPDATE dbo.SupportRequests
        SET EmailStatus = N'Sent',
            EmailProviderID = @EmailProviderID,
            EmailError = NULL,
            EmailSentAt = SYSUTCDATETIME()
        WHERE SupportRequestID = @SupportRequestID
    `);
}

async function markEmailFailed(supportRequestId, errorMessage) {
    const pool = await getPool();
    const request = pool.request();
    request.input('SupportRequestID', sql.Int, supportRequestId);
    request.input('EmailError', sql.NVarChar(500), String(errorMessage || 'Email delivery failed').slice(0, 500));
    await request.query(`
        UPDATE dbo.SupportRequests
        SET EmailStatus = N'Failed',
            EmailError = @EmailError
        WHERE SupportRequestID = @SupportRequestID
    `);
}

module.exports = {
    createSupportRequest,
    markEmailSent,
    markEmailFailed
};
