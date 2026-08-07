import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = process.argv[2];
const sqlPath = process.argv[3];
const migrationPath = process.argv[4];
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const rows = workbook.worksheets.getItemAt(0).getUsedRange(true).values
  .slice(1).filter(row => row[1]);
const universityIds = new Map();
for (const row of rows) if (!universityIds.has(row[1])) universityIds.set(row[1], universityIds.size + 1);

const q = value => value == null || value === '' ? 'NULL' : `N'${String(value).replaceAll("'", "''")}'`;
const numberFrom = value => {
  const text = String(value || '');
  if (/N\/A|no fixed|not separately|not a single|adaptive/i.test(text)) return null;
  const match = text.match(/\d[\d,]*/);
  return match ? Number(match[0].replaceAll(',', '')) : null;
};

const testCatalog = [
  ['NU Test', 100, /NU Test|FAST-NUCES own Entry Test/i], ['ECAT', 400, /ECAT/i],
  ['NTS NAT', 100, /NTS NAT|\bNAT\b/i], ['SAT', 1600, /\bSAT(?:-I)?\b/i], ['ACT', 36, /\bACT\b/i],
  ['LCAT', null, /\bLCAT\b/i], ['ITU Admissions Test', 60, /ITU Admissions Test/i],
  ['USAT', 100, /\bUSAT\b/i], ['GAT', 100, /\bGAT\b/i], ['GRE', 340, /\bGRE/i],
  ['MDCAT', 180, /\bMDCAT\b/i], ['UHS-notified Test', null, /relevant entry test|AHS test/i],
  ['IBA Aptitude Test', 360, /IBA Aptitude Test/i], ['NED Entry Test', 100, /NED Pre-Admission/i],
  ['AKU Admission Test', null, /AKU Admission Test/i], ['Accuplacer', null, /Accuplacer/i],
  ['NET', 200, /\bNET\b|NUST Entry Test/i], ['LAT', 100, /\bLAT\b/i],
  ['HU Entrance Test', null, /HU Entrance Test/i], ['COMSATS Admission Test', 100, /COMSATS(?:''|')? own admission test|COMSATS(?:''|')? own test/i],
  ['PIEAS Admission Test', 100, /PIEAS Admission Test/i], ['AU-CBT', 100, /AU-CBT|Air University Computer-Based Test/i],
  ['NUML Entrance Test', 75, /NUML Entrance Test/i], ['HAT', 100, /\bHAT\b/i]
];

const facultyInserts = [];
const facultyUpdates = [];
const testInserts = [];
rows.forEach((row, index) => {
  const id = index + 1;
  const [city, university, faculty, programs, duration, semesters, fee, hostel, method, formula, notes, totalText, negative, alternatives, subjects, questions, testNotes] = row;
  const hostelStatus = /^yes/i.test(hostel || '') ? 'Yes' : /^no/i.test(hostel || '') ? 'No' : /limited|subject to availability/i.test(hostel || '') ? 'Limited' : 'Unspecified';
  facultyInserts.push(`INSERT INTO Faculties (FacultyID, UniversityID, FacultyName, Duration, Semesters, SemesterFee, HostelStatus, HostelNote, ApplicationMethod, AggregateFormula, SourceNotes, TestTotalMarksText, NegativeMarking, AlternativeTests, TestSubjectsBreakdown, TestFormat, EntryTestSourceNotes) VALUES (${id}, ${universityIds.get(university)}, ${q(faculty === '—' ? 'General' : faculty)}, ${q(duration)}, ${Number(semesters) || 'NULL'}, ${q(fee)}, '${hostelStatus}', ${q(hostel)}, ${q(method)}, ${q(formula)}, ${q(notes)}, ${q(totalText)}, ${q(negative)}, ${q(alternatives)}, ${q(subjects)}, ${q(questions)}, ${q(testNotes)});`);
  facultyUpdates.push(`UPDATE Faculties SET FacultyName=${q(faculty === '—' ? 'General' : faculty)}, Duration=${q(duration)}, Semesters=${Number(semesters) || 'NULL'}, SemesterFee=${q(fee)}, HostelStatus='${hostelStatus}', HostelNote=${q(hostel)}, ApplicationMethod=${q(method)}, AggregateFormula=${q(formula)}, SourceNotes=${q(notes)}, TestTotalMarksText=${q(totalText)}, NegativeMarking=${q(negative)}, AlternativeTests=${q(alternatives)}, TestSubjectsBreakdown=${q(subjects)}, TestFormat=${q(questions)}, EntryTestSourceNotes=${q(testNotes)} WHERE FacultyID=${id};`);

  const usableAlternatives = /^(yes|limited)/i.test(String(alternatives || '').trim()) ? alternatives : '';
  const combined = `${method || ''} ${usableAlternatives || ''} ${totalText || ''}`;
  const found = [];
  for (const [name, defaultTotal, regex] of testCatalog) {
    if (regex.test(combined) && !found.includes(name)) found.push(name);
  }
  if (!found.length && !/no admission test|merit-based/i.test(combined)) found.push(String(method).split(/[;,]/)[0].trim());
  found.sort((a, b) => {
    const regexA = testCatalog.find(item => item[0] === a)?.[2];
    const regexB = testCatalog.find(item => item[0] === b)?.[2];
    return (regexA ? combined.search(regexA) : 99999) - (regexB ? combined.search(regexB) : 99999);
  });
  found.forEach((name, testIndex) => {
    const catalog = testCatalog.find(item => item[0] === name);
    const total = testIndex === 0 ? (numberFrom(totalText) ?? catalog?.[1] ?? null) : (catalog?.[1] ?? null);
    testInserts.push(`INSERT INTO AdmissionTests (FacultyID, TestName, TotalMarks, TotalMarksText, IsPrimary, SubjectBreakdown, QuestionFormat, NegativeMarking, Notes) VALUES (${id}, ${q(name)}, ${total ?? 'NULL'}, ${q(total == null ? totalText : String(total))}, ${testIndex === 0 ? 1 : 0}, ${q(testIndex === 0 ? subjects : null)}, ${q(testIndex === 0 ? questions : null)}, ${q(testIndex === 0 ? negative : null)}, ${q(testIndex === 0 ? testNotes : alternatives)});`);
  });
});

let sql = await fs.readFile(sqlPath, 'utf8');
sql = sql.replace(/EstimatedFee\s+VARCHAR\(150\),/, `SemesterFee NVARCHAR(MAX),\n    SourceNotes NVARCHAR(MAX),\n    TestTotalMarksText NVARCHAR(MAX),\n    NegativeMarking NVARCHAR(MAX),\n    AlternativeTests NVARCHAR(MAX),\n    TestSubjectsBreakdown NVARCHAR(MAX),\n    TestFormat NVARCHAR(MAX),\n    EntryTestSourceNotes NVARCHAR(MAX),`)
  .replace(/HostelNote\s+VARCHAR\(150\),/, 'HostelNote NVARCHAR(MAX),')
  .replace(/ApplicationMethod VARCHAR\(150\),/, 'ApplicationMethod NVARCHAR(MAX),')
  .replace(/AggregateFormula\s+VARCHAR\(150\),/, 'AggregateFormula NVARCHAR(MAX),');
const start = sql.indexOf('-- ---------------- Faculties ----------------', sql.indexOf('-- ============================================================\n-- DATA'));
const end = sql.indexOf('-- ---------------- Programs ----------------', start);
const facultyBlock = `-- ---------------- Faculties ----------------\n${facultyInserts.join('\n')}\n\n-- ---------------- Admission tests ----------------\nCREATE TABLE AdmissionTests (\n    AdmissionTestID INT IDENTITY(1,1) PRIMARY KEY,\n    FacultyID INT NOT NULL,\n    TestName NVARCHAR(150) NOT NULL,\n    TotalMarks DECIMAL(10,2) NULL,\n    TotalMarksText NVARCHAR(MAX) NULL,\n    IsPrimary BIT NOT NULL DEFAULT 0,\n    SubjectBreakdown NVARCHAR(MAX) NULL,\n    QuestionFormat NVARCHAR(MAX) NULL,\n    NegativeMarking NVARCHAR(MAX) NULL,\n    Notes NVARCHAR(MAX) NULL,\n    CONSTRAINT fk_admissiontests_faculty FOREIGN KEY (FacultyID) REFERENCES Faculties(FacultyID),\n    CONSTRAINT uq_admissiontests_faculty_name UNIQUE (FacultyID, TestName)\n);\nCREATE INDEX idx_admissiontests_faculty ON AdmissionTests(FacultyID);\n${testInserts.join('\n')}\n\n`;
sql = sql.slice(0, start) + facultyBlock + sql.slice(end);
sql = sql.replaceAll('f.EstimatedFee', 'f.SemesterFee').replaceAll('EstimatedFee', 'SemesterFee');
await fs.writeFile(sqlPath, sql, 'utf8');
if (migrationPath) {
  const migration = `USE UniPak;

IF COL_LENGTH('Faculties', 'SemesterFee') IS NULL ALTER TABLE Faculties ADD SemesterFee NVARCHAR(MAX) NULL;
IF COL_LENGTH('Faculties', 'SourceNotes') IS NULL ALTER TABLE Faculties ADD SourceNotes NVARCHAR(MAX) NULL;
IF COL_LENGTH('Faculties', 'TestTotalMarksText') IS NULL ALTER TABLE Faculties ADD TestTotalMarksText NVARCHAR(MAX) NULL;
IF COL_LENGTH('Faculties', 'NegativeMarking') IS NULL ALTER TABLE Faculties ADD NegativeMarking NVARCHAR(MAX) NULL;
IF COL_LENGTH('Faculties', 'AlternativeTests') IS NULL ALTER TABLE Faculties ADD AlternativeTests NVARCHAR(MAX) NULL;
IF COL_LENGTH('Faculties', 'TestSubjectsBreakdown') IS NULL ALTER TABLE Faculties ADD TestSubjectsBreakdown NVARCHAR(MAX) NULL;
IF COL_LENGTH('Faculties', 'TestFormat') IS NULL ALTER TABLE Faculties ADD TestFormat NVARCHAR(MAX) NULL;
IF COL_LENGTH('Faculties', 'EntryTestSourceNotes') IS NULL ALTER TABLE Faculties ADD EntryTestSourceNotes NVARCHAR(MAX) NULL;
ALTER TABLE Faculties ALTER COLUMN HostelNote NVARCHAR(MAX) NULL;
ALTER TABLE Faculties ALTER COLUMN ApplicationMethod NVARCHAR(MAX) NULL;
ALTER TABLE Faculties ALTER COLUMN AggregateFormula NVARCHAR(MAX) NULL;
GO

IF OBJECT_ID('AdmissionTests', 'U') IS NULL
BEGIN
  CREATE TABLE AdmissionTests (
    AdmissionTestID INT IDENTITY(1,1) PRIMARY KEY,
    FacultyID INT NOT NULL,
    TestName NVARCHAR(150) NOT NULL,
    TotalMarks DECIMAL(10,2) NULL,
    TotalMarksText NVARCHAR(MAX) NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    SubjectBreakdown NVARCHAR(MAX) NULL,
    QuestionFormat NVARCHAR(MAX) NULL,
    NegativeMarking NVARCHAR(MAX) NULL,
    Notes NVARCHAR(MAX) NULL,
    CONSTRAINT fk_admissiontests_faculty FOREIGN KEY (FacultyID) REFERENCES Faculties(FacultyID),
    CONSTRAINT uq_admissiontests_faculty_name UNIQUE (FacultyID, TestName)
  );
  CREATE INDEX idx_admissiontests_faculty ON AdmissionTests(FacultyID);
END;
GO

BEGIN TRANSACTION;
${facultyUpdates.join('\n')}
DELETE FROM AdmissionTests;
${testInserts.join('\n')}
COMMIT TRANSACTION;
`;
  await fs.writeFile(migrationPath, migration, 'utf8');
}
console.log(`Updated ${rows.length} faculties and ${testInserts.length} admission-test options.`);
