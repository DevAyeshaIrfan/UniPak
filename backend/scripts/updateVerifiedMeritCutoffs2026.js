const { getPool, sql } = require('../src/config/database');

const SOURCE_REFERENCE =
    'https://admission.uet.edu.pk/uploads/downloads/91a868d2-dfcb-4974-af21-453f6b6853d0.pdf';
const SOURCE_WORKBOOK = 'Official web research 2026-08-05';
const SOURCE_SHEET = 'UET Fall 2026 Merit List 1';

const cutoffs = [
    { programId: 15, programName: 'Civil Engineering', cutoff: 82.637, sourcePage: 4 },
    { programId: 20, programName: 'Electrical Engineering', cutoff: 85.137, sourcePage: 5 },
    { programId: 24, programName: 'Mechanical Engineering', cutoff: 83.288, sourcePage: 7 },
];

async function updateVerifiedMeritCutoffs() {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
        const placeholderResult = await new sql.Request(transaction).query(`
            SELECT MeritCutoffID
            FROM UniversityMeritCutoffs WITH (UPDLOCK, HOLDLOCK)
            WHERE UniversityID = 2
              AND AdmissionYear = 2026
              AND ProgramID IS NULL
              AND ProgramNameSource = N'Electrical / Mechanical / Civil Engineering'
              AND ClosingMeritPercent IS NULL;
        `);

        const placeholderId = placeholderResult.recordset[0]?.MeritCutoffID ?? null;
        const changes = [];

        for (const [index, cutoff] of cutoffs.entries()) {
            const request = new sql.Request(transaction);
            request.input('programId', sql.Int, cutoff.programId);
            request.input('programName', sql.NVarChar(255), cutoff.programName);
            request.input('cutoff', sql.Decimal(6, 3), cutoff.cutoff);
            request.input('sourceReference', sql.NVarChar(sql.MAX), SOURCE_REFERENCE);
            request.input('sourceWorkbook', sql.NVarChar(260), SOURCE_WORKBOOK);
            request.input('sourceSheet', sql.NVarChar(100), SOURCE_SHEET);
            request.input('sourcePage', sql.Int, cutoff.sourcePage);

            if (index === 0 && placeholderId !== null) {
                request.input('placeholderId', sql.Int, placeholderId);
                await request.query(`
                    UPDATE UniversityMeritCutoffs
                    SET ProgramID = @programId,
                        ProgramNameSource = @programName,
                        SessionName = N'Fall 2026',
                        CategoryTestBasis = N'ECAT, Category A1 (open merit), Morning',
                        ClosingMeritPercent = @cutoff,
                        MeritListRound = N'Merit List 1',
                        MeritStatus = 'Reported',
                        SourceReference = @sourceReference,
                        Notes = N'Official first-list minimum aggregate. This is not the final closing merit and may decrease in later lists.',
                        SourceWorkbook = @sourceWorkbook,
                        SourceSheet = @sourceSheet,
                        SourceRow = @sourcePage,
                        ImportedAtUtc = SYSUTCDATETIME()
                    WHERE MeritCutoffID = @placeholderId
                      AND ClosingMeritPercent IS NULL;
                `);
                changes.push(`updated placeholder as ${cutoff.programName}`);
                continue;
            }

            const result = await request.query(`
                IF NOT EXISTS (
                    SELECT 1
                    FROM UniversityMeritCutoffs WITH (UPDLOCK, HOLDLOCK)
                    WHERE UniversityID = 2
                      AND ProgramID = @programId
                      AND AdmissionYear = 2026
                      AND ClosingMeritPercent IS NOT NULL
                )
                BEGIN
                    INSERT INTO UniversityMeritCutoffs (
                        UniversityID, ProgramID, CityID, UniversityNameSource,
                        ProgramNameSource, AdmissionYear, SessionName,
                        CategoryTestBasis, ClosingMeritPercent, MeritListRound,
                        MeritStatus, SourceReference, Notes, SourceWorkbook,
                        SourceSheet, SourceRow
                    )
                    VALUES (
                        2, @programId, 3, N'UET Lahore (Main Campus)',
                        @programName, 2026, N'Fall 2026',
                        N'ECAT, Category A1 (open merit), Morning', @cutoff,
                        N'Merit List 1', 'Reported', @sourceReference,
                        N'Official first-list minimum aggregate. This is not the final closing merit and may decrease in later lists.',
                        @sourceWorkbook, @sourceSheet, @sourcePage
                    );

                    SELECT CAST(1 AS bit) AS Inserted;
                END
                ELSE
                    SELECT CAST(0 AS bit) AS Inserted;
            `);

            if (result.recordset[0]?.Inserted) {
                changes.push(`inserted ${cutoff.programName}`);
            }
        }

        await transaction.commit();
        console.log(JSON.stringify({ success: true, changes }, null, 2));
    } catch (error) {
        await transaction.rollback();
        throw error;
    } finally {
        await pool.close();
    }
}

updateVerifiedMeritCutoffs().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
