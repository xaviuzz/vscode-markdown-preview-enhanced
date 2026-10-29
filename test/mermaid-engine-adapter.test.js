/* global suite, test, suiteSetup, setup */

/**
 * The adapter stands in for the global `mermaid.render` in the preview
 * webview. It draws with the chosen engine; Pele falls back to Mermaid per
 * diagram, and a Mermaid failure surfaces unchanged.
 */

const assert = require('assert');
const path = require('path');
const esbuild = require('esbuild');

let MermaidEngineAdapter;

suite('mermaid engine adapter', function () {
  this.timeout(30000);

  suiteSetup(async function () {
    const result = await esbuild.build({
      stdin: {
        contents:
          "export { MermaidEngineAdapter } from './src/webview/mermaid-engine-adapter';",
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
    MermaidEngineAdapter = module.exports.MermaidEngineAdapter;
  });

  test('draws with Mermaid and never calls Pele when Mermaid is chosen', async () => {
    const sut = new SUT('mermaid');

    const drawn = await sut.draw('graph TD; A-->B');

    assert.deepStrictEqual(drawn, { svg: '<svg>mermaid</svg>' });
    assert.strictEqual(sut.peleWasAsked(), false);
  });

  test('returns the svg Pele draws when Pele is chosen', async () => {
    const sut = new SUT('pele');

    const drawn = await sut.draw('graph TD; A-->B');

    assert.deepStrictEqual(drawn, { svg: '<svg>pele</svg>' });
    assert.strictEqual(sut.mermaidWasAsked(), false);
  });

  test('draws with Mermaid the diagram Pele cannot draw', async () => {
    const sut = new SUT('pele');
    sut.peleCannotDraw(new Error('pele cannot draw this'));

    const drawn = await sut.draw('graph TD; A-->B');

    assert.deepStrictEqual(drawn, { svg: '<svg>mermaid</svg>' });
    assert.strictEqual(sut.mermaidWasAskedToDraw('graph TD; A-->B'), true);
  });

  test('keeps using Pele for the next diagram after a fallback', async () => {
    const sut = new SUT('pele');
    sut.peleCannotDraw(new Error('pele cannot draw this'));
    await sut.draw('broken');
    sut.peleRecovers();

    const drawn = await sut.draw('graph TD; A-->B');

    assert.deepStrictEqual(drawn, { svg: '<svg>pele</svg>' });
  });

  test('throws Mermaid error unchanged when both engines fail', async () => {
    const sut = new SUT('pele');
    const mermaidError = new Error('mermaid cannot draw this');
    sut.mermaidCannotDraw(mermaidError);
    sut.peleCannotDraw(new Error('pele cannot draw this'));

    const failure = await sut.drawFailure('broken');

    assert.strictEqual(failure, mermaidError);
  });
});

class SUT {
  constructor(engine) {
    this.mermaid = new FakeRenderer('<svg>mermaid</svg>');
    this.pele = new FakeRenderer('<svg>pele</svg>');
    this.adapter = new MermaidEngineAdapter(engine, this.mermaid, this.pele);
    this.drawings = 0;
  }

  peleCannotDraw(error) {
    this.pele.outcome = error;
  }

  mermaidCannotDraw(error) {
    this.mermaid.outcome = error;
  }

  peleRecovers() {
    this.pele.outcome = '<svg>pele</svg>';
  }

  peleWasAsked() {
    return this.pele.calls.length > 0;
  }

  mermaidWasAsked() {
    return this.mermaid.calls.length > 0;
  }

  mermaidWasAskedToDraw(code) {
    const codes = this.mermaid.calls.map((call) => call.code);
    return codes.includes(code);
  }

  async draw(code) {
    this.drawings += 1;
    const drawn = await this.adapter.render(`d${this.drawings}`, code);
    return drawn;
  }

  async drawFailure(code) {
    const failure = await this.draw(code).catch((error) => error);
    return failure;
  }
}

class FakeRenderer {
  constructor(outcome) {
    this.outcome = outcome;
    this.calls = [];
  }

  async render(id, code) {
    this.calls.push({ id, code });
    if (this.outcome instanceof Error) {
      throw this.outcome;
    }
    return { svg: this.outcome };
  }
}
