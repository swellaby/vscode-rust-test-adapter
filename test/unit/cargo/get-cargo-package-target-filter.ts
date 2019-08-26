'use strict';

import { assert } from 'chai';
import { getCargoPackageTargetFilter } from '../../../src/cargo';

import { TargetType } from '../../../src/enums/target-type';
import { INodeTarget } from '../../../src/interfaces/node-target';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    const packageName = 'swanson';

    test('Should return correct filter for lib node target', () => {
        const nodeTarget = <INodeTarget>{ targetName: 'foo', targetType: TargetType.lib };
        const filter = getCargoPackageTargetFilter(packageName, nodeTarget);
        assert.deepEqual(filter, `-p ${packageName} --lib`);
    });

    test('Should return correct filter for bin node target', () => {
        const targetName = 'ronald';
        const nodeTarget = <INodeTarget>{ targetName, targetType: TargetType.bin };
        const filter = getCargoPackageTargetFilter(packageName, nodeTarget);
        assert.deepEqual(filter, `-p ${packageName} --bin ${targetName}`);
    });

    test('Should return correct filter for test node target', () => {
        const targetName = 'functional';
        const nodeTarget = <INodeTarget>{ targetName, targetType: TargetType.test };
        const filter = getCargoPackageTargetFilter(packageName, nodeTarget);
        assert.deepEqual(filter, `-p ${packageName} --test ${targetName}`);
    });
}
