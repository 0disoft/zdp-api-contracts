import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

interface WorkflowStep {
  readonly name?: string;
  readonly uses?: string;
  readonly run?: string;
  readonly if?: string;
  readonly with?: Record<string, unknown>;
}

interface ReleaseWorkflow {
  readonly name?: string;
  readonly on?: {
    readonly push?: {
      readonly tags?: string[];
    };
  };
  readonly permissions?: Record<string, unknown>;
  readonly concurrency?: {
    readonly 'cancel-in-progress'?: boolean;
  };
  readonly jobs?: {
    readonly publish?: {
      readonly 'runs-on'?: string;
      readonly environment?: string;
      readonly permissions?: Record<string, unknown>;
      readonly steps?: WorkflowStep[];
    };
  };
}

const workflowPath = join(
  process.cwd(),
  '.github',
  'workflows',
  'release.yml'
);

describe('npm trusted publishing workflow', () => {
  it('binds tag releases to the npm environment with least privilege', () => {
    const workflow = loadWorkflow();
    const publish = workflow.jobs?.publish;

    expect(workflow.name).toBe('Publish npm package');
    expect(workflow.on?.push?.tags).toEqual(['v*']);
    expect(workflow.permissions).toEqual({});
    expect(workflow.concurrency?.['cancel-in-progress']).toBe(false);
    expect(publish?.['runs-on']).toBe('ubuntu-latest');
    expect(publish?.environment).toBe('npm');
    expect(publish?.permissions).toEqual({
      contents: 'read',
      'id-token': 'write'
    });
  });

  it('pins release actions and keeps repository credentials out of checkout', () => {
    const steps = loadWorkflow().jobs?.publish?.steps ?? [];
    const checkout = stepByName(steps, 'Checkout');
    const setupNode = stepByName(steps, 'Set up Node');
    const setupBun = stepByName(steps, 'Set up Bun');

    expect(checkout.uses).toBe(
      'actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0'
    );
    expect(checkout.with).toMatchObject({
      'fetch-depth': 0,
      'persist-credentials': false
    });
    expect(setupNode.uses).toBe(
      'actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e'
    );
    expect(setupNode.with).toMatchObject({
      'node-version': '24',
      'package-manager-cache': false,
      'registry-url': 'https://registry.npmjs.org'
    });
    expect(setupBun.uses).toBe(
      'oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6'
    );
    expect(setupBun.with).toMatchObject({
      'bun-version': '1.3.14',
      'no-cache': true
    });
  });

  it('publishes only a validated main-line tag through OIDC with provenance', () => {
    const source = readFileSync(workflowPath, 'utf8');
    const steps = loadWorkflow().jobs?.publish?.steps ?? [];

    expect(stepByName(steps, 'Verify tagged commit is on main').run).toContain(
      'git merge-base --is-ancestor "$GITHUB_SHA" "origin/main"'
    );
    expect(stepByName(steps, 'Verify trusted publishing runtime').run).toContain(
      'npm 11.5.1 or later is required'
    );
    expect(stepByName(steps, 'Verify release tag').run).toContain(
      'expected_tag="v${package_version}"'
    );
    expect(stepByName(steps, 'Verify package contracts').run).toBe(
      'bun run check'
    );
    expect(stepByName(steps, 'Verify export plan').run).toBe(
      'bun run export:plan'
    );
    expect(stepByName(steps, 'Verify packed consumer').run).toBe(
      'bun run smoke:package'
    );
    expect(stepByName(steps, 'Publish package')).toMatchObject({
      if: "steps.npm_state.outputs.already_published != 'true'",
      run: 'npm publish --access public --provenance'
    });
    expect(source).not.toContain('NODE_AUTH_TOKEN');
    expect(source).not.toContain('NPM_TOKEN');
    expect(source).not.toContain('secrets.');
  });

  it('treats an existing version as valid only when gitHead matches the tag', () => {
    const steps = loadWorkflow().jobs?.publish?.steps ?? [];
    const existing = stepByName(steps, 'Verify existing npm source anchor');
    const result = stepByName(steps, 'Verify npm registry result');

    expect(existing.if).toBe(
      "steps.npm_state.outputs.already_published == 'true'"
    );
    expect(existing.run).toContain('published_git_head');
    expect(existing.run).toContain('!= "$GITHUB_SHA"');
    expect(result.run).toContain('published_integrity');
    expect(result.run).toContain('max_attempts=12');
  });

  it('installs the published package and verifies registry signatures and provenance', () => {
    const steps = loadWorkflow().jobs?.publish?.steps ?? [];
    const publishedSmoke = stepByName(
      steps,
      'Verify published consumer and provenance'
    );
    const script = readFileSync(
      join(process.cwd(), 'scripts', 'smoke-published-package.ts'),
      'utf8'
    );

    expect(publishedSmoke.run).toBe('bun run smoke:published');
    expect(script).toContain("'--save-exact'");
    expect(script).toContain("['audit', 'signatures']");
    expect(script).toContain("'zdp-api-contracts/api-contracts'");
    expect(script).toContain("'zdp-api-contracts/api-export-plan'");
  });
});

function loadWorkflow(): ReleaseWorkflow {
  return parse(readFileSync(workflowPath, 'utf8')) as ReleaseWorkflow;
}

function stepByName(steps: WorkflowStep[], name: string): WorkflowStep {
  const step = steps.find((candidate) => candidate.name === name);
  if (!step) {
    throw new Error(`Expected release workflow step \`${name}\`.`);
  }
  return step;
}
