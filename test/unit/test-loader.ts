'use strict';

import { assert } from 'chai';
import * as childProcess from 'child_process';
import * as Sinon from 'sinon';

import * as testLoader from '../../src/test-loader';
import {
    rustAdapterParams,
    rustAdapterParamStubs
} from '../test-utils';

suite('test-loader Tests:', () => {
    let childProcessExecStub: Sinon.SinonStub;
    let logDebugStub: Sinon.SinonStub;
    let jsonParseStub: Sinon.SinonStub;
    const { logStub } = rustAdapterParams;

    setup(() => {
        childProcessExecStub = Sinon.stub(childProcess, 'exec');
        logDebugStub = rustAdapterParamStubs.log.getDebugStub();
        jsonParseStub = Sinon.stub(JSON, 'parse');
    });

    teardown(() => {
        Sinon.restore();
    });

    suite('getCargoMetadata()', () => {
        test('Should use correct command and args', async () => {
            childProcessExecStub.throws(new Error());
            const workspaceRoot = '/usr/me/test';
            try {
                await testLoader.loadUnitTests(workspaceRoot, null);
                assert.fail('Should have thrown');
            } catch (_err) {
                const args = childProcessExecStub.firstCall.args;
                assert.deepEqual(args[0], 'cargo metadata --no-deps --format-version 1');
                assert.deepEqual(args[1], {
                    cwd: workspaceRoot,
                    maxBuffer: 300 * 1024
                });
            }
        });

        test('Should fail with correct error message when exception is thrown on metadata retrieval', async () => {
            const errorMessage = 'boom!';
            childProcessExecStub.throws(new Error(errorMessage));
            try {
                await testLoader.loadUnitTests(null, null);
                assert.fail('Should have thrown');
            } catch (err) {
                assert.deepEqual(err.message, errorMessage);
            }
        });

        test('Should fail with correct error message when cargo metadata command yields error', async () => {
            const errorMessage = 'No Cargo.toml file found';
            childProcessExecStub.yields(new Error(errorMessage));
            try {
                await testLoader.loadUnitTests(null, null);
                assert.fail('Should have thrown');
            } catch (err) {
                assert.deepEqual(err.message, errorMessage);
            }
        });

        test('Should fail with correct error message when cargo metadata command yields invalid json', async () => {
            childProcessExecStub.yields(null, '{}:"}');
            const parseError = new Error('SyntaxError: Unexpected token : in JSON at position 2');
            jsonParseStub.throws(parseError);
            try {
                await testLoader.loadUnitTests(null, logStub);
                assert.fail('Should have thrown');
            } catch (err) {
                assert.isTrue(logDebugStub.calledWithExactly(parseError));
                assert.deepEqual(err.message, 'Unable to parse cargo metadata output');
            }
        });
    });
});
