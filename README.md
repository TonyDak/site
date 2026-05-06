# Portfolio Site

Netwrix-inspired multi-page portfolio built with Next.js App Router and TypeScript.

## Stack

- Next.js 16 (App Router)
- TypeScript
- CSS tokens + utility/component layers
- Route transition + reveal-on-scroll motion system

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Quality Checks

```bash
npm run lint
npm run build
```

## Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional: enable real email delivery for contact form
RESEND_API_KEY=your_resend_api_key
CONTACT_TO_EMAIL=you@your-domain.com
CONTACT_FROM_EMAIL=Portfolio Bot <noreply@your-domain.com>

# MongoDB storage
MONGODB_URI=mongodb+srv://user:pass@cluster.example.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=portfolio

# Optional admin access
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose-a-strong-password
ADMIN_SECRET=choose-a-long-random-secret
```

MongoDB is the only content source for site settings, projects, and notes. The app no longer falls back to local seed JSON files.

If Resend variables are not provided, contact submissions are accepted and logged but email delivery is skipped.

## Important Routes

- `/` home
- `/projects` list of case studies
- `/projects/[slug]` project detail
- `/blog` notes list
- `/blog/[slug]` note detail
- `/contact` contact form
- `/sitemap.xml` generated sitemap
- `/robots.txt` generated robots file
- `/opengraph-image` dynamic OG image

## Content Editing

- Admin entry: `/admin/login`
- Admin dashboard: `/admin`
- Project content: MongoDB `projects` collection
- Notes content: MongoDB `posts` collection
- Site identity and links: MongoDB `site` document

## Admin Notes

- The admin area is protected by a signed cookie session and `proxy.ts`.
- In production, set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SECRET`; otherwise the app uses local fallback credentials only for development.
- Saving content updates MongoDB, so public pages reflect changes on the next request.
