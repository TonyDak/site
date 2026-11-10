import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export function cloudflareBuildEnvironment(base, config) {
  const value=config.vars?.NEXT_PUBLIC_SITE_URL;
  let url;
  try { url=new URL(value); } catch { throw Error('Configure a canonical HTTPS NEXT_PUBLIC_SITE_URL in wrangler.jsonc.'); }
  if(url.protocol!=='https:' || url.origin!==value || url.username || url.password) {
    throw Error('Configure a canonical HTTPS NEXT_PUBLIC_SITE_URL in wrangler.jsonc.');
  }
  // Wrangler runtime bindings are not inherited by custom builds. Only this public
  // setting belongs in Next's client/static output; do not copy the vars object.
  return {...base,NEXT_PUBLIC_SITE_URL:value};
}

export function stripCompiledRuntimeEnv(outputDirectory) {
  // OpenNext normally embeds .env* as fallback defaults in this generated module.
  // Runtime credentials and database selection must come from Worker bindings,
  // never from the developer's ignored local files or a previous build.
  writeFileSync(resolve(outputDirectory,'cloudflare','next-env.mjs'),
    '// Runtime values are supplied exclusively by Cloudflare bindings.\n'+
    ['production','development','test'].map(mode=>`export const ${mode} = {};\n`).join(''));
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const root=fileURLToPath(new URL('../',import.meta.url));
  const config=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
  const cli=fileURLToPath(new URL('../node_modules/@opennextjs/cloudflare/dist/cli/index.js',import.meta.url));
  const result=spawnSync(process.execPath,[cli,'build',...process.argv.slice(2)],{
    cwd:root,stdio:'inherit',env:cloudflareBuildEnvironment(process.env,config),
  });
  if(result.error) console.error('Could not start the Cloudflare build. Run npm ci first.');
  if(result.status===0) stripCompiledRuntimeEnv(resolve(root,'.open-next'));
  process.exitCode=result.status??1;
}
