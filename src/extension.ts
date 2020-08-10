import * as net from 'net';
import { workspace, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, StreamInfo, Position as LSPosition, Location as LSLocation, RevealOutputChannelOn } from 'vscode-languageclient';

let client: LanguageClient;

export async function activate(context: ExtensionContext): Promise<void> {
	const conf = workspace.getConfiguration('pony')
	let client: LanguageClient
	let serverOptions: ServerOptions = () => {
		let socket = net.connect({port: 9192, host: "127.0.0.1"});
		let result: StreamInfo = {
			writer: socket,
			reader: socket
		};
		return Promise.resolve(result)
	}

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: 'pony' }, { scheme: 'untitled', language: 'pony' }],
		revealOutputChannelOn: RevealOutputChannelOn.Info,
		synchronize: {
			configurationSection: 'pony',
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/*.pony')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'PonyLS',
		'Pony Language Server',
		serverOptions,
		clientOptions,
		true
	);

	client.outputChannel.show()
	const disposable = client.start();
    context.subscriptions.push(disposable)
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
