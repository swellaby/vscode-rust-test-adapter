'use strict';

import { ICargoTestListResult } from '../../src/interfaces/cargo-test-list-result';
import { INodeTarget } from '../../src/interfaces/node-target';
import { TargetType } from '../../src/enums/target-type';

const libNodeTarget = <INodeTarget> { targetName: 'swanson', targetType: TargetType.lib };
const binTargetName = 'ron';
const binNodeTarget = <INodeTarget> { targetName: binTargetName, targetType: TargetType.bin };
export const cargoTestListResults = [
    <ICargoTestListResult> {
        output: `tests::test_subtract: test

        1 test, 0 benchmarks`,
        nodeTarget: libNodeTarget
    },
    <ICargoTestListResult> {
        output: `tests::test_add: test
        tests::test_bad_add: test

        2 tests, 0 benchmarks
        `,
        nodeTarget: binNodeTarget
    }
];
