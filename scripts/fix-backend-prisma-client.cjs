/**
 * npm workspaces hoist @prisma/client to the repo root; Prisma CLI still looks for it
 * under backend/node_modules when generating from backend/. Link the real package in.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const rootClient = path.join(root, 'node_modules', '@prisma', 'client');
const backendPrismaDir = path.join(root, 'backend', 'node_modules', '@prisma');
const linkPath = path.join(backendPrismaDir, 'client');

if (!fs.existsSync(rootClient)) {
  console.warn('[fix-backend-prisma-client] Skip: root node_modules/@prisma/client missing.');
  process.exit(0);
}

fs.mkdirSync(backendPrismaDir, { recursive: true });

const pkgJson = path.join(linkPath, 'package.json');
if (fs.existsSync(pkgJson)) {
  try {
    const name = JSON.parse(fs.readFileSync(pkgJson, 'utf8')).name;
    if (name === '@prisma/client') process.exit(0);
  } catch {
    /* replace broken path */
  }
}

if (fs.existsSync(linkPath)) {
  fs.rmSync(linkPath, { recursive: true, force: true });
}

const target = path.resolve(rootClient);
const type = process.platform === 'win32' ? 'junction' : 'dir';
fs.symlinkSync(target, linkPath, type);
