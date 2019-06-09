'use strict';

import {
    TestAdapter,
    TestEvent,
    TestLoadStartedEvent,
    TestLoadFinishedEvent,
    TestRunStartedEvent,
    TestRunFinishedEvent
} from 'vscode-test-adapter-api';
import { Log } from 'vscode-test-adapter-util';
import { loadUnitTests } from './test-loader';
import { IDisposable } from './interfaces/disposable';
import { runTestCase, runTestSuite } from './test-runner';
import { ITestSuiteNode } from './interfaces/test-suite-node';
import { ITestCaseNode } from './interfaces/test-case-node';

/**
 * Implementation of the TestAdapter interface for Rust Tests.
 */
export class RustAdapter implements TestAdapter {
    private disposables: IDisposable[] = [];
    private testSuites: Map<string, ITestSuiteNode>;
    private testCases: Map<string, ITestCaseNode>;

    // tslint:disable:typedef
    constructor(
        public readonly workspaceRootDirectoryPath: string,
        private readonly log: Log,
        private readonly testsEmitter,
        private readonly testStatesEmitter,
        private readonly autorunEmitter
    ) {
        this.log.info('Initializing Rust adapter');
        this.testSuites = new Map<string, ITestSuiteNode>();
        this.testCases = new Map<string, ITestCaseNode>();
        this.disposables.push(this.testsEmitter);
        this.disposables.push(this.testStatesEmitter);
        this.disposables.push(this.autorunEmitter);
    }
    // tslint:enable:typedef

    public get tests() { return this.testsEmitter.event; }
    public get testStates() { return this.testStatesEmitter.event; }
    public get autorun() { return this.autorunEmitter.event; }

    public async load(): Promise<void> {
        this.log.info('Loading Rust Tests');
        this.testsEmitter.fire(<TestLoadStartedEvent>{ type: 'started' });

        try {
            const loadedTests = await loadUnitTests(this.workspaceRootDirectoryPath, this.log);

            if (!loadedTests) {
                this.log.info('No unit tests found');
                this.testsEmitter.fire(<TestLoadFinishedEvent>{ type: 'finished' });
            } else {
                this.testCases = loadedTests.testCasesMap;
                this.testSuites = loadedTests.testSuitesMap;
                this.testsEmitter.fire(<TestLoadFinishedEvent>{ type: 'finished', suite: loadedTests.rootTestSuite });
            }
        } catch (err) {
            this.log.error(`Error loading tests: ${err}`);
            this.testsEmitter.fire(<TestLoadFinishedEvent>{ type: 'finished' });
        }
    }

    private extractPackageTestSuitesFromNodes(nodeId: string, packageSuites: ITestSuiteNode[]) {
        const node = this.testSuites.get(nodeId);
        console.log(`nodeId: ${nodeId}`)
        if (node && node.isStructuralNode) {
            node.childrenNodeIds.forEach(id => {
                return this.extractPackageTestSuitesFromNodes(id, packageSuites);
            });
        } else {
            return packageSuites.push(node);
        }
    }

    private async runTestSuite(nodeId: string): Promise<void> {
        const packageSuites: ITestSuiteNode[] = [];
        this.extractPackageTestSuitesFromNodes(nodeId, packageSuites);
        await Promise.all(packageSuites.map(async packageSuite => {
            const results = await runTestSuite(packageSuite, this.workspaceRootDirectoryPath);
            results.forEach(result => this.testStatesEmitter.fire(<TestEvent>result));
        }));
    }

    public async run(nodeIds: string[]): Promise<void> {
        this.log.info('Running Rust Tests');
        this.testStatesEmitter.fire(<TestRunStartedEvent>{ type: 'started', tests: nodeIds });

        try {
            if (nodeIds.length === 1 && nodeIds[0] === 'root') {
                nodeIds = this.testSuites.get('root').childrenNodeIds;
            }
            await Promise.all(nodeIds.map(async nodeId => {
                if (this.testCases.has(nodeId)) {
                    const testCase = this.testCases.get(nodeId);
                    const result = await runTestCase(testCase, this.workspaceRootDirectoryPath);
                    this.testStatesEmitter.fire(<TestEvent>result);
                } else {
                    await this.runTestSuite(nodeId);
                }
            }));
        } catch (err) {
            console.log('******************************');
            console.log('******************************');
            console.log('******************************');
            console.log('******************************');
            console.log('******************************');
            this.log.error(`Run error: ${err}`);
        }

        this.testStatesEmitter.fire(<TestRunFinishedEvent>{ type: 'finished' });
    }

    public async debug(_tests: string[]): Promise<void> {
        // TODO: start a test run in a child process and attach the debugger to it
        throw new Error('Method not implemented.');
    }

    public cancel(): void {
        // TODO: kill the child process for the current test run (if there is any)
        throw new Error('Method not implemented.');
    }

    public dispose(): void {
        this.cancel();
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.disposables = [];
        this.testCases.clear();
        this.testSuites.clear();
    }
}
