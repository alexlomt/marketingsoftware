# CRM Application

A full-featured CRM application with contact management, pipeline tracking, email campaigns, form builder, appointment scheduling, and workflow automation.

## Features

- **Authentication System**: Secure user authentication with JWT tokens (HTTP-only cookies)
- **Contact Management**: Comprehensive contact database with tagging and smart lists
- **Pipeline & Deal Management**: Sales pipeline stages and deal tracking
- **Email Campaign System**: Campaign creation, scheduling, and analytics
- **Form Builder**: Custom form creation and submission handling
- **Appointment Scheduling**: Calendar integration and reminder system
- **Workflow Automation**: Trigger-based workflows with conditions and actions
- **Reporting & Analytics**: Data visualization for contacts, deals, and campaigns

## Tech Stack

- **Frontend**: Next.js 14.1.x, React 18, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT (`jsonwebtoken`)
- **Styling**: Tailwind CSS with custom components
- **Middleware**: Next.js Middleware configured to run in the **Node.js runtime** (`src/middleware.js`)

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd crm-project
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env.local` file in the root directory with the following variables:
    ```dotenv
    # Application
    NEXT_PUBLIC_APP_URL=http://localhost:3000

    # Database (Use PostgreSQL for production)
    # DATABASE_URL=postgresql://user:password@host:port/database
    DATABASE_URL=sqlite://./data/crm.db # For development

    # Authentication
    JWT_SECRET=your-very-secure-secret-key # Change this!
    JWT_EXPIRES_IN=7d

    # Email (Optional - Needed for password reset, campaigns, etc.)
    SMTP_HOST=smtp.example.com
    SMTP_PORT=587
    SMTP_USER=your-smtp-username
    SMTP_PASSWORD=your-smtp-password
    EMAIL_FROM=noreply@example.com
    ```
    **Note:** For production, ensure you use a strong `JWT_SECRET` and configure a PostgreSQL database.

4.  Initialize the database:
    ```bash
    npm run migrate
    ```

5.  Start the development server:
    ```bash
    npm run dev
    ```

6.  Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Start

1.  Build the application:
    ```bash
    npm run build
    ```
    This uses the `output: 'standalone'` configuration in `next.config.js` to create a minimal deployment build in `.next/standalone`.

2.  Start the production server:
    ```bash
    node .next/standalone/server.js
    ```
    **Note:** Do not use `npm start` or `next start` with the standalone output. Use the command above. Ensure your `PORT` environment variable is set correctly (e.g., `PORT=3000`).

## Development

### Project Structure

```
crm-project/
├── migrations/           # Database migration files (Knex.js)
├── public/               # Static assets
├── render/               # Render deployment scripts
├── scripts/              # Helper scripts (migration, tests)
├── src/
│   ├── app/              # Next.js app router pages & API routes
│   ├── components/       # React components
│   ├── lib/              # Core logic, utilities, auth, db
│   ├── models/           # Database models (using simple objects/functions)
│   └── middleware.js     # Authentication & Authorization middleware
├── tests/                # Integration/End-to-end tests
├── .env.local            # Local environment variables (gitignored)
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies & scripts
└── README.md             # This file
```

### Database Migrations

Uses Knex.js for migrations.

- Create a new migration:
  ```bash
  # You might need to install knex globally or use npx
  # npm install -g knex
  # knex migrate:make migration_name --migrations-directory migrations
  ```
  *Alternatively, adapt the `scripts/migrate.js` or manually create migration files.*
- Run migrations:
  ```bash
  npm run migrate
  ```
- Rollback the last migration:
  ```bash
  # knex migrate:rollback --migrations-directory migrations
  ```

### Testing

Run the test suite:
```bash
npm test
```
*(Assumes tests are configured and runnable via `scripts/run-tests.js`)*

## Deployment

This application is configured for deployment using the `standalone` output mode of Next.js.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions, particularly for platforms like Render. Key scripts:
- `render/build.sh`: Build script for Render.
- `render/run.sh`: Run script for Render (uses `node .next/standalone/server.js`).

## License

This project is licensed under the MIT License.
