import * as vscode from 'vscode';
import {
    TestEvent,
    testExplorerExtensionId,
    TestHub,
    TestLoadStartedEvent,
    TestLoadFinishedEvent,
    TestRunStartedEvent,
    TestRunFinishedEvent,
    TestSuiteEvent
} from 'vscode-test-adapter-api';
import { Log, TestAdapterRegistrar } from 'vscode-test-adapter-util';
import { RustAdapter } from './rust-adapter';

type TestRunEvent = TestRunStartedEvent | TestRunFinishedEvent | TestSuiteEvent | TestEvent;
type TestLoadEvent = TestLoadStartedEvent | TestLoadFinishedEvent;
type AdapterFactory = (workspaceFolder: vscode.WorkspaceFolder) => RustAdapter; 

const registerAdapter = (
    testExplorerExtension: vscode.Extension<TestHub>,
    context: vscode.ExtensionContext,
    adapterFactory: AdapterFactory) => {
        const testHub = testExplorerExtension.exports;
        context.subscriptions.push(new TestAdapterRegistrar(testHub, adapterFactory));
};

const buildAdapterFactory = (
    config: vscode.WorkspaceConfiguration,
    log: Log
): AdapterFactory => {
    const testsEmitter = new vscode.EventEmitter<TestLoadEvent>();
    const testStatesEmitter = new vscode.EventEmitter<TestRunEvent>();
    const autorunEmitter = new vscode.EventEmitter<void>();
    const rootCargoManifestFilePath: string = config.get("rootCargoManifestFilePath");
    const adapterFactory = workspaceFolder => {
        const filePathUri = vscode.Uri.joinPath(workspaceFolder.uri, rootCargoManifestFilePath);
        return new RustAdapter(
            filePathUri.fsPath,
            log,
            testsEmitter,
            testStatesEmitter,
            autorunEmitter
        );
    };

    return adapterFactory;
}

export async function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration("rustTestExplorer");
    const workspaceFolder = (vscode.workspace.workspaceFolders || [])[0];
    const log = new Log('rustTestExplorer', workspaceFolder, 'Rust Explorer Log');
    context.subscriptions.push(log);

    const testExplorerExtension = vscode.extensions.getExtension<TestHub>(testExplorerExtensionId);
    if (log.enabled) {
        log.info(`Test Explorer ${testExplorerExtension ? '' : 'not '}found`);
    }

    if (testExplorerExtension) {
        const adapterFactory = buildAdapterFactory(config, log);
        
        registerAdapter(testExplorerExtension, context, adapterFactory);
    }
}
