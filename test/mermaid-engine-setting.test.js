/* global suite, test, suiteSetup, setup */

/**
 * `mermaidEngine` picks the engine that draws Mermaid blocks in the preview.
 * Mermaid is the default, so nobody changes behavior without asking for it.
 */

const assert = require('assert');
const path = require('path');
const esbuild = require('esbuild');
const { stubPlugin, setConfiguration } = require('./vscode-stub');

let bundle;

function currentEngine() {
  return bundle.MarkdownPreviewEnhancedConfig.getCurrentConfig().mermaidEngine;
}

suite('mermaid engine setting', function () {
  this.timeout(30000);

  suiteSetup(async function () {
    const result = await esbuild.build({
      stdin: {
        contents:
          "export { MarkdownPreviewEnhancedConfig } from './src/config';",
        resolveDir: path.join(__dirname, '..'),
        loader: 'ts',
      },
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node18',
      write: false,
      logLevel: 'silent',
      plugins: [stubPlugin()],
    });
    const module = { exports: {} };
    new Function('module', 'exports', 'require', result.outputFiles[0].text)(
      module,
      module.exports,
      require,
    );
    bundle = module.exports;
  });

  setup(() => {
    setConfiguration({});
  });

  test('is mermaid when nothing is configured', () => {
    assert.strictEqual(currentEngine(), 'mermaid');
  });

  test('is pele when the user chooses it', () => {
    setConfiguration({ mermaidEngine: 'pele' });

    assert.strictEqual(currentEngine(), 'pele');
  });
});
