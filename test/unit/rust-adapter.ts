'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';
import {
    TestLoadStartedEvent,
    TestLoadFinishedEvent,
    TestRunStartedEvent,
    TestRunFinishedEvent
} from 'vscode-test-adapter-api';

import { RustAdapter } from '../../src/rust-adapter';
import * as testLoader from '../../src/test-loader';
import {
    rustAdapterParamStubs,
    rustAdapterParams,
    treeNodes
} from '../test-utils';

suite('RustAdapter Tests:', () => {
    let logInfoStub: Sinon.SinonStub;
    let logErrorStub: Sinon.SinonStub;
    let testsEmitterFireStub: Sinon.SinonStub;
    let loadUnitTestsStub: Sinon.SinonStub;
    let rustAdapter: RustAdapter;
    const workspaceRootDirectoryPath = '/usr/me/rusty-hook';
    const {
        loadedTestsResultStub,
        testCases,
        testCasesMapStub,
        testSuites,
        testSuitesMapStub
    } = treeNodes

    setup(() => {
        logInfoStub = rustAdapterParamStubs.log.getInfoStub();
        logErrorStub = rustAdapterParamStubs.log.getErrorStub();
        testsEmitterFireStub = Sinon.stub(rustAdapterParams.testsEmitterStub, 'fire');
        const {
            logStub: log,
            testsEmitterStub: testsEmitter,
            testStatesEmitterStub: testStatesEmitter,
            autoRunEmitterStub: autoRunEmitter
        } = rustAdapterParams;
        loadUnitTestsStub = Sinon.stub(testLoader, 'loadUnitTests').withArgs(workspaceRootDirectoryPath, log);
        rustAdapter = new RustAdapter(workspaceRootDirectoryPath, log, testsEmitter, testStatesEmitter, autoRunEmitter);
    });

    teardown(() => {
        Sinon.restore();
        rustAdapter = null;
    });

    suite('constructor()', () => {
        test('Should display correct initialization method', async () => {
            assert.isTrue(logInfoStub.firstCall.calledWithExactly('Initializing Rust adapter'));
        });
    });

    suite('load()', () => {
        test('Should gracefully handle exception thrown on load', async () => {
            const err = new Error('crashed');
            loadUnitTestsStub.throws(() => err);
            await rustAdapter.load();
            assert.isTrue(logInfoStub.calledWithExactly('Loading Rust Tests'));
            assert.isTrue(testsEmitterFireStub.calledWithExactly(<TestLoadStartedEvent>{ type: 'started' }));
            assert.isTrue(logErrorStub.calledWithExactly(`Error loading tests: ${err}`));
            assert.isTrue(testsEmitterFireStub.calledWithExactly(<TestLoadFinishedEvent>{ type: 'finished' }));
        });

        test('Should correctly handle no tests found scenario', async () => {
            loadUnitTestsStub.callsFake(() => undefined);
            await rustAdapter.load();
            assert.isTrue(logInfoStub.calledWithExactly('No unit tests found'));
            assert.isTrue(testsEmitterFireStub.calledWithExactly(<TestLoadFinishedEvent>{ type: 'finished' }));
        });

        test('Should correctly handle tests loaded scenario', async () => {
            loadUnitTestsStub.callsFake(() => loadedTestsResultStub);
            await rustAdapter.load();
            assert.isTrue(testsEmitterFireStub.calledWithExactly(<TestLoadFinishedEvent>{
                type: 'finished',
                suite: loadedTestsResultStub.rootTestSuite
            }));
        });
    });

    suite('get tests()', () => {
        test('Should have correct value', () => {
            assert.deepEqual(rustAdapter.tests, rustAdapterParams.testsEmitterStub.event);
        });
    });

    suite('get testStates()', () => {
        test('Should have correct value', () => {
            assert.deepEqual(rustAdapter.testStates, rustAdapterParams.testStatesEmitterStub.event);
        });
    });

    suite('get autorun()', () => {
        test('Should have correct value', () => {
            assert.deepEqual(rustAdapter.autorun, rustAdapterParams.autoRunEmitterStub.event);
        });
    });

    suite('debug()', () => {
        test('Should throw not implemented error', async () => {
            try {
                await rustAdapter.debug([]);
                assert.fail('Should have thrown');
            } catch (err) {
                assert.deepEqual(err.message, 'Method not implemented.');
            }
        });
    });

    suite('cancel()', () => {
        test('Should throw not implemented error', () => {
            assert.throws(rustAdapter.cancel, 'Method not implemented.');
        });
    });

    suite('dispose()', () => {
        let rustAdapterCancelStub: Sinon.SinonStub;
        let testsEmitterDisposeStub: Sinon.SinonStub;
        let testStatesEmitterDisposeStub: Sinon.SinonStub;
        let autoRunEmitterDisposeStub: Sinon.SinonStub;

        setup(() => {
            testsEmitterDisposeStub = rustAdapterParamStubs.testsEmitterStubs.getDisposeStub();
            testStatesEmitterDisposeStub = rustAdapterParamStubs.testsStatesEmitterStubs.getDisposeStub();
            autoRunEmitterDisposeStub = rustAdapterParamStubs.autoRunEmitterStubs.getDisposeStub();
            rustAdapterCancelStub = Sinon.stub(rustAdapter, 'cancel');
        });

        test('Should properly dispose all contents', () => {
            rustAdapter.dispose();
            assert.isTrue(rustAdapterCancelStub.called);
            assert.isTrue(testsEmitterDisposeStub.called);
            assert.isTrue(testStatesEmitterDisposeStub.called);
            assert.isTrue(autoRunEmitterDisposeStub.called);
        });
    });
});
