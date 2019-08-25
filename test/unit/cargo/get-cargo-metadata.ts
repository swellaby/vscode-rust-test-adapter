'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import * as cargo from '../../../src/cargo';
import { rustAdapterParams } from '../../test-utils';
import {
    singleBinTargetMetadata
} from '../../data/cargo-metadata';

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
}
