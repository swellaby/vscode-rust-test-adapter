'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import * as cargo from '../../../src/cargo';
import { rustAdapterParams, cargoPackages } from '../../test-utils';
import { TargetType } from '../../../src/enums/target-type';
import { INodeTarget } from '../../../src/interfaces/node-target';
import { ICargoPackage } from '../../../src/interfaces/cargo-package';
import { ICargoTestListResult } from '../../../src/interfaces/cargo-test-list-result';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let logDebugStub: Sinon.SinonStub;
    let getCargoTestListOutputStub: Sinon.SinonStub;
    let getCargoNodeTargetStub: Sinon.SinonStub;
    let getCargoPackageTargetFilterStub: Sinon.SinonStub;
    const { logStub } = rustAdapterParams;
    const { swansonLibPackage } = cargoPackages;
    const allowedTargetTypes = [ TargetType.bin, TargetType.lib ];
    const { name: expectedPackageName } = swansonLibPackage;
    const libNodeTarget = <INodeTarget> { targetName: 'swanson', targetType: TargetType.lib };
    const binTargetName = 'ron';
    const binNodeTarget = <INodeTarget> { targetName: binTargetName, targetType: TargetType.bin };
    const expectedLibTargetFilter = `-p ${expectedPackageName} --lib`;
    const expectedBinTargetFilter = `-p ${expectedPackageName} --bin ${binTargetName}`;
    const expectedLibOutput = '3 lib tests';
    const expectedBinOutput = '1 bin test';
    const expectedDirectoryPath = swansonLibPackage.manifest_path.slice(0, -10);

    setup(function () {
        getCargoNodeTargetStub = Sinon.stub(cargo, 'getCargoNodeTarget').callsFake(() => libNodeTarget);
        getCargoNodeTargetStub.onSecondCall().callsFake(() => binNodeTarget);
        getCargoPackageTargetFilterStub = Sinon.stub(cargo, 'getCargoPackageTargetFilter').callsFake(() => expectedLibTargetFilter);
        getCargoPackageTargetFilterStub.onSecondCall().callsFake(() => expectedBinTargetFilter);
        getCargoTestListOutputStub = Sinon.stub(cargo, 'getCargoTestListOutput').callsFake(() => Promise.resolve(expectedLibOutput));
        getCargoTestListOutputStub.onSecondCall().callsFake(() => Promise.resolve(expectedBinOutput));
        logDebugStub = this.test.ctx.logDebugStub;
    });

    test('Should handle null package parameter correctly', async () => {
        try {
            await cargo.getCargoTestListForPackage(null, logStub, allowedTargetTypes);
            assert.fail('Should have thrown');
        } catch (err) {
            assert.deepEqual(err.message, 'Invalid value specified for parameter `cargoPackage`. Unable to load tests for null/undefined package.');
        }
    });

    test('Should handle undefined package parameter correctly', async () => {
        try {
            await cargo.getCargoTestListForPackage(undefined, logStub, allowedTargetTypes);
            assert.fail('Should have thrown');
        } catch (err) {
            assert.deepEqual(err.message, 'Invalid value specified for parameter `cargoPackage`. Unable to load tests for null/undefined package.');
        }
    });

    test('Should handle thrown exception correctly', async () => {
        const error = new Error(':(');
        getCargoTestListOutputStub.callsFake(() => Promise.reject(error));

        try {
            await cargo.getCargoTestListForPackage(swansonLibPackage, logStub, allowedTargetTypes);
            assert.fail('Should have thrown');
        } catch (err) {
            assert.isTrue(logDebugStub.calledWith(error));
            assert.deepEqual(err.message, `Failed to load tests for package: ${swansonLibPackage.name}.`);
        }
    });

    test('Should handle manifest path that does not contain Cargo.toml suffix', async () => {
        const stubPackage = <ICargoPackage>JSON.parse(JSON.stringify(swansonLibPackage));
        const expectedDirectoryPath = stubPackage.manifest_path.slice(0, -10);
        stubPackage.manifest_path = expectedDirectoryPath;
        await cargo.getCargoTestListForPackage(stubPackage, logStub, allowedTargetTypes);
        assert.deepEqual(getCargoTestListOutputStub.firstCall.args[0], expectedDirectoryPath);
    });

    test('Should extract correct package root directory from manifest path with Cargo.toml suffix', async () => {
        const expectedDirectoryPath = swansonLibPackage.manifest_path.slice(0, -10);
        await cargo.getCargoTestListForPackage(swansonLibPackage, logStub, allowedTargetTypes);
        assert.deepEqual(getCargoTestListOutputStub.firstCall.args[0], expectedDirectoryPath);
    });

    test('Should create a node target for each package target', async () => {
        await cargo.getCargoTestListForPackage(swansonLibPackage, logStub, allowedTargetTypes);
        assert.isTrue(getCargoNodeTargetStub.calledWithExactly(swansonLibPackage.targets[0], logStub));
        assert.isTrue(getCargoNodeTargetStub.calledWithExactly(swansonLibPackage.targets[1], logStub));
    });

    test('Should use the package name and node target to create the filter', async () => {
        await cargo.getCargoTestListForPackage(swansonLibPackage, logStub, allowedTargetTypes);
        assert.isTrue(getCargoPackageTargetFilterStub.calledWithExactly(expectedPackageName, libNodeTarget));
        assert.isTrue(getCargoPackageTargetFilterStub.calledWithExactly(expectedPackageName, binNodeTarget));
    });

    test('Should use the correct filter when no additional arguments specified', async () => {
        await cargo.getCargoTestListForPackage(swansonLibPackage, logStub, allowedTargetTypes);
        assert.isTrue(getCargoTestListOutputStub.calledWithExactly(expectedDirectoryPath, logStub, expectedLibTargetFilter));
        assert.isTrue(getCargoTestListOutputStub.calledWithExactly(expectedDirectoryPath, logStub, expectedBinTargetFilter));
    });

    test('Should use the correct filter when additional arguments specified', async () => {
        const additionalArgs = '--doc';
        await cargo.getCargoTestListForPackage(swansonLibPackage, logStub, allowedTargetTypes, additionalArgs);
        assert.isTrue(getCargoTestListOutputStub.calledWithExactly(expectedDirectoryPath, logStub, `${expectedLibTargetFilter} ${additionalArgs}`));
        assert.isTrue(getCargoTestListOutputStub.calledWithExactly(expectedDirectoryPath, logStub, `${expectedBinTargetFilter} ${additionalArgs}`));
    });

    test('Should return empty array of results on when no targets of allowed type are found', async () => {
        const results = await cargo.getCargoTestListForPackage(swansonLibPackage, logStub, [ TargetType.test ]);
        assert.deepEqual(results.length, 0);
    });

    test('Should return array with results for allowed target types', async () => {
        const results = await cargo.getCargoTestListForPackage(swansonLibPackage, logStub, allowedTargetTypes);
        assert.deepEqual(results.length, 2);
        assert.deepEqual(results[0], <ICargoTestListResult> { output: expectedLibOutput, nodeTarget: libNodeTarget });
        assert.deepEqual(results[1], <ICargoTestListResult> { output: expectedBinOutput, nodeTarget: binNodeTarget });
    });
}
