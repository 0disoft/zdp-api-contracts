import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const result = Bun.spawnSync(
  [
    'git',
    'status',
    '--porcelain=v1',
    '--untracked-files=all',
    '--',
    'dist'
  ],
  {
    cwd: repositoryRoot,
    stdin: 'ignore',
    stdout: 'pipe',
    stderr: 'pipe'
  }
);
const stdout = new TextDecoder().decode(result.stdout).trimEnd();
const stderr = new TextDecoder().decode(result.stderr).trimEnd();

if (result.exitCode !== 0) {
  throw new Error(
    `Unable to inspect generated dist files with git.${stderr.length > 0 ? `\n${stderr}` : ''}`
  );
}

if (stdout.length === 0) {
  console.log('Generated dist matches the committed package output.');
} else {
  console.error('Generated dist differs from the committed package output.');
  console.error(stdout);
  console.error(
    'Run `bun run build`, review `git diff -- dist`, and commit every generated addition, modification, or deletion.'
  );
  process.exitCode = 1;
}
