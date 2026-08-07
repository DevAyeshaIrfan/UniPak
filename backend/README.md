# UniPak Backend API

Node.js/Express backend for the UniPak university portal. It uses **Microsoft SQL Server** and the schema/data in `UniPak_final.sql`.

## Setup

1. Create the database by running `UniPak_final.sql` in SQL Server Management Studio or `sqlcmd`. The script drops and recreates `UniPak`.
2. Configure `.env`:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=1433
DB_USER=your_sql_server_login
DB_PASSWORD=your_password
DB_NAME=UniPak
```

3. Install packages and start the API:

```bash
npm install
npm start
```

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api` | API index. |
| GET | `/api/health` | Health check. |
| GET | `/api/universities` | Universities; supports `city`, `sector`, and `search`. |
| GET | `/api/universities/dropdown` | Compact university list for selectors. |
| GET | `/api/universities/cities` | Cities. |
| GET | `/api/universities/city/:cityName` | Universities in a city. |
| GET | `/api/universities/:id` | University details available in the base schema. |
| GET | `/api/universities/:id/faculties` | Faculties with all accepted admission-test options. |
| GET | `/api/universities/:id/admission-tests` | Admission tests accepted by one university. |
| GET | `/api/universities/test-breakdowns` | Searchable test totals, subjects, format, and negative marking. |
| GET | `/api/universities/:id/programs` | Programs for a university. |
| GET | `/api/universities/:id/fee-structure` | Student-friendly semester fees from `Faculties`. |
| GET | `/api/universities/:id/hostels` | Faculty hostel information. |
| GET | `/api/universities/programs/search` | Program search; supports `search`, `category`, `city`, `sector`, `hostel`, `universityId`, `limit`, and `offset`. |
| GET | `/api/universities/programs/categories` | Program categories. |
| GET | `/api/universities/admission-tests` | Distinct application methods. |
| GET | `/api/universities/faculties/:id/aggregate-formula` | Parsed aggregate formula for a faculty. |
| GET | `/api/merit-cutoffs` | Merit cutoffs; supports `universityId`, `city`, `year`, and `program`. |
| GET | `/api/merit-cutoffs/university/:id` | Merit cutoffs for one university. |
| GET | `/api/merit-cutoffs/program/:id` | Merit cutoffs for one program. |
| POST | `/api/calculator/calculate` | Aggregate calculation for one or more faculty IDs. |
| POST | `/api/calculator/compare` | Compare two different faculty IDs. |

The calculator reads each faculty's free-text aggregate formula. If no fixed percentages can be derived, it returns a holistic-review result instead of inventing a score. Calculator results are not stored because the SQL schema has no results table.

Example calculation payload:

```json
{
  "facultyIds": [1, 3],
  "matricMarks": 950,
  "matricTotal": 1100,
  "intermediateMarks": 880,
  "intermediateTotal": 1100,
  "entryTestSelections": [
    { "facultyId": 1, "admissionTestId": 1, "score": 85, "total": 100 },
    { "facultyId": 3, "admissionTestId": 8, "score": 320, "total": 400 }
  ]
}
```

Each selected faculty may use a different accepted test. When a test has a fixed published total, clients should use the `TotalMarks` returned by the faculty or admission-test endpoint.
