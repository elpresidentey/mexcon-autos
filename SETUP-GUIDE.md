# Mexcon Autos Platform - Setup Guide

## 📋 Complete Setup Checklist

### 1. Prerequisites Installation

- [ ] Node.js 18 or higher installed
- [ ] npm or yarn package manager
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Supabase account created

### 2. Project Setup

```bash
# Clone and install
git clone <repository-url>
cd mexcon-autos
npm install
```

### 3. Supabase Setup

#### A. Create New Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database provisioning
4. Copy your project URL and anon key

#### B. Set Up Database
1. Go to SQL Editor in Supabase dashboard
2. Create a new query
3. Copy entire contents of `supabase-schema.sql`
4. Execute the SQL script
5. Verify tables are created under Database > Tables

#### C. Create Storage Buckets
Go to Storage in Supabase dashboard and create these buckets:

| Bucket Name | Public Access | Purpose |
|------------|---------------|---------|
| `products` | ✅ Public | Product images |
| `categories` | ✅ Public | Category images |
| `brands` | ✅ Public | Brand logos |
| `enquiries` | ❌ Private | Customer enquiry images |
| `media-library` | ✅ Public | General media files |
| `banners` | ✅ Public | Homepage banners |

**Storage Bucket Policies:**
For each PUBLIC bucket, add this policy:
```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'bucket-name' );

-- Allow authenticated uploads
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'bucket-name' AND auth.role() = 'authenticated' );
```

#### D. Set Up Authentication
1. Go to Authentication > Providers
2. Enable Email provider
3. **Disable** email confirmation for admin users (Settings > Auth > Email Auth > Confirm email)
4. Create first admin user:

```sql
-- In Supabase SQL Editor, create admin user
-- First, sign up through Supabase Auth UI with admin email
-- Then update their role in admin_users table

INSERT INTO admin_users (name, email, role) VALUES
('Super Admin', 'admin@mexconautos.com', 'super_admin');

-- Or if user already exists in auth.users:
INSERT INTO admin_users (id, name, email, role)
SELECT id, 'Super Admin', email, 'super_admin'
FROM auth.users
WHERE email = 'admin@mexconautos.com';
```

### 4. Environment Variables

Create `.env` file in root directory:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration
VITE_APP_NAME=Mexcon Autos
VITE_WHATSAPP_NUMBER=+234XXXXXXXXXX
VITE_CONTACT_EMAIL=info@mexconautos.com
VITE_CONTACT_PHONE=+234XXXXXXXXXX
```

**Where to find Supabase credentials:**
1. Go to Project Settings > API
2. Copy `URL` → use as `VITE_SUPABASE_URL`
3. Copy `anon public` key → use as `VITE_SUPABASE_ANON_KEY`

### 5. Brand Customization

#### A. Update Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    // Replace with Mexcon Autos brand colors
    500: '#0ea5e9',  // Main brand color
    600: '#0284c7',  // Darker shade
    // ... add complete scale
  }
}
```

#### B. Add Logo
1. Replace `public/favicon.ico` with Mexcon logo
2. Add `public/icon-192x192.png` (192x192px)
3. Add `public/icon-512x512.png` (512x512px)
4. Add `public/og-image.jpg` (1200x630px for social sharing)

#### C. Update Manifest
Edit `public/manifest.json` with correct app name and description.

### 6. Development

```bash
# Start development server
npm run dev

# App will be available at:
# http://localhost:5173
```

### 7. Testing the Setup

#### Test Customer Flow:
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Can view products (once data is added)
- [ ] Can submit quote request

#### Test Admin Flow:
- [ ] Can access `/admin/login`
- [ ] Can log in with admin credentials
- [ ] Dashboard loads
- [ ] Can add products
- [ ] Can manage categories
- [ ] Can view enquiries

### 8. Adding Initial Data

Use Supabase Dashboard or SQL Editor:

```sql
-- Add sample product
INSERT INTO products (name, category_id, brand_id, description, featured)
VALUES (
  'Water Pump - Toyota Corolla 2017',
  (SELECT id FROM categories WHERE name = 'Cooling System'),
  (SELECT id FROM brands WHERE name = 'Toyota'),
  'High-quality water pump compatible with Toyota Corolla 2017 models',
  true
);
```

### 9. Production Deployment

#### A. Vercel Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

4. **Add Environment Variables in Vercel**
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env`
   - Make sure they're available for Production, Preview, and Development

#### B. Configure Custom Domain
1. In Vercel dashboard, go to Domains
2. Add your custom domain (e.g., mexconautos.com)
3. Follow DNS configuration instructions
4. Update `VITE_APP_URL` if needed

### 10. Security Checklist

- [ ] Changed default admin password
- [ ] All RLS policies are active
- [ ] Storage buckets have correct permissions
- [ ] Environment variables are not committed to git
- [ ] HTTPS is enforced in production
- [ ] API rate limiting configured
- [ ] Backup strategy in place

### 11. Performance Optimization

- [ ] All images optimized (WebP format)
- [ ] Lighthouse score ≥ 90
- [ ] PWA installability test passes
- [ ] Mobile responsiveness tested
- [ ] Load time < 2 seconds

### 12. SEO Setup

- [ ] sitemap.xml generated
- [ ] robots.txt configured
- [ ] Meta tags added to all pages
- [ ] Open Graph images created
- [ ] Google Analytics integrated (optional)
- [ ] Google Search Console configured

## 🚨 Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution:** Make sure `.env` file exists and has correct VITE_ prefixed variables.

### Issue: Cannot connect to Supabase
**Solution:** 
1. Check if Supabase project is active
2. Verify URL and anon key are correct
3. Check network/firewall settings

### Issue: Admin login fails
**Solution:**
1. Verify admin user exists in both `auth.users` and `admin_users` tables
2. Check RLS policies are active
3. Verify password is correct

### Issue: Images not uploading
**Solution:**
1. Verify storage buckets exist
2. Check bucket policies
3. Verify file size < 5MB
4. Check file type is allowed (JPEG, PNG, WebP)

### Issue: Products not showing
**Solution:**
1. Check if products exist in database
2. Verify `archived = false`
3. Check RLS policy allows public read
4. Verify category and brand relationships

## 📞 Support

For issues not covered here:
1. Check `.kiro/specs/mexcon-autos-platform/requirements.md`
2. Review Supabase documentation
3. Contact development team

## 🎉 Next Steps

Once setup is complete:
1. Add product data
2. Upload product images
3. Configure platform settings
4. Test all user flows
5. Deploy to production
6. Monitor analytics and errors

---

**Setup completed?** You're ready to start building! 🚀
