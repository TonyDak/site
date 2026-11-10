import test from 'node:test';
import assert from 'node:assert/strict';
import { cloudflareBuildEnvironment, stripCompiledRuntimeEnv } from '../scripts/build-cloudflare.mjs';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('clean CI builds receive canonical public URL without copying runtime settings or credentials',()=>{
  const env=cloudflareBuildEnvironment({PATH:'synthetic-path'}, {vars:{NEXT_PUBLIC_SITE_URL:'https://www.ducnh.tech',MONGODB_URI:'must-not-copy',ADMIN_PASSWORD_HASH:'must-not-copy'}});
  assert.deepEqual(env,{PATH:'synthetic-path',NEXT_PUBLIC_SITE_URL:'https://www.ducnh.tech'});
});
test('local env files cannot become compiled Worker credential fallbacks',()=>{
  const dir=mkdtempSync(join(tmpdir(),'portfolio-env-'));
  try {
    mkdirSync(join(dir,'cloudflare'));
    const file=join(dir,'cloudflare','next-env.mjs');
    writeFileSync(file,'export const production={MONGODB_URI:"synthetic-private-uri",MONGODB_DB:"wrong-database"};');
    stripCompiledRuntimeEnv(dir);
    const output=readFileSync(file,'utf8');
    assert.equal(output.includes('synthetic-private-uri'),false);
    assert.equal(output.includes('wrong-database'),false);
    for(const mode of ['production','development','test'])assert.ok(output.includes(`export const ${mode} = {};`));
  }finally{unlinkSync(join(dir,'cloudflare','next-env.mjs'));rmdirSync(join(dir,'cloudflare'));rmdirSync(dir);}
});
test('local or stale public build URLs cannot override the committed production URL',()=>{
  const env=cloudflareBuildEnvironment({NEXT_PUBLIC_SITE_URL:'http://localhost:3000'}, {vars:{NEXT_PUBLIC_SITE_URL:'https://www.ducnh.tech'}});
  assert.equal(env.NEXT_PUBLIC_SITE_URL,'https://www.ducnh.tech');
  for(const value of [undefined,'http://localhost:3000','https://user:password@example.com','https://example.com/nested']) {
    assert.throws(()=>cloudflareBuildEnvironment({}, {vars:{NEXT_PUBLIC_SITE_URL:value}}),/canonical HTTPS/);
  }
});
