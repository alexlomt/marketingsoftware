# CRM Application

A full-featured CRM application with contact management, pipeline tracking, email campaigns, form builder, appointment scheduling, and workflow automation.

## Features

- **Authentication System**: Secure user authentication with JWT tokens
- **Contact Management**: Comprehensive contact database with tagging and smart lists
- **Pipeline & Deal Management**: Sales pipeline stages and deal tracking
- **Email Campaign System**: Campaign creation, scheduling, and analytics
- **Form Builder**: Custom form creation and submission handling
- **Appointment Scheduling**: Calendar integration and reminder system
- **Workflow Automation**: Trigger-based workflows with conditions and actions
- **Reporting & Analytics**: Data visualization for contacts, deals, and campaigns

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: Tailwind CSS with custom components

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd crm-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Database
   DATABASE_URL=sqlite://./data/crm.db
   
   # Authentication
   JWT_SECRET=your-development-secret
   JWT_EXPIRES_IN=7d
   
   # Email (optional for development)
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your-smtp-username
   SMTP_PASSWORD=your-smtp-password
   EMAIL_FROM=noreply@example.com
   ```

4. Initialize the database:
   ```bash
   npm run migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Project Structure

```
crm-project/
├── migrations/           # Database migration files
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   ├── models/           # Database models
│   └── styles/           # Global styles
├── tests/                # Test files
├── .env.local            # Environment variables (not in repo)
├── next.config.js        # Next.js configuration
└── package.json          # Project dependencies
```

### Database Migrations

To create a new migration:

```bash
npm run migrate:create -- my_migration_name
```

To run migrations:

```bash
npm run migrate
```

### Testing

Run the test suite:

```bash
npm test
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
