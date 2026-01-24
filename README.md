# AlpineCrypto Capital

Institutional-grade digital asset investment platform built with Next.js, Supabase, and i18next.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (Icons)
- **Supabase** (Auth + Database)
- **i18next** (Internationalization)

## Features

### Core Functionality

1. **Professional Landing Page**
   - Risk-aware, professional language
   - Investment Approach, Risk Management, Transparency sections
   - Regulatory & Risk Disclosures

2. **Authentication**
   - Email + password authentication via Supabase Auth
   - KYC-ready user profile fields (country, residency region, investor type)

3. **Investor Dashboard**
   - Portfolio Value
   - Allocated Capital
   - Strategy Exposure
   - Activity & Allocation History
   - Reporting period selector

4. **Capital Allocation**
   - Request allocation to strategy categories
   - Three strategy types:
     - Conservative Digital Asset Strategy
     - Balanced Digital Asset Strategy
     - Growth-Oriented Digital Asset Strategy
   - Admin approval required for allocations

5. **Admin Panel**
   - Approve or reject allocation requests
   - Manage users (freeze/unfreeze)
   - Portfolio valuation management
   - Generate reports

6. **Multi-language Support**
   - English (default)
   - German
   - Arabic (RTL support)
   - Polish
   - Bulgarian
   - Lithuanian
   - Slovak
   - Spanish

7. **Compliance Pages**
   - Risk Disclosure
   - Terms of Service (placeholder)
   - Privacy Policy (placeholder)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "AlpineCrypto Capital"
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
   - Configure Row Level Security (RLS) policies as needed

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- `profiles` - User profiles with KYC information
- `allocation_requests` - Capital allocation requests (pending/admin approval)
- `allocations` - Approved capital allocations
- `portfolio_valuations` - Portfolio valuation snapshots

See `supabase/schema.sql` for the complete schema.

## Important Notes

### Compliance & Risk

- This platform does NOT guarantee returns or profits
- All investments carry risk
- Past performance does not guarantee future results
- No automated interest accrual
- No fixed daily or hourly returns
- Portfolio valuations are admin-controlled or market-data driven

### Admin Access

To grant admin access to a user:
1. Go to Supabase Dashboard > Authentication > Users
2. Edit the user's metadata
3. Add `is_admin: true` to the user metadata

### Production Deployment

Before deploying to production:

1. Review and customize all compliance pages (Terms, Privacy Policy, Risk Disclosure)
2. Configure proper RLS policies for your use case
3. Set up proper error handling and logging
4. Configure email templates for Supabase Auth
5. Set up proper security headers
6. Test all features thoroughly
7. Ensure GDPR compliance (cookie consent, data processing, etc.)

## Project Structure

```
.
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel
│   ├── allocation/        # Capital allocation requests
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Investor dashboard
│   └── ...                # Other pages
├── components/            # React components
│   ├── home/             # Landing page components
│   ├── compliance/       # Compliance page components
│   └── providers/        # Context providers
├── lib/                   # Utilities and configurations
│   ├── i18n/             # i18next configuration
│   └── supabase/         # Supabase clients
├── locales/              # Translation files
│   ├── en/
│   ├── de/
│   ├── ar/
│   └── ...
├── supabase/             # Database schema
└── types/                # TypeScript types
```

## License

[Your License Here]

## Support

For support, please contact [your support email].
