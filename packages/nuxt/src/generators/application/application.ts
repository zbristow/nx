import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  GeneratorCallback,
  joinPathFragments,
  offsetFromRoot,
  runTasksInSerial,
  toJS,
  Tree,
} from '@nx/devkit';
import { Schema } from './schema';
import nuxtInitGenerator from '../init/init';
import { normalizeOptions } from './lib/normalize-options';
import { createTsConfig } from '../../utils/create-ts-config';
import { getRelativePathToRootTsConfig } from '@nx/js';
import { updateGitIgnore } from '../../utils/update-gitignore';
import { Linter } from '@nx/eslint';
import { addE2e } from './lib/add-e2e';
import { addLinting } from '../../utils/add-linting';
import { addVitest } from './lib/add-vitest';
import { vueTestUtilsVersion, vitePluginVueVersion } from '@nx/vue';

export async function applicationGenerator(tree: Tree, schema: Schema) {
  const tasks: GeneratorCallback[] = [];

  const options = await normalizeOptions(tree, schema);

  const projectOffsetFromRoot = offsetFromRoot(options.appProjectRoot);

  const nuxtInitTask = await nuxtInitGenerator(tree, {
    ...options,
    skipFormat: true,
  });
  tasks.push(nuxtInitTask);

  addProjectConfiguration(tree, options.name, {
    root: options.appProjectRoot,
    projectType: 'application',
    sourceRoot: `${options.appProjectRoot}/src`,
    targets: {},
  });

  generateFiles(
    tree,
    joinPathFragments(__dirname, './files'),
    options.appProjectRoot,
    {
      ...options,
      offsetFromRoot: projectOffsetFromRoot,
      title: options.projectName,
      dot: '.',
      tmpl: '',
      style: options.style,
      projectRoot: options.appProjectRoot,
      buildDirectory: joinPathFragments(`dist/${options.appProjectRoot}/.nuxt`),
      nitroOutputDir: joinPathFragments(
        `dist/${options.appProjectRoot}/.output`
      ),
      hasVitest: options.unitTestRunner === 'vitest',
    }
  );

  if (options.style === 'none') {
    tree.delete(
      joinPathFragments(options.appProjectRoot, `src/assets/css/styles.none`)
    );
  }

  createTsConfig(
    tree,
    {
      projectRoot: options.appProjectRoot,
      rootProject: options.rootProject,
      unitTestRunner: options.unitTestRunner,
    },
    getRelativePathToRootTsConfig(tree, options.appProjectRoot)
  );

  updateGitIgnore(tree);

  tasks.push(
    await addLinting(tree, {
      projectName: options.projectName,
      projectRoot: options.appProjectRoot,
      linter: options.linter ?? Linter.EsLint,
      unitTestRunner: options.unitTestRunner,
      rootProject: options.rootProject,
    })
  );

  if (options.unitTestRunner === 'vitest') {
    tasks.push(
      addDependenciesToPackageJson(
        tree,
        {},
        {
          '@vue/test-utils': vueTestUtilsVersion,
          '@vitejs/plugin-vue': vitePluginVueVersion,
        }
      )
    );

    tasks.push(await addVitest(tree, options));
  }

  tasks.push(await addE2e(tree, options));

  if (options.js) toJS(tree);

  if (!options.skipFormat) await formatFiles(tree);

  return runTasksInSerial(...tasks);
}

export default applicationGenerator;
