'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import * as cargo from '../../../src/cargo';
import { rustAdapterParams, cargoPackages } from '../../test-utils';
import { TargetType } from '../../../src/enums/target-type';
import { INodeTarget } from '../../../src/interfaces/node-target';
import { ICargoTestListResult } from '../../../src/interfaces/cargo-test-list-result';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let logDebugStub: Sinon.SinonStub;
    let getCargoTestListForPackageStub: Sinon.SinonStub;
    const { logStub } = rustAdapterParams;
    const { swansonLibPackage } = cargoPackages;
    const allowedTargetTypes = [ TargetType.bin, TargetType.lib ];
    const libNodeTarget = <INodeTarget> { targetName: 'swanson', targetType: TargetType.lib };
    const binTargetName = 'ron';
    const binNodeTarget = <INodeTarget> { targetName: binTargetName, targetType: TargetType.bin };
    const expectedResults = [
        <ICargoTestListResult> {
            output: '1 test',
            nodeTarget: libNodeTarget
        },
        <ICargoTestListResult> {
            output: '2 tests',
            nodeTarget: binNodeTarget
        }
    ];

    setup(function () {
        getCargoTestListForPackageStub = Sinon.stub(cargo, 'getCargoTestListForPackage').callsFake(() => Promise.resolve(expectedResults));
        logDebugStub = this.test.ctx.logDebugStub;
    });

    test('Should use the correct default args when no additional arguments specified', async () => {
        await cargo.getCargoUnitTestListForPackage(swansonLibPackage, logStub);
        assert.deepEqual(getCargoTestListForPackageStub.firstCall.args[3], '');
    });

    test('Should use the correct filter when additional arguments specified', async () => {
        const additionalArgs = '--doc';
        await cargo.getCargoUnitTestListForPackage(swansonLibPackage, logStub, additionalArgs);
        assert.deepEqual(getCargoTestListForPackageStub.firstCall.args[3], additionalArgs);
    });

    test('Should use the correct allowed target types', async () => {
        await cargo.getCargoUnitTestListForPackage(swansonLibPackage, logStub);
        assert.deepEqual(getCargoTestListForPackageStub.firstCall.args[2], allowedTargetTypes);
    });

    test('Should return array with results for allowed target types', async () => {
        const results = await cargo.getCargoUnitTestListForPackage(swansonLibPackage, logStub);
        assert.deepEqual(results, expectedResults);
    });
}
