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
    const { logStub } = rustAdapterParams;
    const { runCargoTestsForPackageTargetWithPrettyFormat } = cargo;
    const { swansonLibPackage: { name: packageName } } = cargoPackages;
    const targetName = 'ronald';
    const nodeTarget = <INodeTarget>{ targetName, targetType: TargetType.bin };
    let runCargoTestsForPackageTargetWithFormatStub: Sinon.SinonStub;
    const expFormat = 'pretty';
    const workspaceRoot = '/usr/me/test';
    const defaultParams = <ICargoTestExecutionParameters> {
        packageName,
        nodeTarget,
        targetWorkspace: workspaceRoot,
        log: logStub
    };

    setup(() => {
        runCargoTestsForPackageTargetWithFormatStub = Sinon.stub(cargo, 'runCargoTestsForPackageTargetWithFormat');
    });

    test('Should handle exception correctly', async () => {
        const message = 'Oops!';
        const error = new Error(message);
        runCargoTestsForPackageTargetWithFormatStub.callsFake(() => Promise.reject(error));
        try {
            await runCargoTestsForPackageTargetWithPrettyFormat(defaultParams);
            assert.fail('Should have thrown');
        } catch (err) {
            assert.deepEqual(err.message, message);
        }
    });

    test('Should return correct result', async () => {
        const expOutput = 'b-e-a-uTiFul output';
        const expMaxBufferSize = 300 * 1024;
        runCargoTestsForPackageTargetWithFormatStub.callsFake(() => expOutput);
        const result = await runCargoTestsForPackageTargetWithPrettyFormat(defaultParams, expMaxBufferSize);
        assert.deepEqual(result, expOutput);
        assert.isTrue(runCargoTestsForPackageTargetWithFormatStub.calledWithExactly(defaultParams, expFormat, expMaxBufferSize));
    });

    test('Should use correct default max buffer size', async () => {
        const expMaxBufferSize = 200 * 1024;
        await runCargoTestsForPackageTargetWithPrettyFormat(defaultParams);
        const actMaxBufferSize = runCargoTestsForPackageTargetWithFormatStub.firstCall.args[2];
        assert.deepEqual(actMaxBufferSize, expMaxBufferSize);
    });

    test('Should use specified max buffer size', async () => {
        const expMaxBufferSize = 100 * 1024;
        await runCargoTestsForPackageTargetWithPrettyFormat(defaultParams, expMaxBufferSize);
        const actMaxBufferSize = runCargoTestsForPackageTargetWithFormatStub.firstCall.args[2];
        assert.deepEqual(actMaxBufferSize, expMaxBufferSize);
    });
}
