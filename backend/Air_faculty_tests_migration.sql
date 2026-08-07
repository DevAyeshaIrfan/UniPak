USE UniPak;

SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF EXISTS (SELECT 1 FROM Faculties WHERE FacultyID = 43 AND UniversityID <> 17)
    THROW 50001, 'FacultyID 43 is already assigned to another university.', 1;

UPDATE Faculties
SET FacultyName = N'Faculty of Engineering',
    ApplicationMethod = N'AU-CBT, NTS NAT, or NET.',
    AlternativeTests = N'NTS NAT or NET may be accepted instead of AU-CBT. SAT is not accepted for this faculty.'
WHERE FacultyID = 37 AND UniversityID = 17;

UPDATE Faculties
SET FacultyName = N'Faculty of Computing & Artificial Intelligence',
    SemesterFee = N'Estimated PKR 122,450–170,700 per regular semester for Computing programs; estimated first-semester total PKR 157,450–205,700 including admission, endowment, and refundable security charges.',
    ApplicationMethod = N'AU-CBT, NTS NAT, or NET.',
    AlternativeTests = N'NTS NAT or NET may be accepted instead of AU-CBT. SAT is not accepted for this faculty.',
    TestSubjectsBreakdown = N'English + Analytical Reasoning + Quantitative Reasoning + Physics/Chemistry/Mathematics for Computing streams.'
WHERE FacultyID = 38 AND UniversityID = 17;

IF NOT EXISTS (SELECT 1 FROM Faculties WHERE FacultyID = 43)
BEGIN
    INSERT INTO Faculties (
        FacultyID, UniversityID, FacultyName, Duration, Semesters, SemesterFee,
        SourceNotes, TestTotalMarksText, NegativeMarking, AlternativeTests,
        TestSubjectsBreakdown, TestFormat, EntryTestSourceNotes, HostelStatus,
        HostelNote, ApplicationMethod, AggregateFormula
    )
    VALUES (
        43, 17, N'Department of Management Sciences', N'4 years', 8,
        N'Estimated PKR 122,450–170,700 per regular semester for Management programs; estimated first-semester total PKR 157,450–205,700 including admission, endowment, and refundable security charges.',
        N'au.edu.pk admissions pages (retrieved Aug 2026).',
        N'≈100 for AU-CBT; accepted alternatives use their published scales', N'No',
        N'NTS NAT, NET, or SAT may be accepted instead of AU-CBT.',
        N'English + Analytical Reasoning + Quantitative Reasoning + Accounts/Commerce/Economics for Management streams.',
        N'≈100 MCQs, ≈120 minutes for AU-CBT; alternative tests use their published formats.',
        N'Official: au.edu.pk admissions pages, retrieved Aug 2026.',
        'Yes', N'Yes — same Air University hostel facilities as the other faculties.',
        N'AU-CBT, NTS NAT, NET, or SAT.',
        N'Matric(SSC) 10% + FSc(HSSC) 40% + Entry Test 50%.'
    );
END;
ELSE
BEGIN
    UPDATE Faculties
    SET UniversityID = 17,
        FacultyName = N'Department of Management Sciences',
        Duration = N'4 years',
        Semesters = 8,
        SemesterFee = N'Estimated PKR 122,450–170,700 per regular semester for Management programs; estimated first-semester total PKR 157,450–205,700 including admission, endowment, and refundable security charges.',
        SourceNotes = N'au.edu.pk admissions pages (retrieved Aug 2026).',
        TestTotalMarksText = N'≈100 for AU-CBT; accepted alternatives use their published scales',
        NegativeMarking = N'No',
        AlternativeTests = N'NTS NAT, NET, or SAT may be accepted instead of AU-CBT.',
        TestSubjectsBreakdown = N'English + Analytical Reasoning + Quantitative Reasoning + Accounts/Commerce/Economics for Management streams.',
        TestFormat = N'≈100 MCQs, ≈120 minutes for AU-CBT; alternative tests use their published formats.',
        EntryTestSourceNotes = N'Official: au.edu.pk admissions pages, retrieved Aug 2026.',
        HostelStatus = 'Yes',
        HostelNote = N'Yes — same Air University hostel facilities as the other faculties.',
        ApplicationMethod = N'AU-CBT, NTS NAT, NET, or SAT.',
        AggregateFormula = N'Matric(SSC) 10% + FSc(HSSC) 40% + Entry Test 50%.'
    WHERE FacultyID = 43;
END;

UPDATE Programs
SET FacultyID = 43
WHERE ProgramID = 194 AND ProgramName = 'BBA';

DELETE FROM AdmissionTests
WHERE FacultyID IN (37, 38) AND TestName = N'SAT';

MERGE AdmissionTests AS target
USING (VALUES
    (37, N'AU-CBT', 100, N'100', 1),
    (37, N'NTS NAT', 100, N'100', 0),
    (37, N'NET', 200, N'200', 0),
    (38, N'AU-CBT', 100, N'100', 1),
    (38, N'NTS NAT', 100, N'100', 0),
    (38, N'NET', 200, N'200', 0),
    (43, N'AU-CBT', 100, N'100', 1),
    (43, N'NTS NAT', 100, N'100', 0),
    (43, N'NET', 200, N'200', 0),
    (43, N'SAT', 1600, N'1600', 0)
) AS source (FacultyID, TestName, TotalMarks, TotalMarksText, IsPrimary)
ON target.FacultyID = source.FacultyID AND target.TestName = source.TestName
WHEN MATCHED THEN
    UPDATE SET TotalMarks = source.TotalMarks,
               TotalMarksText = source.TotalMarksText,
               IsPrimary = source.IsPrimary
WHEN NOT MATCHED THEN
    INSERT (FacultyID, TestName, TotalMarks, TotalMarksText, IsPrimary, Notes)
    VALUES (source.FacultyID, source.TestName, source.TotalMarks, source.TotalMarksText,
            source.IsPrimary,
            CASE WHEN source.TestName = N'NET'
                 THEN N'Accepted by Air University; scored out of 200.'
                 ELSE N'Accepted by Air University for this faculty.' END);

COMMIT TRANSACTION;
