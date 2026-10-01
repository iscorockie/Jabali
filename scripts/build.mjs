import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const apiDir = path.join(rootDir, 'src', 'app', 'api');
const backupApiDir = path.join(rootDir, '.api-build-stash');
const outDir = path.join(rootDir, 'out');

// Build as full server/serverless app only when explicitly running on Vercel without static export flag;
// otherwise (GitHub Pages, Cloudflare Pages, static hosts, or `npm run build:pages`) generate `./out` static export.
const forceServerBuild =
  process.env.VERCEL === '1' && process.env.NEXT_OUTPUT_MODE !== 'export';

let stashed = false;

try {
  if (!forceServerBuild && fs.existsSync(apiDir)) {
    if (fs.existsSync(backupApiDir)) {
      fs.rmSync(backupApiDir, { recursive: true, force: true });
    }
    fs.renameSync(apiDir, backupApiDir);
    stashed = true;
    console.log('📦 Building static export for Pages (./out)...');
  } else {
    console.log('🚀 Building full Next.js server/serverless bundle...');
  }

  const env = {
    ...process.env,
    NEXT_OUTPUT_MODE: forceServerBuild ? 'server' : 'export',
  };

  execSync('npx next build', {
    stdio: 'inherit',
    env,
  });

  if (!forceServerBuild && fs.existsSync(outDir)) {
    fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
    console.log('✅ Static Pages export complete in ./out (with .nojekyll)');
  }
} finally {
  if (stashed && fs.existsSync(backupApiDir)) {
    fs.renameSync(backupApiDir, apiDir);
  }
}
