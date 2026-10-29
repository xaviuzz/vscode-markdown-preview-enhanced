import { render } from 'pele';
import type { MermaidEngine } from '../config';
import {
  DiagramRenderer,
  DiagramResult,
  MermaidEngineAdapter,
} from './mermaid-engine-adapter';

interface MermaidWindow {
  mermaid: DiagramRenderer;
}

class PeleRenderer implements DiagramRenderer {
  public render(_id: string, code: string): DiagramResult {
    const rendered = render(code);
    return { svg: rendered.svg };
  }
}

function readEngine(): MermaidEngine {
  let engine: MermaidEngine = 'mermaid';
  const chosen = document.currentScript?.dataset.engine;
  if (chosen === 'pele') {
    engine = 'pele';
  }
  return engine;
}

const mermaidWindow = window as unknown as MermaidWindow;
const originalMermaid: DiagramRenderer = {
  render: mermaidWindow.mermaid.render.bind(mermaidWindow.mermaid),
};
const adapter = new MermaidEngineAdapter(
  readEngine(),
  originalMermaid,
  new PeleRenderer(),
);
mermaidWindow.mermaid.render = (id: string, code: string) =>
  adapter.render(id, code);
