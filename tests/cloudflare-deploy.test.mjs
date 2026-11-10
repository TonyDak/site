import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('deploy explicitly selects Wrangler config before framework delegation can skip the build hook',()=>{
  const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
  const command=pkg.scripts['deploy:cloudflare'];
  assert.match(command,/^wrangler deploy\b/);
  assert.match(command,/--config\s+wrangler\.jsonc(?:\s|$)/);
  assert.match(command,/--keep-vars(?:\s|$)/);
  const config=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
  assert.equal(config.build.command,'npm run build:cloudflare');
  assert.equal(config.keep_vars,true);
});
