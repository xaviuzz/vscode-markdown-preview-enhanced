const EDITOR_BINDINGS: Record<string, string> = {
  '--pele-bg': 'var(--vscode-editor-background)',
  '--pele-fg': 'var(--vscode-editor-foreground)',
  '--pele-muted': 'var(--vscode-descriptionForeground)',
  '--pele-line': 'var(--vscode-editor-foreground)',
  '--pele-surface': 'var(--vscode-editorWidget-background)',
  '--pele-surface-alt': 'var(--vscode-sideBar-background)',
  '--pele-border':
    'var(--vscode-editorWidget-border, var(--vscode-panel-border))',
  '--pele-accent': 'var(--vscode-textLink-foreground)',
  '--pele-font': 'var(--vscode-markdown-font-family, sans-serif)',
  '--pele-font-mono': 'var(--vscode-editor-font-family, monospace)',
  '--pele-series-1': 'var(--vscode-charts-blue)',
  '--pele-series-2': 'var(--vscode-charts-red)',
  '--pele-series-3': 'var(--vscode-charts-yellow)',
  '--pele-series-4': 'var(--vscode-charts-orange)',
  '--pele-series-5': 'var(--vscode-charts-green)',
  '--pele-series-6': 'var(--vscode-charts-purple)',
};

export class PeleTheme {
  public css(): string {
    const declarations: string[] = [];
    for (const [name, value] of Object.entries(EDITOR_BINDINGS)) {
      declarations.push(`  ${name}: ${value};`);
    }
    return `.pele {\n${declarations.join('\n')}\n}`;
  }

  public install(target: Document): void {
    const style = target.createElement('style');
    style.textContent = this.css();
    target.head.appendChild(style);
  }
}
