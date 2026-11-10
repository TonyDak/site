import { readFile, writeFile } from 'node:fs/promises';
import { emitKeypressEvents } from 'node:readline';
import { createInterface } from 'node:readline/promises';
import envPackage from '@next/env';
import { hashPassword } from '../lib/auth/core.ts';

envPackage.loadEnvConfig(process.cwd(), true);
const path = '.env.local';
let original = await readFile(path, 'utf8').catch(() => '');
let username = process.env.ADMIN_USERNAME || 'admin';
let password;
if (process.argv.includes('--migrate-existing')) {
  password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 12 || password.length > 256) throw Error('Existing ADMIN_PASSWORD must have 12-256 characters. Run npm run admin:setup to choose a new password.');
} else {
  if (!process.stdin.isTTY) throw Error('Run this command in an interactive terminal.');
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  username = (await prompt.question(`Admin username [${username}]: `)).trim() || username;
  prompt.close();
  async function hiddenPassword(label) {
    process.stdout.write(label);
    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    return new Promise((resolve, reject) => {
      let value = '';
      function keypress(str, key = {}) {
        if (key.ctrl && key.name === 'c') { finish(); reject(Error('Cancelled.')); }
        else if (key.name === 'return' || key.name === 'enter') { finish(); resolve(value); }
        else if (key.name === 'backspace') value = Array.from(value).slice(0, -1).join('');
        else if (str && !key.ctrl && !key.meta && !/[\x00-\x1f\x7f]/.test(str)) value += str;
      }
      function finish() {
        process.stdin.off('keypress', keypress); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write('\n');
      }
      process.stdin.on('keypress', keypress);
    });
  }
  password = await hiddenPassword('New password (12-256 characters, hidden): ');
  if (password !== await hiddenPassword('Confirm password: ')) throw Error('Passwords do not match.');
}
if (!/^[\w.@-]{3,64}$/.test(username)) throw Error('Username must have 3-64 letters, digits, dots, @, underscores or hyphens.');
const passwordHash = await hashPassword(password);
original = original.split(/\r?\n/).filter(line => !/^\s*ADMIN_(USERNAME|PASSWORD|PASSWORD_HASH|SECRET|ORIGIN)\s*=/.test(line)).join('\n').trimEnd();
await writeFile(path, `${original}\n\n# Server-only admin authentication\nADMIN_USERNAME=${username}\nADMIN_PASSWORD_HASH=${passwordHash}\nADMIN_ORIGIN=http://localhost:3000\n`, { mode: 0o600 });
console.log(`Configured ${username}. Password stored as a scrypt hash; previous sessions are invalidated. Run npm run env:cloudflare to refresh the ignored Cloudflare files.`);
