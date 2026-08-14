# Mexcon Autos Platform

A Progressive Web Application (PWA) for Japanese and South Korean auto spare parts catalogue and enquiry management.

## 🚀 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **Heroicons** - Icon library
- **React Hot Toast** - Toast notifications

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Storage
  - Row Level Security

### Deployment
- **Vercel** - Frontend hosting and deployment

## 📋 Features

### Customer Features
- ✅ Product browsing and search
- ✅ Advanced vehicle-based search (Manufacturer → Model → Year → Engine → Category)
- ✅ Product details with compatibility information
- ✅ Quote request submission
- ✅ WhatsApp integration
- ✅ PWA installation support
- ✅ Featured products and latest arrivals
- ✅ Responsive design (mobile, tablet, desktop)

### Admin Features
- ✅ Secure authentication
- ✅ Role-based access control (Super Admin, Content Manager, Enquiry Manager)
- ✅ Product management (CRUD, featuring, archiving)
- ✅ Category management
- ✅ Brand management
- ✅ Enquiry management with status tracking
- ✅ Media library
- ✅ Platform settings
- ✅ Dashboard with analytics
- ✅ Audit logging

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mexcon-autos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_WHATSAPP_NUMBER=+234XXXXXXXXXX
   VITE_CONTACT_EMAIL=info@mexconautos.com
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase-schema.sql`
   - Execute the SQL script
   - Update the default admin password hash

5. **Set up Supabase Storage**
   Create the following storage buckets in your Supabase project:
   - `products` (public)
   - `categories` (public)
   - `brands` (public)
   - `enquiries` (private - authenticated only)
   - `media-library` (public)
   - `banners` (public)

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
mexcon-autos/
├── .kiro/                    # Kiro specs (requirements, design, tasks)
│   └── specs/
│       └── mexcon-autos-platform/
│           └── requirements.md
├── public/                   # Static assets
├── src/
│   ├── assets/              # Images, fonts, etc.
│   ├── components/          # React components
│   │   ├── common/         # Reusable UI components
│   │   ├── customer/       # Customer-facing components
│   │   ├── admin/          # Admin dashboard components
│   │   └── layout/         # Layout components (Header, Footer)
│   ├── contexts/            # React contexts (Auth, etc.)
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   │   ├── customer/       # Public pages
│   │   └── admin/          # Admin pages
│   ├── services/            # API services and Supabase client
│   ├── styles/              # Global styles and Tailwind config
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Helper utilities
│   ├── App.tsx              # Main App component
│   └── main.tsx             # Entry point
├── supabase-schema.sql      # Database schema
├── .env.example             # Environment variables template
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── package.json             # Dependencies and scripts
```

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## 🔐 Authentication

The platform uses Supabase Auth for admin and customer authentication:

- Default admin email: `admin@mexconautos.com`
- Default password: **Change this in the database!** (or run `scripts/reset-admin.cjs` with `ADMIN_PASSWORD` set)

### Password recovery

The app implements the full forgot-password flow:

- `GET /forgot-password` — enter your email, a reset link is sent via Supabase
- `GET /reset-password` — the emailed link lands here; set a new password

**Supabase setup required (one-time):**

1. **Site URL** — Supabase → Authentication → URL Configuration → Site URL = your live site (e.g. `https://mexcon-autos.vercel.app`). It must match production; `window.location.origin` is appended with `/reset-password` so the reset link opens the right page in both dev and prod.
2. **Redirect URLs** — add the same site URL(s) so the auth email links are allowed.
3. **Email template** — Authentication → Emails → *Reset password*: keep the default `{{ .ConfirmationURL }}` subject/body. The `ConfirmationURL` already includes the `/reset-password` redirect appended by `resetPasswordForEmail`.

Notes:

- Reset links are single-use and expire (~1 hour, Supabase default).
- The same flow works for admins and customers because both use Supabase Auth. If an account doesn't receive email links, confirm the SMTP/email provider is configured (Supabase → Authentication → Emails → Settings).

### Transactional emails (Resend)

Order confirmations and customer welcome emails are sent from the database
through the `pg_net` → Resend pipeline (migrations `20260810_order_emails.sql`
and `20260814_welcome_email.sql`). The API key, sender and base URL live in the
`app_secrets` table — never in the browser or the repo:

| key                 | example value                         |
| ------------------- | ------------------------------------- |
| `resend_api_key`    | Resend API key                        |
| `resend_from_email` | `Mexcon Autos <info@mexconautos.com>` |
| `app_base_url`      | `https://mexconautos.com`             |

**Before emails reach real recipients, verify a domain in Resend:**

1. Resend → Domains → Add Domain (e.g. `mexconautos.com`) and add the DNS records your DNS provider.
2. Wait for the domain to show **Verified**.
3. Update `app_secrets.resend_from_email` to use that domain (`info@mexconautos.com`).
4. Check delivery in Supabase → Table Editor → `email_logs` (`status = queued` means the API accepted the job; the actual HTTP result is in `net._http_response`).

Note: on Resend's free tier, unverified accounts can only send to the account owner's own email address.

### Supabase signup-confirmation email

New customer signups trigger Supabase's built-in confirmation email (which
references the Site URL — the "localhost" link you see before the Site URL is
configured). To brand it:

1. **Site URL** — Supabase → Authentication → URL Configuration → Site URL = your live site URL (e.g. `https://mexcon-autos.vercel.app`). This is what fixes the "localhost" link.
2. **Template** — Authentication → Emails → *Confirm signup*: replace the body with the paste-ready branded HTML in [`supabase/email-templates/confirm-signup.html`](supabase/email-templates/confirm-signup.html) (keep the `{{ .ConfirmationURL }}` variable).

### Admin accounts

To create a bcrypt password hash (legacy `password_hash` column, not used by Supabase Auth):
1. Use https://bcrypt-generator.com/
2. Or use Node.js: `bcrypt.hash('your-password', 10)`
3. Update the `password_hash` in the `admin_users` table

## 🗄️ Database Schema

See `supabase-schema.sql` for the complete schema including:
- Tables: products, categories, brands, enquiries, admin_users, etc.
- Indexes for performance optimization
- Row Level Security (RLS) policies
- Default data (categories, brands, settings)

## 🎨 Customization

### Brand Colors
Update `tailwind.config.js` to match Mexcon Autos brand identity:
```javascript
colors: {
  primary: { /* Your primary color scale */ },
  secondary: { /* Your secondary color scale */ }
}
```

### Company Information
Update platform settings through the admin dashboard or directly in the `platform_settings` table.

## 📱 PWA Configuration

The app includes PWA capabilities. To configure:

1. Update `public/manifest.json` with:
   - App name and description
   - Icons (192x192, 512x512)
   - Theme colors

2. Service worker configuration is handled by Vite PWA plugin (to be configured).

## 🚀 Deployment

### Deploy to Vercel

1. **Connect your repository to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Configure environment variables** in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_WHATSAPP_NUMBER`
   - `VITE_CONTACT_EMAIL`

3. **Deploy**
   ```bash
   vercel --prod
   ```

## 📊 Performance Targets

- Lighthouse Performance Score: ≥ 90
- First Contentful Paint: < 2 seconds
- Largest Contentful Paint: < 4 seconds
- SEO Score: ≥ 90
- Accessibility Score: ≥ 90

## 🔒 Security

- HTTPS-only in production
- Row Level Security (RLS) on all database tables
- Input validation and sanitization
- XSS protection
- SQL injection prevention (parameterized queries)
- Secure password hashing (bcrypt)
- Rate limiting on API endpoints

## 📝 License

Proprietary - Mexcon Autos

## 🤝 Contributing

This is a private project. For questions or support, contact the development team.

## 📞 Support

- Email: dev@mexconautos.com
- Documentation: See `.kiro/specs/mexcon-autos-platform/`

---

Built with ❤️ for Mexcon Autos
