import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });

const processHandle = Bun.spawn(['bun', 'run', 'build:emit'], {
  cwd: repositoryRoot,
  stdin: 'ignore',
  stdout: 'inherit',
  stderr: 'inherit'
});
const exitCode = await processHandle.exited;
if (exitCode !== 0) {
  throw new Error(`Package declaration build failed with exit code ${exitCode}.`);
}
