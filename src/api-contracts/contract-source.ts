import { readFile, realpath } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';

export async function readContractSource(root: string, sourcePath: string): Promise<string> {
  const resolvedRoot = resolve(root);
  const resolvedFile = resolve(resolvedRoot, sourcePath);
  const relativeFile = relative(resolvedRoot, resolvedFile);

  if (
    relativeFile === '..' || relativeFile.startsWith(`..${sep}`) ||
    isAbsolute(relativeFile) ||
    relativeFile.length === 0
  ) {
    throw new Error(
      `Contract path \`${sourcePath}\` must remain under the repository root.`
    );
  }

  const realRoot = await realpath(resolvedRoot);
  const realFile = await realpath(resolvedFile);
  const realRelativeFile = relative(realRoot, realFile);
  if (realRelativeFile === '..' || realRelativeFile.startsWith(`..${sep}`) ||
      isAbsolute(realRelativeFile) || realRelativeFile.length === 0) {
    throw new Error(`Contract path \`${sourcePath}\` must resolve within the repository root.`);
  }
  return readFile(realFile, 'utf8');
}
