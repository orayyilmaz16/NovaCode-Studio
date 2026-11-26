// Backfill helper: puts the current mac/linux electron-builder config onto an old tag's package.json
// so that tag can be packaged for macOS/Linux. Usage: node scripts/backfill-overlay.mjs <current package.json> <target package.json>
import { readFileSync, writeFileSync } from 'node:fs';

const [, , currentPath, targetPath] = process.argv;
if (!currentPath || !targetPath) { console.error('usage: backfill-overlay.mjs <current> <target>'); process.exit(2); }

const cur = JSON.parse(readFileSync(currentPath, 'utf8'));
const tgt = JSON.parse(readFileSync(targetPath, 'utf8'));

tgt.build = tgt.build || {};
for (const k of ['mac', 'linux']) tgt.build[k] = cur.build[k];
tgt.build.npmRebuild = false;
tgt.build.directories = { output: 'release' };
tgt.author = tgt.author || cur.author;
tgt.description = tgt.description || cur.description;

writeFileSync(targetPath, JSON.stringify(tgt, null, 2) + '\n');
console.log(`overlay ok: ${tgt.name}@${tgt.version}`);
