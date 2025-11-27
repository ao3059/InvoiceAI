# InvoiceAI

## Overview

InvoiceAI is a production-ready multi-tenant SaaS invoice generation platform with AI-powered invoice creation from natural language descriptions, comprehensive admin dashboards, and activity tracking. Users describe their work in plain English and AI generates structured professional invoices with line items, pricing, and formatting.

## Implementation Status

✅ **COMPLETE** - All core features implemented and tested:
- Multi-tenant architecture with tenant isolation
- AI-powered invoice generation via OpenAI
- **Replit Auth integration** (Google, GitHub, Apple, email/password login)
- **Email delivery of invoices via Resend**
- Full invoice lifecycle management (draft → sent → paid)
- Company profile settings
- Admin dashboards with tenant metrics and activity logs
- Activity logging for audit trails
- Beautiful React UI with dark mode support

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with Vite bundler
- **Routing**: Wouter for client-side routing with protected routes
- **State Management**: TanStack React Query v5 for server state
- **UI Components**: ShadCN UI built on Radix UI primitives
- **Styling**: Tailwind CSS with custom HSL color variables
- **Theme**: Light/dark mode with localStorage persistence
- **Forms**: React Hook Form with Zod validation

**Pages Implemented**:
- Landing page with hero section, features, and pricing tiers
- Auth login page with Replit Auth (Google, GitHub, Apple providers)
- Dashboard home with invoice statistics
- Invoice creation with AI generation
- Invoice list with filtering and search
- Invoice detail view with email sending
- Company settings with profile management
- Admin tenant management dashboard
- Admin activity feed

### Backend Architecture

**Framework**: Express.js with TypeScript
- **Database**: PostgreSQL via Neon (serverless)
- **ORM**: Drizzle ORM with schema-first design
- **Session**: express-session with PostgreSQL session store (connect-pg-simple)
- **API Design**: RESTful JSON endpoints with proper status codes

**Authentication** (Replit Auth):
- OpenID Connect integration with Replit's identity provider
- Supports Google, GitHub, Apple, and email/password login
- Session-based with automatic token refresh
- Auto-provisions tenant + company + subscription on first login
- Role-based access control (admin vs member)
- Proper error handling with 401/403 status codes
- All protected routes validated with `isAuthenticated` middleware

**Security Features**:
- ✅ Replit Auth for secure authentication (OAuth 2.0 / OIDC)
- ✅ Admin endpoints protected with role checks
- ✅ Multi-tenant queries verify `tenantId` ownership
- ✅ Session cookies with secure configuration
- ✅ OpenAI requests include `max_completion_tokens: 2048` limit
- ✅ Resend integration via connector for email delivery

**API Endpoints**:
- `GET /api/login` - Redirect to Replit Auth login
- `GET /api/callback` - OAuth callback handler
- `GET /api/logout` - Destroy session and redirect
- `GET /api/auth/user` - Get current authenticated user
- `GET /api/dashboard/stats` - Invoice statistics
- `GET /api/invoices` - List with filters/search
- `GET /api/invoices/:id` - Get detail with items
- `POST /api/invoices/generate` - AI generation
- `POST /api/invoices/:id/send` - Send invoice via email
- `PATCH /api/invoices/:id/status` - Update status
- `GET /api/companies/current` - Get company profile
- `POST /api/companies` - Create company
- `PATCH /api/companies/:id` - Update company
- `GET /api/admin/tenants` - All tenant metrics
- `GET /api/admin/activity` - All activity logs

### Data Model

**Database Schema** (Drizzle ORM):
- `sessions` - Session storage for Replit Auth
- `tenants` - Multi-tenant root with shard assignment
- `users` - User accounts with profile fields (firstName, lastName, profileImageUrl)
- `companies` - Company profile per tenant
- `invoices` - Invoice records with status tracking
- `invoiceItems` - Line items per invoice
- `activityLogs` - Audit trail of all actions
- `subscriptions` - Tenant subscription status
- `plans` - Subscription plan definitions (Free/Starter/Pro/Enterprise)

**Multi-Tenancy**:
- All tables have `tenantId` foreign key
- Row-level security enforced in application layer
- Auto-provisioning of tenant on first user login

### Data Persistence

**Database**: PostgreSQL (Neon serverless)
- WebSocket-based connection pooling
- Connection via `DATABASE_URL` environment variable
- Automatic plan seeding on app startup

**Session Storage**:
- PostgreSQL via connect-pg-simple
- Session secret via `SESSION_SECRET` environment variable
- 7-day session TTL with secure cookies

## External Integrations

**OpenAI API** (CONFIGURED):
- Model: gpt-4o-mini with structured JSON output
- Purpose: Natural language to invoice conversion
- Input validation: Zod schema validation
- Output: Structured invoice with client, items, dates, notes
- Token limits: max_completion_tokens set to 2048

**Resend** (CONFIGURED via Replit Connector):
- Transactional email delivery for invoices
- Beautiful HTML invoice templates
- Automatic from email configuration

**Replit Auth** (CONFIGURED):
- OpenID Connect identity provider
- Multiple login providers (Google, GitHub, Apple, email)
- Automatic token refresh

## Environment Variables

Required for operation:
- `OPENAI_API_KEY` - OpenAI API access (via Replit secrets)
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `REPL_ID` - Replit application ID (auto-provided)

Auto-provided by Replit:
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
- `REPLIT_CONNECTORS_HOSTNAME` - For Resend connector
- `REPL_IDENTITY` - For connector authentication

## Running the Project

```bash
npm run dev    # Start dev server (Vite + Express)
npm run build  # Build for production
npm run prod   # Run production build
```

The app runs on port 5000 and includes:
- Express API server on `/api/*`
- Vite frontend with HMR on `/`
- Automatic database schema creation
- Plan seeding on startup

## Testing the App

1. Visit the app URL
2. Click "Sign In" - redirects to Replit Auth
3. Login with Google, GitHub, Apple, or email/password
4. Auto-creates user, tenant, company, and Free plan subscription
5. Navigate to "Create Invoice"
6. Enter work description, let AI generate structured invoice
7. Send invoice via email to client
8. View invoices, update status, manage company settings
9. Login as admin to see tenant metrics and activity logs

## What's Ready for Production

✅ Replit Auth integration (OAuth 2.0)
✅ Multi-tenant data isolation
✅ Secure session management
✅ Email invoice delivery via Resend
✅ AI-powered invoice generation
✅ Beautiful responsive UI with dark mode
✅ Form validation
✅ Activity logging
✅ Role-based access control
✅ Automatic plan provisioning

## Future Enhancements

- PDF invoice generation and download
- Stripe billing integration
- Logo upload for company branding
- Real-time notifications
- Invoice templates and customization
- Multi-currency support
- Recurring invoices
- Client portal access
