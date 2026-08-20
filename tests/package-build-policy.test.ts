import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

interface PackageManifest {
  readonly engines?: {
    readonly node?: string;
  };
  readonly scripts?: Record<string, string>;
}

interface WorkflowStep {
  readonly name?: string;
  readonly uses?: string;
  readonly run?: string;
  readonly with?: Record<string, unknown>;
}

interface CiWorkflow {
  readonly jobs?: {
    readonly check?: {
      readonly steps?: WorkflowStep[];
    };
    readonly 'package-consumer'?: {
      readonly needs?: string;
      readonly strategy?: {
        readonly 'fail-fast'?: boolean;
        readonly matrix?: {
          readonly node?: string[];
        };
      };
      readonly steps?: WorkflowStep[];
    };
  };
}

const repositoryRoot = process.cwd();
const packagePath = join(repositoryRoot, 'package.json');
const ciWorkflowPath = join(
  repositoryRoot,
  '.github',
  'workflows',
  'ci.yml'
);

describe('package build and runtime policy', () => {
  it('declares only the Node majors exercised by consumer smoke', () => {
    const manifest = JSON.parse(
      readFileSync(packagePath, 'utf8')
    ) as PackageManifest;

    expect(manifest.engines?.node).toBe('^22.0.0 || ^24.0.0');
    expect(manifest.scripts?.['dist:check']).toBe(
      'bun run build && bun scripts/check-generated-dist.ts'
    );
  });

  it('rebuilds dist and rejects tracked, deleted, or untracked drift', () => {
    const workflow = loadCiWorkflow();
    const checkSteps = workflow.jobs?.check?.steps ?? [];
    const script = readFileSync(
      join(repositoryRoot, 'scripts', 'check-generated-dist.ts'),
      'utf8'
    );

    expect(stepByName(checkSteps, 'Verify generated dist').run).toBe(
      'bun run dist:check'
    );
    expect(script).toContain("'status'");
    expect(script).toContain("'--porcelain=v1'");
    expect(script).toContain("'--untracked-files=all'");
    expect(script).toContain("'dist'");
    expect(
      readFileSync(
        join(repositoryRoot, 'scripts', 'build-package.ts'),
        'utf8'
      )
    ).toContain("chmod(new URL('../dist/api-contracts/cli-bin.js'");
  });

  it('installs and executes the packed package on Node 22 and 24', () => {
    const workflow = loadCiWorkflow();
    const consumer = workflow.jobs?.['package-consumer'];
    const steps = consumer?.steps ?? [];
    const setupNode = stepByName(steps, 'Setup Node');
    const setupBun = stepByName(steps, 'Setup Bun');
    const packedSmoke = readFileSync(
      join(repositoryRoot, 'scripts', 'smoke-packed-package.ts'),
      'utf8'
    );
    const publishedSmoke = readFileSync(
      join(repositoryRoot, 'scripts', 'smoke-published-package.ts'),
      'utf8'
    );

    expect(consumer?.needs).toBe('check');
    expect(consumer?.strategy?.['fail-fast']).toBe(false);
    expect(consumer?.strategy?.matrix?.node).toEqual(['22', '24']);
    expect(setupNode.uses).toBe(
      'actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e'
    );
    expect(setupNode.with).toMatchObject({
      'node-version': '${{ matrix.node }}',
      'package-manager-cache': false
    });
    expect(setupBun.uses).toBe(
      'oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6'
    );
    expect(setupBun.with).toMatchObject({
      'bun-version': '1.3.14',
      'no-cache': true
    });
    expect(stepByName(steps, 'Smoke packed package').run).toBe(
      'bun run smoke:package'
    );
    expect(packedSmoke).toContain("'--engine-strict'");
    expect(publishedSmoke).toContain("'--engine-strict'");
  });
});

function loadCiWorkflow(): CiWorkflow {
  return parse(readFileSync(ciWorkflowPath, 'utf8')) as CiWorkflow;
}

function stepByName(steps: WorkflowStep[], name: string): WorkflowStep {
  const step = steps.find((candidate) => candidate.name === name);
  if (!step) {
    throw new Error(`Expected CI workflow step \`${name}\`.`);
  }
  return step;
}
