'use strict';

import { assert } from 'chai';
import * as childProcess from 'child_process';
import * as Sinon from 'sinon';

import * as cargo from '../../src/cargo';
import {
    rustAdapterParams,
    rustAdapterParamStubs
} from '../test-utils';
import {
    singleBinTargetMetadata
} from '../data/cargo-metadata';

suite('cargo Tests:', () => {
    let runCargoCommandStub: Sinon.SinonStub;
    let childProcessExecStub: Sinon.SinonStub;
    let logDebugStub: Sinon.SinonStub;
    const { logStub } = rustAdapterParams;
    const workspaceRoot = '/usr/me/test';

    setup(() => {
        logDebugStub = rustAdapterParamStubs.log.getDebugStub();
    });

    teardown(() => {
        Sinon.restore();
    });

    suite('runCargoCommand()', () => {
        const subCommand = 'foo';
        const args = '--message-format json';
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

    suite('getCargoMetadata()', () => {
        setup(() => {
            runCargoCommandStub = Sinon.stub(cargo, 'runCargoCommand').callsFake(() => Promise.resolve('{}'));
        });

        test('Should handle exception correctly', async () => {
            const error = new Error('Invalid Cargo.toml');
            runCargoCommandStub.callsFake(() => Promise.reject(error));
            try {
                await cargo.getCargoMetadata(workspaceRoot, logStub);
                assert.fail('Should have thrown');
            } catch (err) {
                assert.isTrue(logDebugStub.calledWith(error));
                assert.deepEqual(err.message, 'Unable to parse cargo metadata output');
            }
        });

        test('Should use correct subcommand, args, and workspace', async () => {
            await cargo.getCargoMetadata(workspaceRoot, logStub);
            const expCargoSubCommand = 'metadata';
            const expCargoArgs = '--no-deps --format-version 1';
            const args = runCargoCommandStub.firstCall.args;
            assert.deepEqual(args[0], expCargoSubCommand);
            assert.deepEqual(args[1], expCargoArgs);
            assert.deepEqual(args[2], workspaceRoot);
        });

        test('Should use correct default max buffer size', async () => {
            const expMaxBufferSize = 300 * 1024;
            await cargo.getCargoMetadata(workspaceRoot, logStub);
            const actMaxBufferSize = runCargoCommandStub.firstCall.args[3];
            assert.deepEqual(actMaxBufferSize, expMaxBufferSize);
        });

        test('Should use specified max buffer size', async () => {
            const expMaxBufferSize = 100 * 1024;
            await cargo.getCargoMetadata(workspaceRoot, logStub, expMaxBufferSize);
            const actMaxBufferSize = runCargoCommandStub.firstCall.args[3];
            assert.deepEqual(actMaxBufferSize, expMaxBufferSize);
        });

        test('Should return CargoMetadata object', async () => {
            runCargoCommandStub.callsFake(() => Promise.resolve(JSON.stringify(singleBinTargetMetadata)));
            const cargoMetadata = await cargo.getCargoMetadata(workspaceRoot, logStub);
            assert.deepEqual(cargoMetadata, singleBinTargetMetadata);
        });
    });

    suite('getCargoTestListOutput()', () => {
        setup(() => {
            runCargoCommandStub = Sinon.stub(cargo, 'runCargoCommand').callsFake(() => Promise.resolve('{}'));
        });

        test('Should handle exception correctly', async () => {
            const error = new Error('Kaboom');
            runCargoCommandStub.callsFake(() => Promise.reject(error));
            try {
                await cargo.getCargoTestListOutput(workspaceRoot, logStub);
                assert.fail('Should have thrown');
            } catch (err) {
                assert.isTrue(logDebugStub.calledWith(error));
                assert.deepEqual(err.message, 'Unable to retrieve enumeration of tests');
            }
        });

        test('Should use correct subcommand, default args, and workspace', async () => {
            await cargo.getCargoTestListOutput(workspaceRoot, logStub);
            const expCargoSubCommand = 'test';
            const expCargoArgs = ' -- --list';
            const args = runCargoCommandStub.firstCall.args;
            assert.deepEqual(args[0], expCargoSubCommand);
            assert.deepEqual(args[1], expCargoArgs);
            assert.deepEqual(args[2], workspaceRoot);
        });

        test('Should use correct default max buffer size', async () => {
            const expMaxBufferSize = 400 * 1024;
            await cargo.getCargoTestListOutput(workspaceRoot, logStub);
            const actMaxBufferSize = runCargoCommandStub.firstCall.args[3];
            assert.deepEqual(actMaxBufferSize, expMaxBufferSize);
        });

        test('Should use specified max buffer size', async () => {
            const expMaxBufferSize = 100 * 1024;
            await cargo.getCargoTestListOutput(workspaceRoot, logStub, '', expMaxBufferSize);
            const actMaxBufferSize = runCargoCommandStub.firstCall.args[3];
            assert.deepEqual(actMaxBufferSize, expMaxBufferSize);
        });

        test('Should use specified args', async () => {
            const args = '--lib';
            await cargo.getCargoTestListOutput(workspaceRoot, logStub, args);
            const actArgs = runCargoCommandStub.firstCall.args[1];
            assert.deepEqual(actArgs, `${args} -- --list`);
        });
    });
});
