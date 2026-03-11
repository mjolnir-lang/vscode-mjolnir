// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

let highlighter: Awaited<ReturnType<typeof import('shiki', { with: { 'resolution-mode': 'import' } })['createHighlighter']>>;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "Mjolnir" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('vscode-mjolnir.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Mjolnir!');
	});

    vscode.window.onDidChangeActiveColorTheme(() => {
        vscode.commands.executeCommand('markdown.preview.refresh');
    });

	context.subscriptions.push(disposable);

    const syntaxes = path.join(context.extensionPath, 'syntaxes');
    highlighter = await (await import('shiki')).createHighlighter({
        themes: ['gruvbox-dark-soft', 'gruvbox-light-soft'],
        langs: [
            require(path.join(syntaxes, 'mj.tmLanguage.json')),
            require(path.join(syntaxes, 'mj-regex.tmLanguage.json')),
            require(path.join(syntaxes, 'mj-shell.tmLanguage.json')),
            require(path.join(syntaxes, 'mj-asm.tmLanguage.json')),
            require(path.join(syntaxes, 'mj-asm-arm32.tmLanguage.json')),
            require(path.join(syntaxes, 'mj-asm-arm64.tmLanguage.json')),
            require(path.join(syntaxes, 'mj-asm-msp430.tmLanguage.json')),
            require(path.join(syntaxes, 'mj-asm-x86.tmLanguage.json')),
            require(path.join(syntaxes, 'mj-asm-x86_64.tmLanguage.json')),
            require(path.join(syntaxes, 'mj-asm-z80.tmLanguage.json')),
        ]
    });

    return {
        extendMarkdownIt(md: any) {
            const original = md.renderer.rules.fence;

            md.renderer.rules.fence = (tokens: any[], idx: number, options: any, env: any, self: any) => {
                const token = tokens[idx];

                if (token.info.trim() === 'mj' && highlighter) {
                    return highlighter.codeToHtml(token.content, {
                        lang: 'Mjolnir',
                        theme: vscode.window.activeColorTheme.kind !== vscode.ColorThemeKind.Light ? 'gruvbox-dark-soft' : 'gruvbox-light-soft'
                    });
                }

                return original(tokens, idx, options, env, self);
            };

            return md;
        }
    };
}

// This method is called when your extension is deactivated
export function deactivate() {}
