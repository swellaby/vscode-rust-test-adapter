'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';
import { RustAdapter } from '../../src/rust-adapter';
import { rustAdapterParamStubs, rustAdapterParams } from '../utils';

suite('RustAdapter Tests:', () => {
    let logInfoStub: Sinon.SinonStub;
    let rustAdapter: RustAdapter;

    setup(() => {
        logInfoStub = rustAdapterParamStubs.log.getInfoStub();
        const {
            logStub: log,
            testsEmitterStub: testsEmitter,
            testStatesEmitterStub: testStatesEmitter,
            autoRunEmitterStub: autoRunEmitter,
        } = rustAdapterParams;
        rustAdapter = new RustAdapter('foo', log, testsEmitter, testStatesEmitter, autoRunEmitter);
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

    suite('get tests() ', () => {
        test('Should have correct value', () => {
            assert.deepEqual(rustAdapter.tests, rustAdapterParams.testsEmitterStub.event);
        });
    });

    suite('get testStates() ', () => {
        test('Should have correct value', () => {
            assert.deepEqual(rustAdapter.testStates, rustAdapterParams.testStatesEmitterStub.event);
        });
    });

    suite('get autorun() ', () => {
        test('Should have correct value', () => {
            assert.deepEqual(rustAdapter.autorun, rustAdapterParams.autoRunEmitterStub.event);
        });
    });

    suite('debug()', () => {
        test('Should throw not implemented error', async () => {
            try {
                await rustAdapter.debug([])
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
