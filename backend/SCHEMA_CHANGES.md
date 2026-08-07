# UniPak SQL schema reference

`UniPak_final.sql` is the source of truth for this backend. It defines a SQL Server database named `UniPak` with the following objects:

| Object | Purpose |
| --- | --- |
| `Cities` | City lookup records. |
| `Universities` | University name, city, and public/private sector. |
| `Faculties` | University schools/departments plus fee, hostel, application, and aggregate-formula text. |
| `Programs` | Program names and major categories, linked to faculties. |
| `ProgramSearchView` | Flattened program, faculty, university, and city information for search. |
| `UniversityMeritCutoffs` | Imported 2025 and 2026 merit data, including rows that are deliberately not linked to a normalized university or program. |

The schema does **not** contain `AggregateWeights`, `UniversityDetails`, `AdmissionTestTypes`, `StudentApplications`, `CalculatorResults`, `ComparisonResults`, or `UniversityRankings`. The API therefore derives aggregate weights from `Faculties.AggregateFormula`, returns admission-test values from `Faculties.ApplicationMethod`, and does not persist calculator sessions or rankings.

## SQL Server notes

- The script uses SQL Server syntax (`GO`, `IDENTITY`, `NVARCHAR`, and `SYSUTCDATETIME`). Run it with SQL Server tools, not MySQL.
- It starts by dropping and recreating the `UniPak` database. Do not run it against a database whose data you need to keep.
- `UniversityMeritCutoffs.UniversityID` and `.ProgramID` can be `NULL` by design, so the API uses left joins when returning merit-cutoff data.
# August 2026 workbook update

- Replaced `Faculties.EstimatedFee` with `Faculties.SemesterFee`; values now describe semester charges instead of per-credit-hour pricing.
- Added the normalized `AdmissionTests` table. A faculty can now expose multiple accepted tests, each with its own total marks, subject breakdown, format, negative-marking policy, and notes.
- Added the workbook's full source notes and test-detail fields to `Faculties` for traceability.
- Calculator requests can send a separate `entryTestSelections` item for every selected faculty.
