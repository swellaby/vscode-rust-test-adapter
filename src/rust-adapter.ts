import {
    TestAdapter,
    // TestEvent,
    TestLoadStartedEvent,
    TestLoadFinishedEvent,
    TestRunStartedEvent,
    TestRunFinishedEvent
    // TestSuiteEvent
} from 'vscode-test-adapter-api';
import { Log } from 'vscode-test-adapter-util';
import { runFakeTests } from './fakeTests';
import { loadUnitTests } from './test-loader';
import { IDisposable } from './interfaces/disposable';

/**
 *
 */
export class RustAdapter implements TestAdapter {
    private disposables: IDisposable[] = [];

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

        const loadedTests = await loadUnitTests(this.workspaceRootDirectoryPath);

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
