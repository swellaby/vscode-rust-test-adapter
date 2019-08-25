'use strict';

import { assert } from 'chai';

import * as childProcess from 'child_process';
import * as Sinon from 'sinon';

import { runCargoCommand } from '../../../src/cargo';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    const subCommand = 'foo';
    const args = '--message-format json';
    const maxBuffer = 100 * 1024;
    let childProcessExecStub: Sinon.SinonStub;
    const workspaceRoot = '/usr/me/test';

    setup(() => {
        childProcessExecStub = Sinon.stub(childProcess, 'exec');
    });

    test('Should use correct command and exec options', async () => {
        const expCommand = `cargo ${subCommand} ${args}`;
        childProcessExecStub.yields(null, null);
        await runCargoCommand(subCommand, args, workspaceRoot, maxBuffer);
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
            await runCargoCommand(null, null, null, null);
            assert.fail('Should have thrown');
        } catch (err) {
            assert.deepEqual(err.message, errorMessage);
        }
    });

    test('Should fail when exec yields error with default stderr setting', async () => {
        const errorMessage = 'Crashed';
        childProcessExecStub.yields(new Error(errorMessage));
        try {
            await runCargoCommand(null, null, null, null);
            assert.fail('Should have thrown');
        } catch (err) {
            assert.deepEqual(err.message, errorMessage);
        }
    });

    test('Should fail when exec yields error with allowStderr enabled and falsy stderr', async () => {
        const errorMessage = 'Unknown';
        childProcessExecStub.yields(new Error(errorMessage));
        try {
            await runCargoCommand(null, null, null, null, true);
            assert.fail('Should have thrown');
        } catch (err) {
            assert.deepEqual(err.message, errorMessage);
        }
    });

    test('Should fail when exec yields error with allowStderr disabled and truthy stderr', async () => {
        const errorMessage = 'stderr not allowed';
        childProcessExecStub.yields(new Error(errorMessage), 'foo', 'bar');
        try {
            await runCargoCommand(null, null, null, null, false);
            assert.fail('Should have thrown');
        } catch (err) {
            assert.deepEqual(err.message, errorMessage);
        }
    });

    test('Should return stdout when exec yields error with allowStderr enabled and truthy stderr', async () => {
        const expStdout = 'abc';
        childProcessExecStub.yields(new Error(), expStdout, 'bar');
        const stdout = await runCargoCommand(null, null, null, null, true);
        assert.deepEqual(stdout, expStdout);
    });

    test('Should resolve with stdout on command success', async () => {
        const expStdout = 'all tests passed yay';
        childProcessExecStub.yields(null, expStdout, null);
        const stdout = await runCargoCommand(subCommand, args, workspaceRoot, maxBuffer);
        assert.deepEqual(stdout, expStdout);
    });
}
