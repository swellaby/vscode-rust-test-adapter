'use strict';

import * as Sinon from 'sinon';

import { rustAdapterParamStubs } from '../../test-utils';
import getCargoNodeTarget from './get-cargo-node-target';
import getCargoMetadata from './get-cargo-metadata';
import getCargoTestListForPackage from './get-cargo-test-list-for-package';
import getCargoTestListOutput from './get-cargo-test-list-output';
import runCargoCommand from './run-cargo-command';

suite('cargo Tests:', function () {
    setup(function () {
        this.logDebugStub = rustAdapterParamStubs.log.getDebugStub();
    });

    teardown(() => {
        Sinon.restore();
    });

    suite('getCargoMetadata()', getCargoMetadata.bind(this));
    suite('getCargoNodeTarget()', getCargoNodeTarget.bind(this));
    suite('getCargoTestListForPackage()', getCargoTestListForPackage.bind(this));
    suite('getCargoTestListOutput()', getCargoTestListOutput.bind(this));
    suite('runCargoCommand()', runCargoCommand.bind(this));
});
