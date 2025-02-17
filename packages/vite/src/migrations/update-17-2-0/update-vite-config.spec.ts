import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  Tree,
  addProjectConfiguration,
  readProjectConfiguration,
} from '@nx/devkit';

import updateBuildDir from './update-vite-config';

describe('change-vite-ts-paths-plugin migration', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should add build outDir to vite.config.ts', async () => {
    addProject1(tree, 'demo');
    await updateBuildDir(tree);
    expect(tree.read('apps/demo/vite.config.ts', 'utf-8')).toMatchSnapshot();
    expect(
      readProjectConfiguration(tree, 'demo').targets.build.options.outputPath
    ).toBe('dist/apps/demo');
  });

  it('should add build outDir to vite.config.ts if build exists', async () => {
    addProject2(tree, 'demo2');
    await updateBuildDir(tree);
    expect(tree.read('demo2/vite.config.ts', 'utf-8')).toMatchSnapshot();
    expect(
      readProjectConfiguration(tree, 'demo2').targets.build.options.outputPath
    ).toBe('dist/demo2');
  });

  it('should add file replacements to vite.config.ts', async () => {
    addProject3(tree, 'demo3');
    await updateBuildDir(tree);
    expect(tree.read('demo3/vite.config.ts', 'utf-8')).toMatchSnapshot();
    expect(
      readProjectConfiguration(tree, 'demo3').targets.build.options.outputPath
    ).toBe('dist/demo3');
  });
});

function addProject1(tree: Tree, name: string) {
  addProjectConfiguration(tree, name, {
    root: `apps/${name}`,
    sourceRoot: `apps/${name}/src`,
    targets: {
      build: {
        executor: '@nx/vite:build',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'production',
        options: {
          outputPath: `dist/apps/${name}`,
          buildLibsFromSource: false,
        },
        configurations: {
          development: {
            mode: 'development',
          },
          production: {
            mode: 'production',
          },
        },
      },
    },
  });

  tree.write(
    `apps/${name}/vite.config.ts`,
    `
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/${name}',
  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    viteTsConfigPaths({ 
      root: '../../'
    })
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});

`
  );
}

function addProject2(tree: Tree, name: string) {
  addProjectConfiguration(tree, name, {
    root: `${name}`,
    sourceRoot: `${name}/src`,
    targets: {
      build: {
        executor: '@nx/vite:build',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'production',
        options: {
          outputPath: `dist/${name}`,
        },
        configurations: {
          development: {
            mode: 'development',
          },
          production: {
            mode: 'production',
          },
        },
      },
    },
  });

  tree.write(
    `${name}/vite.config.ts`,
    `
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/${name}',
  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    viteTsConfigPaths({ 
      root: '../../'
    })
  ],

  build: {
    someProperty: 'someValue',
  },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});

`
  );
}

function addProject3(tree: Tree, name: string) {
  addProjectConfiguration(tree, name, {
    root: `${name}`,
    sourceRoot: `${name}/src`,
    targets: {
      build: {
        executor: '@nx/vite:build',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'production',
        options: {
          outputPath: `dist/${name}`,
        },
        configurations: {
          development: {
            mode: 'development',
          },
          production: {
            mode: 'production',
            fileReplacements: [
              {
                replace: `${name}/src/environments/environment.ts`,
                with: `${name}/src/environments/environment.prod.ts`,
              },
            ],
          },
        },
      },
    },
  });

  tree.write(
    `${name}/vite.config.ts`,
    `
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/${name}',
  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    viteTsConfigPaths({ 
      root: '../../'
    })
  ],

  build: {
    someProperty: 'someValue',
  },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});

`
  );
}
