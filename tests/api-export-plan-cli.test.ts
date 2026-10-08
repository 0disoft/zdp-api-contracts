import { expect, test } from 'bun:test';

test('rejects malformed export options instead of silently planning the current repository', async () => {
  for (const args of [['--unknown'], ['--root'], ['--root', '--json'], ['--root', '-h'],
    ['--root', '.', '--root', '.'], ['unexpected']]) {
    const child = Bun.spawn([process.execPath, 'scripts/plan-api-exports.ts', ...args], { stdout: 'pipe', stderr: 'pipe' });
    const [stdout, stderr, exit] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited]);
    expect(exit).toBe(2);
    expect(stdout).toBe('');
    expect(stderr).toContain('Usage:');
  }
});
