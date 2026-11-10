import { writeFile } from 'node:fs/promises';
import envPackage from '@next/env';

const { combinedEnv } = envPackage.loadEnvConfig(process.cwd(), true);
const keys = ['NEXT_PUBLIC_SITE_URL', 'MONGODB_URI', 'MONGODB_DB', 'RESEND_API_KEY', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL', 'ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH'];
const values = Object.fromEntries(keys.filter(k => combinedEnv[k]).map(k => [k, combinedEnv[k]]));
// Do not export sample mail credentials as if they were working production configuration.
for (const key of ['RESEND_API_KEY', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL']) {
  if (values[key] && /your[-_ ]|placeholder|replace[-_ ]|xxxxx|<password>/i.test(values[key])) delete values[key];
}
const explicitOrigin = process.argv.find(arg => arg.startsWith('--origin='))?.slice(9);
const origin = explicitOrigin || values.NEXT_PUBLIC_SITE_URL;
if (!origin || new URL(origin).origin !== origin || !origin.startsWith('https://') || origin.includes('your-domain.com')) throw Error('Provide the exact HTTPS production origin: npm run env:cloudflare -- --origin=https://www.ducnh.tech');
if (!values.ADMIN_PASSWORD_HASH) throw Error('Run npm run admin:setup first.');
values.ADMIN_ORIGIN = origin;
values.NEXT_PUBLIC_SITE_URL = origin;
await writeFile('.env.cloudflare', Object.entries(values).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join('\n') + '\n', { mode: 0o600 });
const secrets = Object.fromEntries(['MONGODB_URI', 'RESEND_API_KEY', 'ADMIN_PASSWORD_HASH'].filter(k => values[k]).map(k => [k, values[k]]));
await writeFile('.cloudflare.secrets.json', JSON.stringify(secrets, null, 2) + '\n', { mode: 0o600 });
console.log(`Prepared ignored .env.cloudflare and .cloudflare.secrets.json for ${origin}. Secrets were not printed.`);
