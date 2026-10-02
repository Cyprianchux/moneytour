# MoneyTour

MoneyTour is a static HTML/CSS/JavaScript personal-finance frontend with an Express API.
The frontend covers registration, login,
password recovery, transactions (income/expenses) with income and expense tracking, transaction history, and balance summaries; updated on every added transaction.

Click the <a href="https://moneytour.vercel.app" target="_blank">Production link</a> or the <a href="https://cyprianchux.github.io/moneytour/api/" target="_blank">GitHub link</a> to visit the page.

## Local development

Install pnpm globally once, then run the frontend project's dev command:

```bash
npm install --global pnpm
cd moneytour-api
pnpm install
cd ../moneytour
pnpm install
pnpm dev
```

The frontend and API are served together at <http://localhost:5500>. The local API uses
MySQL by default. Create a local database by running `moneytour-api/sql/mysql-workbench.sql`
in MySQL Workbench, then configure `moneytour-api/.env`:

```dotenv
DB_CLIENT=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-local-password
DB_NAME=moneytour
DB_PORT=3306
PORT=5500
```

Set `window.MONEYTOUR_API_URL` in `scripts/config.js` to the API origin if the deployed frontend
and API use different domains; leave it empty for same-origin deployments.

## Tests

From the frontend directory:

```bash
pnpm install
pnpm test:unit
pnpm test:e2e
pnpm test
```

Unit tests use Node's built-in test runner. Playwright E2E tests start an isolated API backed
by an in-memory test database, so test runs do not require MySQL or production credentials.
Install Playwright's browser once with `pnpm exec playwright install chromium` if it is not
already available.

## Backend and production database

The API lives in `moneytour-api`. It supports local MySQL and PostgreSQL with the same
routes; `DB_CLIENT=mysql` selects MySQL, while `DB_CLIENT=postgres` selects PostgreSQL.
On Vercel, PostgreSQL is selected automatically. Configure `SUPABASE_DB_URL` (preferred,
using a Supabase session pooler connection string) or `DATABASE_URL`, and optionally set
`FRONTEND_ORIGIN` to the deployed frontend origin.

Run `moneytour-api/sql/postgresql-supabase.sql` in Supabase SQL Editor for production, or
`moneytour-api/sql/mysql-workbench.sql` for local MySQL Workbench testing. Both schemas
include users, password-reset fields, income/expense transactions, indexes, and a balance
summary view. The API computes balances from transaction records.

From the backend directory, `pnpm dev` starts the local API with automatic restarts and
`pnpm test:unit` / `pnpm test:e2e` run its backend suites.

Click the <a href="https://moneytour.vercel.app" target="_blank">Production link</a> or the <a href="https://cyprianchux.github.io/moneytour/api/" target="_blank">GitHub link</a> to visit the page.
