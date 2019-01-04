'use strict';

import {
    TestAdapter,
    TestEvent,
    TestLoadStartedEvent,
    TestLoadFinishedEvent,
    TestRunStartedEvent,
    TestRunFinishedEvent,
    TestSuiteInfo
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
    private testSuites: Map<string, ITestSuiteNode> = new Map<string, ITestSuiteNode>();
    private testCases: Map<string, ITestCaseNode> = new Map<string, ITestCaseNode>();

    get tests() { return this.testsEmitter.event; }
    get testStates() { return this.testStatesEmitter.event; }
    get autorun() { return this.autorunEmitter.event; }

    // tslint:disable:typedef
    constructor(
        public readonly workspaceRootDirectoryPath: string,
        private readonly log: Log,
        private readonly testsEmitter,
        private readonly testStatesEmitter,
        private readonly autorunEmitter
    ) {
        this.log.info('Initializing Rust adapter');

        this.disposables.push(this.testsEmitter);
        this.disposables.push(this.testStatesEmitter);
        this.disposables.push(this.autorunEmitter);
    }
    // tslint:enable:typedef

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
            console.log(`load error: ${err}`);
        }
    }

    // tslint:disable-next-line
    public async run(nodeIds: string[]): Promise<void> {
        this.log.info('Running Rust Tests');
        this.testStatesEmitter.fire(<TestRunStartedEvent>{ type: 'started', tests: nodeIds });
        const nodeId = nodeIds[0];
        if (this.testCases.has(nodeId)) {
            const testCase = this.testCases.get(nodeId);
            const result = await runTestCase(testCase, this.workspaceRootDirectoryPath);
            this.testStatesEmitter.fire(<TestEvent>result);
        } else {
            const testSuite = this.testSuites.get(nodeId);
            const packageSuites: ITestSuiteNode[] = [];
            if (testSuite.id === 'root') {
                testSuite.children.forEach(c => {
                    packageSuites.push(this.testSuites.get(c.id));
                });
            } else {
                packageSuites.push(testSuite);
            }
            await Promise.all(packageSuites.map(async packageSuite => {
                const results = await runTestSuite(packageSuite, this.workspaceRootDirectoryPath);
                results.forEach(result => {
                    this.testStatesEmitter.fire(<TestEvent>result);
                });
            }));
        }
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
        this.testCases = null;
        this.testSuites = null;
    }
}
