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

Profile, skills and project content live in `lib/content/data.ts`. Blog content and admin sessions use MongoDB. Admin access fails closed without the required database/auth configuration. Public blog reads may use bundled articles when storage is unavailable.

For secured admin setup, password reset and the prepared Cloudflare configuration for `https://www.ducnh.tech`, see [Cloudflare environment](docs/cloudflare-env.md). Local ignored files `.env.cloudflare` and `.cloudflare.secrets.json` contain the deployment values; `.env.example` is the safe template.

For an existing Cloudflare Workers deploy using `wrangler deploy`, use `npm run deploy:cloudflare` to preserve dashboard runtime variables with `--keep-vars`. Update the Cloudflare Workers Builds Deploy command to use it; a local package script does not change Dashboard settings automatically. Preserve any custom build/adapter steps. See the Cloudflare environment guide above for details.

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
