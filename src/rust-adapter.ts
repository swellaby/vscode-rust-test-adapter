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
import { runTestCase } from './test-runner';

/**
 *
 */
export class RustAdapter implements TestAdapter {
    private disposables: IDisposable[] = [];
    private loadedTestSuites: Map<string, TestSuiteInfo> = new Map<string, TestSuiteInfo>();

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
                this.loadedTestSuites = loadedTests.testSuitesMap;
                this.testsEmitter.fire(<TestLoadFinishedEvent>{ type: 'finished', suite: loadedTests.rootNode });
            }
        } catch (err) {
            console.log(`load error: ${err}`);
        }
    }

    private extractTestCaseIdsFromNodes(searchNodeIds: string[], testNodeIds: string[]) {
        searchNodeIds.forEach(nodeId => {
            if (this.loadedTestSuites.has(nodeId)) {
                const testSuite = this.loadedTestSuites.get(nodeId);
                const childrenIds = testSuite.children.map(c => c.id);
                return this.extractTestCaseIdsFromNodes(childrenIds, testNodeIds);
            } else {
                return testNodeIds.push(nodeId);
            }
        });
    }

    public async run(nodeIds: string[]): Promise<void> {
        this.log.info('Running Rust Tests');
        this.testStatesEmitter.fire(<TestRunStartedEvent>{ type: 'started', tests: nodeIds });
        const testCaseIds: string[] = [];
        this.extractTestCaseIdsFromNodes(nodeIds, testCaseIds);
        await Promise.all(testCaseIds.map(async id => {
            const result = await runTestCase(id, this.workspaceRootDirectoryPath);
            this.testStatesEmitter.fire(<TestEvent>result);
        }));
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
