import { CreateNodesContext } from '@nx/devkit';
import type { NextConfig } from 'next';

import { createNodes } from './plugin';
import { TempFs } from '@nx/devkit/internal-testing-utils';

describe('@nx/next/plugin', () => {
  let createNodesFunction = createNodes[1];
  let context: CreateNodesContext;

  describe('root projects', () => {
    beforeEach(async () => {
      context = {
        nxJsonConfiguration: {
          namedInputs: {
            default: ['{projectRoot}/**/*'],
            production: ['!{projectRoot}/**/*.spec.ts'],
          },
        },
        workspaceRoot: '',
      };
    });

    afterEach(() => {
      jest.resetModules();
    });

    it('should create nodes', () => {
      const nextConfigPath = 'next.config.js';
      mockNextConfig(nextConfigPath, {});
      const nodes = createNodesFunction(
        nextConfigPath,
        {
          buildTargetName: 'build',
          devTargetName: 'dev',
          startTargetName: 'start',
        },
        context
      );

      expect(nodes).toMatchSnapshot();
    });
  });
  describe('integrated projects', () => {
    const tempFs = new TempFs('test');
    beforeEach(() => {
      context = {
        nxJsonConfiguration: {
          namedInputs: {
            default: ['{projectRoot}/**/*'],
            production: ['!{projectRoot}/**/*.spec.ts'],
          },
        },
        workspaceRoot: tempFs.tempDir,
      };

      tempFs.createFileSync(
        'my-app/project.json',
        JSON.stringify({ name: 'my-app' })
      );
      tempFs.createFileSync('my-app/next.config.js', '');
    });

    afterEach(() => {
      jest.resetModules();
    });

    it('should create nodes', () => {
      mockNextConfig('my-app/next.config.js', {});
      const nodes = createNodesFunction(
        'my-app/next.config.js',
        {
          buildTargetName: 'my-build',
          devTargetName: 'my-serve',
          startTargetName: 'my-start',
        },
        context
      );

      expect(nodes).toMatchSnapshot();
    });
  });
});

function mockNextConfig(path: string, config: NextConfig) {
  jest.mock(
    path,
    () => ({
      default: config,
    }),
    {
      virtual: true,
    }
  );
}
