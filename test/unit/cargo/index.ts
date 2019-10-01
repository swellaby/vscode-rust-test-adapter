'use strict';

import * as Sinon from 'sinon';

import { rustAdapterParamStubs } from '../../test-utils';
import getCargoNodeTarget from './get-cargo-node-target';
import getCargoMetadata from './get-cargo-metadata';
import getCargoPackageTargetFilter from './get-cargo-package-target-filter';
import getCargoTestListForPackage from './get-cargo-test-list-for-package';
import getCargoTestListOutput from './get-cargo-test-list-output';
import getCargoUnitTestListForPackage from './get-cargo-unit-test-list-for-package';
import runCargoCommand from './run-cargo-command';
import runCargoTestsForPackageTargetWithFormat from './run-cargo-tests-for-package-target-with-format';
import runCargoTestsForPackageTargetWithPrettyFormat from './run-cargo-tests-for-package-target-with-pretty-format';

suite('cargo Tests:', function () {
    setup(function () {
        this.logDebugStub = rustAdapterParamStubs.log.getDebugStub();
        this.logWarnStub = rustAdapterParamStubs.log.getWarnStub();
    });

    teardown(() => {
        Sinon.restore();
    });

    suite('getCargoMetadata()', getCargoMetadata.bind(this));
    suite('getCargoNodeTarget()', getCargoNodeTarget.bind(this));
    suite('getCargoPackageTargetFilter()', getCargoPackageTargetFilter.bind(this));
    suite('getCargoTestListForPackage()', getCargoTestListForPackage.bind(this));
    suite('getCargoTestListOutput()', getCargoTestListOutput.bind(this));
    suite('getCargoUnitTestListForPackage()', getCargoUnitTestListForPackage.bind(this));
    suite('runCargoCommand()', runCargoCommand.bind(this));
    suite('runCargoTestsForPackageTargetWithFormat()', runCargoTestsForPackageTargetWithFormat.bind(this));
    suite('runCargoTestsForPackageTargetWithPrettyFormat()', runCargoTestsForPackageTargetWithPrettyFormat.bind(this));
});
