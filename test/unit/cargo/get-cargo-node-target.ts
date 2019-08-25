'use strict';

import { assert } from 'chai';
import { getCargoNodeTarget } from '../../../src/cargo';

import { ICargoPackageTarget } from '../../../src/interfaces/cargo-package-target';
import { TargetType } from '../../../src/enums/target-type';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    const targetName = 'nias';

    test('Should throw exception on unsupported target type', () => {
        const targetKind = 'fake';
        const packageTarget = <ICargoPackageTarget>{ kind: [targetKind], name: targetName };
        const expectedError = `Unsupported target type: ${targetKind} for ${targetName}`;
        assert.throws(() => getCargoNodeTarget(packageTarget), expectedError);
    });

    test('Should return bin target type for bin target kind', () => {
        const targetKind = 'bin';
        const packageTarget = <ICargoPackageTarget>{ kind: [targetKind], name: targetName };
        const nodeTarget = getCargoNodeTarget(packageTarget);
        assert.deepEqual(nodeTarget.targetName, targetName);
        assert.deepEqual(nodeTarget.targetType, TargetType.bin);
    });

    test('Should return lib target type for lib target kind', () => {
        const targetKind = 'lib';
        const packageTarget = <ICargoPackageTarget>{ kind: [targetKind], name: targetName };
        const nodeTarget = getCargoNodeTarget(packageTarget);
        assert.deepEqual(nodeTarget.targetName, targetName);
        assert.deepEqual(nodeTarget.targetType, TargetType.lib);
    });

    test('Should return test target type for test target kind', () => {
        const targetKind = 'test';
        const packageTarget = <ICargoPackageTarget>{ kind: [targetKind], name: targetName };
        const nodeTarget = getCargoNodeTarget(packageTarget);
        assert.deepEqual(nodeTarget.targetName, targetName);
        assert.deepEqual(nodeTarget.targetType, TargetType.test);
    });

    test('Should return lib target type for staticlib target kind', () => {
        const targetKind = 'staticlib';
        const packageTarget = <ICargoPackageTarget>{ kind: [targetKind], name: targetName };
        const nodeTarget = getCargoNodeTarget(packageTarget);
        assert.deepEqual(nodeTarget.targetName, targetName);
        assert.deepEqual(nodeTarget.targetType, TargetType.lib);
    });

    test('Should return lib target type for dylib target kind', () => {
        const targetKind = 'dylib';
        const packageTarget = <ICargoPackageTarget>{ kind: [targetKind], name: targetName };
        const nodeTarget = getCargoNodeTarget(packageTarget);
        assert.deepEqual(nodeTarget.targetName, targetName);
        assert.deepEqual(nodeTarget.targetType, TargetType.lib);
    });

    test('Should return lib target type for cdylib target kind', () => {
        const targetKind = 'cdylib';
        const packageTarget = <ICargoPackageTarget>{ kind: [targetKind], name: targetName };
        const nodeTarget = getCargoNodeTarget(packageTarget);
        assert.deepEqual(nodeTarget.targetName, targetName);
        assert.deepEqual(nodeTarget.targetType, TargetType.lib);
    });

    test('Should return lib target type for rlib target kind', () => {
        const targetKind = 'rlib';
        const packageTarget = <ICargoPackageTarget>{ kind: [targetKind], name: targetName };
        const nodeTarget = getCargoNodeTarget(packageTarget);
        assert.deepEqual(nodeTarget.targetName, targetName);
        assert.deepEqual(nodeTarget.targetType, TargetType.lib);
    });
}
