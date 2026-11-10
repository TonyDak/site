# Blog images, video and downloads

## Studio and reader experience

Sign in at `/admin`. Choose a post or create a draft. The media toolbar supports choosing files, dropping up to ten files at a time, and pasting images into the Markdown editor. Files are uploaded one at a time and inserted at the current cursor. While upload is running, saving and switching posts are disabled. Successful files from a partially failed batch are inserted; errors identify the remaining files. Switching drafts aborts any outstanding browser upload.

Use **Choose cover**, or **Use as cover** on an uploaded image. Add a descriptive alt text; remove cover to clear it. Covers appear in the public blog list and at the top of the article. **Insert image** accepts a URL, alt text and caption. Other toolbar buttons insert video, ordinary links and download links. The split preview and full preview use the same renderer as public articles. Preview does not save or publish. Save with the Published checkbox off for a draft; turn it on when ready to publish.

Uploaded files are immediately public, including files used by unpublished drafts. Do not upload private material. Removing a reference or a cover does not delete its R2 object; this prevents accidentally breaking other posts. Remove unused objects through R2 after checking references. This version has no media library pagination, automatic orphan cleanup, image transcoding, antivirus scanning or video transcoding. Signature checks identify expected file formats; they do not certify file contents as harmless.

Markdown examples:

```markdown
![Architecture diagram](https://media.ducnh.tech/blog/2026/11/example.png "How requests flow through the system")

[video](https://media.ducnh.tech/blog/2026/11/demo.mp4)

[video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

[video](https://vimeo.com/123456)

[Project repository](https://github.com/example/project)

[download: Source code](https://media.ducnh.tech/blog/2026/11/source.zip)
```

Headings, fenced code blocks, quotes, ordered/unordered lists, bold text and inline code are supported. Raw HTML stays text. Unsafe URL schemes are rejected. YouTube embeds use `youtube-nocookie.com`; Vimeo uses `player.vimeo.com`; arbitrary iframe HTML/hosts are not supported. Uploaded MP4/WebM files use native browser controls, without autoplay. Playback depends on the video's codec support in the visitor's browser; prefer H.264/AAC MP4 for broad compatibility. External video players contact their providers. External download URLs follow the source server's Content-Disposition policy.

## R2 setup

The upload route uses R2's S3 API, so it works in Node development and on the existing Workers Next.js adapter without adding an adapter-specific binding dependency. It does not require an R2 binding or browser CORS configuration: the browser sends bytes to `/api/admin/media`, and the server signs a PUT to R2. Keys never reach the browser.

1. Create an R2 bucket, for example `portfolio-media`. No bucket was created by this implementation.
2. Connect a public custom domain, for example `media.ducnh.tech`, to that bucket. Use a separate media hostname, not the site's Worker hostname. R2's `r2.dev` URL is intended for development; custom domains allow Cloudflare Cache. Set suitable Cache Rules if required. Keep private files in a separate private bucket.
3. Create R2 S3 API credentials with **Object Read & Write** scoped to this bucket only. Store the access key and secret key as Worker Secrets. Do not use account-wide administrative credentials.
4. Add these variables to the Worker serving the production site under **Settings → Variables and Secrets**, and to ignored `.env.local` for local testing:

| Variable | Type | Meaning |
| --- | --- | --- |
| `R2_ACCOUNT_ID` | Text | Cloudflare account ID, 32 hexadecimal characters |
| `R2_BUCKET_NAME` | Text | Exact bucket name |
| `R2_ACCESS_KEY_ID` | Secret | Bucket-scoped S3 access key |
| `R2_SECRET_ACCESS_KEY` | Secret | Matching S3 secret key |
| `R2_PUBLIC_URL` | Text | Public HTTPS bucket domain, e.g. `https://media.ducnh.tech` |

`npm run env:cloudflare -- --origin=https://www.ducnh.tech` exports configured values without printing secrets. `.env.cloudflare` and `.cloudflare.secrets.json` are ignored; do not commit them. Runtime settings are distinct from Build variables. The committed `wrangler.jsonc` preserves dashboard Text variables with `keep_vars: true` and declares non-secret R2 settings in `vars`. R2 credential names appear in `secrets.required`; values stay in Dashboard Secrets. Update both local configuration and the committed non-secret settings when intentionally changing buckets/domains. Use Deploy command `npm run deploy:cloudflare`, which explicitly selects the config so that the OpenNext build hook runs before upload. Bare `npx wrangler deploy` can delegate too early and fail on a clean checkout.

5. Deploy the code and save/deploy the runtime settings. Missing R2 settings disable upload with a clear error; the existing blog and admin login continue independently. A custom domain must be connected and publicly accessible for returned media URLs to load.
6. Verify as admin: upload an image, preview it, use it as cover, add a caption, then save a draft. Reload and check that media/cover persist. Publish a test post only when intended and check it as a logged-out reader; verify image, native video, external embed, link and download on mobile. Delete any test content/files yourself when finished.

## Upload restrictions

- Images: PNG, JPEG, WebP, GIF, AVIF; at most 10 MiB per file.
- Video: MP4 and WebM; at most 25 MiB per file. This conservative limit accounts for buffering/signing within a Workers process.
- Downloads: PDF and ZIP; at most 20 MiB per file. R2 objects carry attachment Content-Disposition.
- The server checks admin session and exact origin before reading the body; it validates filename/extension, declared MIME, file signature and actual streamed byte count. SVG, HTML, executable formats, traversal filenames, empty files and mismatches are rejected. Header Content-Length cannot bypass the bound.
- Auth/login/post-save APIs remain JSON-only. Only the media route accepts the explicitly selected binary content type, with the same origin/session policy. There is no anonymous upload or client-side storage credential.
- UUID keys prevent filename overwrite; original names are metadata only. Public objects use immutable cache headers. Upload and storage errors never include raw backend messages or credentials.

Files are buffered for inspection and S3 signing. For long videos, use a YouTube/Vimeo embed or a dedicated video service rather than expanding these limits. There is no automatic retry that could create duplicate uploads after an uncertain network result.

References: [Cloudflare R2 aws4fetch](https://developers.cloudflare.com/r2/examples/aws/aws4fetch/), [R2 API tokens](https://developers.cloudflare.com/r2/api/tokens/), [public buckets and custom domains](https://developers.cloudflare.com/r2/buckets/public-buckets/).
