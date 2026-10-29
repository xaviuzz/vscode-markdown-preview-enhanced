import type { MermaidEngine } from '../config';

export interface DiagramResult {
  svg: string;
}

export interface DiagramRenderer {
  render(id: string, code: string): Promise<DiagramResult> | DiagramResult;
}

interface EngineStrategy {
  render(id: string, code: string): Promise<DiagramResult>;
}

class MermaidStrategy implements EngineStrategy {
  constructor(private readonly mermaid: DiagramRenderer) {}

  public async render(id: string, code: string): Promise<DiagramResult> {
    const drawn = await this.mermaid.render(id, code);
    return drawn;
  }
}

class PeleStrategy implements EngineStrategy {
  constructor(
    private readonly pele: DiagramRenderer,
    private readonly fallback: EngineStrategy,
  ) {}

  public async render(id: string, code: string): Promise<DiagramResult> {
    let drawn: DiagramResult;
    try {
      drawn = await this.pele.render(id, code);
    } catch {
      drawn = await this.fallback.render(id, code);
    }
    return drawn;
  }
}

export class MermaidEngineAdapter {
  private readonly strategy: EngineStrategy;

  constructor(
    engine: MermaidEngine,
    mermaid: DiagramRenderer,
    pele: DiagramRenderer,
  ) {
    const mermaidStrategy = new MermaidStrategy(mermaid);
    const strategies: Record<MermaidEngine, EngineStrategy> = {
      mermaid: mermaidStrategy,
      pele: new PeleStrategy(pele, mermaidStrategy),
    };
    this.strategy = strategies[engine];
  }

  public async render(id: string, code: string): Promise<DiagramResult> {
    const drawn = await this.strategy.render(id, code);
    return drawn;
  }
}
