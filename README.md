# Portfolio Site

Portfolio for Nguyễn Hữu Đức, built with Next.js App Router and TypeScript.

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

Create `.env.local` in the project root when deploying:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional: enable real email delivery for the contact form
RESEND_API_KEY=your_resend_api_key
CONTACT_TO_EMAIL=you@your-domain.com
CONTACT_FROM_EMAIL=Portfolio Bot <noreply@your-domain.com>
```

The portfolio does not use a database. All site identity, profile, skills, and project content is typed and stored in `lib/content/data.ts`, then bundled with the application.

If Resend variables are not provided, contact submissions are accepted and logged but email delivery is skipped.

## Important Routes

- `/` home
- `/about` experience and technology stack
- `/contact` contact form
- `/sitemap.xml` generated sitemap
- `/robots.txt` generated robots file
- `/opengraph-image` dynamic OG image

## Updating Content

Edit [lib/content/data.ts](./lib/content/data.ts) to update content. The file is version-controlled, type-checked, and contains the sole source of portfolio copy, including the NDA-safe project overviews on `/about`.
