import type { MermaidEngine } from './config';

interface ScriptStrategy {
  html(scriptUri: string): string;
}

class MermaidScriptStrategy implements ScriptStrategy {
  public html(_scriptUri: string): string {
    return '';
  }
}

class PeleScriptStrategy implements ScriptStrategy {
  public html(scriptUri: string): string {
    return `<script src="${scriptUri}" data-engine="pele"></script>`;
  }
}

export class MermaidEngineScript {
  private readonly strategy: ScriptStrategy;

  constructor(
    engine: MermaidEngine,
    private readonly scriptUri: string,
  ) {
    const strategies: Record<MermaidEngine, ScriptStrategy> = {
      mermaid: new MermaidScriptStrategy(),
      pele: new PeleScriptStrategy(),
    };
    this.strategy = strategies[engine];
  }

  public html(): string {
    const html = this.strategy.html(this.scriptUri);
    return html;
  }
}
