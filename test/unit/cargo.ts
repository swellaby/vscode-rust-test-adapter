'use strict';

import { assert } from 'chai';
import * as childProcess from 'child_process';
import * as Sinon from 'sinon';

import * as cargo from '../../src/cargo';
// import {
//     rustAdapterParams,
//     rustAdapterParamStubs
// } from '../test-utils';
// import {
//     singleBinTargetMetadata
// } from '../data/cargo-metadata';

suite('cargo Tests:', () => {
    let childProcessExecStub: Sinon.SinonStub;
    // let logDebugStub: Sinon.SinonStub;
    // let jsonParseStub: Sinon.SinonStub;
    // const { logStub } = rustAdapterParams;

    teardown(() => {
        Sinon.restore();
    });

    suite('runCargoCommand()', () => {
        const subCommand = 'foo';
        const args = '--message-format json';
        const workspaceRoot = '/usr/me/test';
        const maxBuffer = 100 * 1024;

        setup(() => {
            childProcessExecStub = Sinon.stub(childProcess, 'exec');
        });

        test('Should use correct command and exec options', async () => {
            const expCommand = `cargo ${subCommand} ${args}`;
            childProcessExecStub.yields(null, null);
            await cargo.runCargoCommand(subCommand, args, workspaceRoot, maxBuffer);
            const stubArgs = childProcessExecStub.firstCall.args;
            assert.deepEqual(stubArgs[0], expCommand);
            assert.deepEqual(stubArgs[1], {
                cwd: workspaceRoot,
                maxBuffer
            });
        });

        test('Should fail with correct error message when exception is command execution', async () => {
            const errorMessage = 'No Cargo.toml file found';
            childProcessExecStub.throws(new Error(errorMessage));
            try {
                await cargo.runCargoCommand(null, null, null, null);
                assert.fail('Should have thrown');
            } catch (err) {
                assert.deepEqual(err.message, errorMessage);
            }
        });

        test('Should fail when exec yields error with default stderr setting', async () => {
            const errorMessage = 'Crashed';
            childProcessExecStub.yields(new Error(errorMessage));
            try {
                await cargo.runCargoCommand(null, null, null, null);
                assert.fail('Should have thrown');
            } catch (err) {
                assert.deepEqual(err.message, errorMessage);
            }
        });

        test('Should fail when exec yields error with allowStderr enabled and falsy stderr', async () => {
            const errorMessage = 'Unknown';
            childProcessExecStub.yields(new Error(errorMessage));
            try {
                await cargo.runCargoCommand(null, null, null, null, true);
                assert.fail('Should have thrown');
            } catch (err) {
                assert.deepEqual(err.message, errorMessage);
            }
        });

        test('Should fail when exec yields error with allowStderr disabled and truthy stderr', async () => {
            const errorMessage = 'stderr not allowed';
            childProcessExecStub.yields(new Error(errorMessage), 'foo', 'bar');
            try {
                await cargo.runCargoCommand(null, null, null, null, false);
                assert.fail('Should have thrown');
            } catch (err) {
                assert.deepEqual(err.message, errorMessage);
            }
        });

        test('Should return stdout when exec yields error with allowStderr enabled and truthy stderr', async () => {
            const expStdout = 'abc';
            childProcessExecStub.yields(new Error(), expStdout, 'bar');
            const stdout = await cargo.runCargoCommand(null, null, null, null, true);
            assert.deepEqual(stdout, expStdout);
        });

        test('Should resolve with stdout on command success', async () => {
            const expStdout = 'all tests passed yay';
            childProcessExecStub.yields(null, expStdout, null);
            const stdout = await cargo.runCargoCommand(subCommand, args, workspaceRoot, maxBuffer);
            assert.deepEqual(stdout, expStdout);
        });
    });
});
