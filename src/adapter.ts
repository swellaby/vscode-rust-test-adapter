import * as vscode from 'vscode';
import {
    TestAdapter,
    TestEvent,
    TestInfo,
    TestLoadStartedEvent,
    TestLoadFinishedEvent,
    TestRunStartedEvent,
    TestRunFinishedEvent,
    TestSuiteEvent,
    TestSuiteInfo
} from 'vscode-test-adapter-api';
import { Log } from 'vscode-test-adapter-util';
import { runFakeTests } from './fakeTests';
import * as childProcess from 'child_process';

/**
 *
 */
export class RustAdapter implements TestAdapter {

    private disposables: { dispose(): void }[] = [];

    // tslint:disable:typedef
    private readonly testsEmitter = new vscode.EventEmitter<TestLoadStartedEvent | TestLoadFinishedEvent>();
    private readonly testStatesEmitter = new vscode.EventEmitter<TestRunStartedEvent | TestRunFinishedEvent | TestSuiteEvent | TestEvent>();
    private readonly autorunEmitter = new vscode.EventEmitter<void>();
    // tslint:enable:typedef

    get tests(): vscode.Event<TestLoadStartedEvent | TestLoadFinishedEvent> { return this.testsEmitter.event; }
    get testStates(): vscode.Event<TestRunStartedEvent | TestRunFinishedEvent | TestSuiteEvent | TestEvent> { return this.testStatesEmitter.event; }
    get autorun(): vscode.Event<void> | undefined { return this.autorunEmitter.event; }

    constructor(
        public readonly workspace: vscode.WorkspaceFolder,
        private readonly log: Log
    ) {

        this.log.info('Initializing example adapter');

        this.disposables.push(this.testsEmitter);
        this.disposables.push(this.testStatesEmitter);
        this.disposables.push(this.autorunEmitter);

    }

    public async loadPackageTests(packageDirectoryPath: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            childProcess.exec('cargo test -- --list', { cwd: packageDirectoryPath }, (err, stdout) => {
                if (err) {
                    console.log(`error loading tests!`);
                    return reject();
                }
                resolve(stdout);
            });
        });
    }

    public async getPackages(cargoManifestRootDirectory: string): Promise<{ manifest_path: string, name: string }[]> {
        return new Promise<{ manifest_path: string, name: string }[]>((resolve, reject) => {
            childProcess.exec('cargo metadata --format-version 1', { cwd: cargoManifestRootDirectory }, (err, stdout) => {
                if (err) {
                    console.log(`error getting metadata`);
                    console.log(`err: ${err}`);
                    return reject();
                }
                const cargoMetadata = JSON.parse(stdout);
                resolve(cargoMetadata.packages);
            });
        });
    }

    public parseOutput(packageName: string, output: string): TestSuiteInfo[] {
        const testsOutput = output.split('\n\n')[0];
        const testLines = testsOutput.split('\n');
        const testModulesMap: Map<string, TestSuiteInfo> = new Map<string, TestSuiteInfo>();
        testLines.forEach(testLine => {
            const line = testLine.split(': test')[0].split('::');
            const testModule = line[0];
            const testName = line[1];
            let moduleTestSuite = testModulesMap.get(testModule);
            if (!moduleTestSuite) {
                moduleTestSuite = {
                    id: `${packageName}:${testModule}`,
                    label: testModule,
                    type: 'suite',
                    children: []
                };
                testModulesMap.set(testModule, moduleTestSuite);
            }
            const test: TestInfo = {
                id: `${packageName}:${line}`,
                label: testName,
                type: 'test'
            };
            moduleTestSuite.children.push(test);
        });
        return Array.from(testModulesMap.values());
    }

    public buildRootTestSuiteInfoNode(packageTestNodes: TestSuiteInfo[]): TestSuiteInfo {
        const testSuite: TestSuiteInfo = {
            id: 'root',
            type: 'suite',
            label: 'rust',
            children: []
        };
        testSuite.children = packageTestNodes.length === 1
            ? packageTestNodes[0].children
            : packageTestNodes;

        return testSuite;
    }

    public async loadReal(): Promise<TestSuiteInfo> {
        try {
            const workspaceRoot = this.workspace.uri.fsPath;
            const packages = await this.getPackages(workspaceRoot);
            const packageTests = await Promise.all(packages.map(async p => {
                const packageDirectory = p.manifest_path.replace('Cargo.toml', '');
                const output = await this.loadPackageTests(packageDirectory);
                if (output.indexOf('0 tests,') === 0) {
                    return;
                }
                return <TestSuiteInfo>{
                    id: p.name,
                    type: 'suite',
                    label: p.name,
                    children: this.parseOutput(p.name, output)
                };
            }));
            // This condition will evaluate to true when there are no unit tests.
            if (packageTests.length >= 1 && !packageTests[0]) {
                return Promise.resolve(null);
            }
            return Promise.resolve(this.buildRootTestSuiteInfoNode(packageTests));
        } catch (err) {
            return Promise.reject(err);
        }
    }

    public async load(): Promise<void> {
        this.log.info('Loading example tests');
        this.testsEmitter.fire(<TestLoadStartedEvent>{ type: 'started' });

        const loadedTests = await this.loadReal();

        if (!loadedTests) {
            this.log.info('No unit tests found');
            this.testsEmitter.fire(<TestLoadFinishedEvent>{ type: 'finished' });
        } else {
            this.testsEmitter.fire(<TestLoadFinishedEvent>{ type: 'finished', suite: loadedTests });
        }
    }

    public async run(tests: string[]): Promise<void> {
        this.log.info(`Running example tests ${JSON.stringify(tests)}`);
        this.testStatesEmitter.fire(<TestRunStartedEvent>{ type: 'started', tests });
        // in a "real" TestAdapter this would start a test run in a child process
        await runFakeTests(tests, this.testStatesEmitter);
        this.testStatesEmitter.fire(<TestRunFinishedEvent>{ type: 'finished' });
    }

    // eslint-disable-next-line no-unused-vars
    public async debug(tests: string[]): Promise<void> {
        // in a "real" TestAdapter this would start a test run in a child process and attach the debugger to it
        this.log.warn('debug() not implemented yet');
        throw new Error('Method not implemented.');
    }

    public cancel(): void {
        // in a "real" TestAdapter this would kill the child process for the current test run (if there is any)
        throw new Error('Method not implemented.');
    }

    public dispose(): void {
        this.cancel();
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.disposables = [];
    }
}
