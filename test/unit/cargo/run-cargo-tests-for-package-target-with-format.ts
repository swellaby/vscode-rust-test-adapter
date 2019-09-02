'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import * as cargo from '../../../src/cargo';
import { rustAdapterParams, cargoPackages } from '../../test-utils';
import { TargetType } from '../../../src/enums/target-type';
import { INodeTarget } from '../../../src/interfaces/node-target';
import { ICargoTestExecutionParameters } from '../../../src/interfaces/cargo-test-execution-parameters';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let logDebugStub: Sinon.SinonStub;
    const { logStub } = rustAdapterParams;
    const { runCargoTestsForPackageTargetWithFormat } = cargo;
    const { swansonLibPackage: { name: packageName } } = cargoPackages;
    const targetName = 'ronald';
    const nodeTarget = <INodeTarget>{ targetName, targetType: TargetType.bin };
    let runCargoCommandStub: Sinon.SinonStub;
    let getCargoPackageTargetFilterStub: Sinon.SinonStub;
    const format = 'pretty';
    const workspaceRoot = '/usr/me/test';
    const packageTargetFilter = '--bin swanson';
    const spec = 'rusty_hook::rusty_hook:unit_tests';
    const baseLineCargoSubCommandArgs = `${packageTargetFilter} -- --format ${format}`;
    const defaultParams = <ICargoTestExecutionParameters> {
        packageName,
        nodeTarget,
        targetWorkspace: workspaceRoot,
        log: logStub
    }

    setup(function () {
        runCargoCommandStub = Sinon.stub(cargo, 'runCargoCommand');
        getCargoPackageTargetFilterStub = Sinon.stub(cargo, 'getCargoPackageTargetFilter').callsFake(() => packageTargetFilter);
        logDebugStub = this.test.ctx.logDebugStub;
    });

    test('Should handle exception correctly', async () => {
        const error = new Error('Oh nose!');
        runCargoCommandStub.callsFake(() => Promise.reject(error));
        try {
            await runCargoTestsForPackageTargetWithFormat(defaultParams, format);
            assert.fail('Should have thrown');
        } catch (err) {
            const baseErrorMessage = 'Fatal error while attempting to run tests';
            assert.isTrue(logDebugStub.calledWith(`${baseErrorMessage}. Details: ${error}`));
            assert.deepEqual(err.message, baseErrorMessage);
        }
    });

    test('Should return raw cargo test output', async () => {
        const expectedOutput = 'super awesome test execution results!';
        runCargoCommandStub.callsFake(() => Promise.resolve(expectedOutput));
        const output = await runCargoTestsForPackageTargetWithFormat(defaultParams, format);
        assert.isTrue(getCargoPackageTargetFilterStub.calledWithExactly(defaultParams.packageName, defaultParams.nodeTarget));
        assert.deepEqual(output, expectedOutput);
    });

    test('Should use correct subcommand, default args, workspace, and stderr config', async () => {
        await runCargoTestsForPackageTargetWithFormat(defaultParams, format);
        const expCargoSubCommand = 'test';
        const args = runCargoCommandStub.firstCall.args;
        assert.deepEqual(args[0], expCargoSubCommand);
        assert.deepEqual(args[1], baseLineCargoSubCommandArgs);
        assert.deepEqual(args[2], workspaceRoot);
        assert.isTrue(args[4]);
    });

    test('Should use correct default max buffer size', async () => {
        const expMaxBufferSize = 200 * 1024;
        await runCargoTestsForPackageTargetWithFormat(defaultParams, format);
        const actMaxBufferSize = runCargoCommandStub.firstCall.args[3];
        assert.deepEqual(actMaxBufferSize, expMaxBufferSize);
    });

    test('Should use specified max buffer size', async () => {
        const expMaxBufferSize = 100 * 1024;
        await runCargoTestsForPackageTargetWithFormat(defaultParams, format, expMaxBufferSize);
        const actMaxBufferSize = runCargoCommandStub.firstCall.args[3];
        assert.deepEqual(actMaxBufferSize, expMaxBufferSize);
    });

    test('Should include provided cargoTestArgs when specified', async () => {
        const params = <ICargoTestExecutionParameters> JSON.parse(JSON.stringify(defaultParams));
        params.cargoSubCommandArgs = spec;
        await runCargoTestsForPackageTargetWithFormat(params, format);
        const actArgs = runCargoCommandStub.firstCall.args[1];
        assert.deepEqual(actArgs, `${packageTargetFilter}${spec} -- --format ${format}`);
    });

    test('Should use correct default for cargoTestArgs when none provided', async () => {
        await runCargoTestsForPackageTargetWithFormat(defaultParams, format);
        const actArgs = runCargoCommandStub.firstCall.args[1];
        assert.deepEqual(actArgs, baseLineCargoSubCommandArgs);
    });

    test('Should include provided testBinaryArgs when specified', async () => {
        const params = <ICargoTestExecutionParameters> JSON.parse(JSON.stringify(defaultParams));
        const binArgs = '--exact';
        params.testBinaryArgs = binArgs;
        await runCargoTestsForPackageTargetWithFormat(params, format);
        const actArgs = runCargoCommandStub.firstCall.args[1];
        assert.deepEqual(actArgs, `${baseLineCargoSubCommandArgs} ${binArgs}`);
    });

    test('Should use correct default for testBinaryArgs when none provided', async () => {
        await runCargoTestsForPackageTargetWithFormat(defaultParams, format);
        const actArgs = runCargoCommandStub.firstCall.args[1];
        assert.deepEqual(actArgs, baseLineCargoSubCommandArgs);
    });
}
