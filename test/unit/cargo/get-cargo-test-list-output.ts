'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import * as cargo from '../../../src/cargo';
import { rustAdapterParams } from '../../test-utils';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let logDebugStub: Sinon.SinonStub;
    const { logStub } = rustAdapterParams;
    let runCargoCommandStub: Sinon.SinonStub;
    const workspaceRoot = '/usr/me/test';

    setup(function () {
        runCargoCommandStub = Sinon.stub(cargo, 'runCargoCommand').callsFake(() => Promise.resolve('{}'));
        logDebugStub = this.test.ctx.logDebugStub;
    });

    test('Should handle exception correctly', async () => {
        const error = new Error('Kaboom');
        runCargoCommandStub.callsFake(() => Promise.reject(error));
        try {
            await cargo.getCargoTestListOutput(workspaceRoot, logStub);
            assert.fail('Should have thrown');
        } catch (err) {
            const baseError = 'Unable to retrieve enumeration of tests';
            assert.isTrue(logDebugStub.calledWith(`${baseError}. Details: ${error}`));
            assert.deepEqual(err.message, baseError);
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
}
