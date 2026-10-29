/* global suite, test, suiteSetup */

/**
 * The preview loads our script after crossnote's Mermaid only when Pele is
 * the chosen engine, so the default adds nothing to the page.
 */

const assert = require('assert');
const path = require('path');
const esbuild = require('esbuild');

let MermaidEngineScript;

suite('mermaid engine script', function () {
  this.timeout(30000);

  suiteSetup(async function () {
    const result = await esbuild.build({
      stdin: {
        contents:
          "export { MermaidEngineScript } from './src/mermaid-engine-script';",
        resolveDir: path.join(__dirname, '..'),
        loader: 'ts',
      },
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node18',
      write: false,
      logLevel: 'silent',
    });
    const module = { exports: {} };
    new Function('module', 'exports', result.outputFiles[0].text)(
      module,
      module.exports,
    );
    MermaidEngineScript = module.exports.MermaidEngineScript;
  });

  test('adds nothing to the page when Mermaid is chosen', () => {
    const sut = new SUT('mermaid');

    assert.strictEqual(sut.html(), '');
  });

  test('loads the bundle telling it Pele is chosen', () => {
    const sut = new SUT('pele');

    assert.strictEqual(
      sut.html(),
      '<script src="vscode-webview://x/mermaid-engine.js" data-engine="pele"></script>',
    );
  });
});

class SUT {
  constructor(engine) {
    this.script = new MermaidEngineScript(
      engine,
      'vscode-webview://x/mermaid-engine.js',
    );
  }

  html() {
    return this.script.html();
  }
}
