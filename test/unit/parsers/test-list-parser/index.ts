'use strict';

import * as Sinon from 'sinon';

import parseCargoTestListResults from './parse-cargo-test-list-results';
import * as utils from '../../../../src/utils';

suite('test-list-parser Tests:', function () {
    setup(function () {
        this.createEmptyTestSuiteNodeStub = Sinon.stub(utils, 'createEmptyTestSuiteNode');
        this.createTestSuiteInfoStub = Sinon.stub(utils, 'createTestSuiteInfo');
    });

    teardown(() => {
        Sinon.restore();
    });

    suite('parseCargoTestListResults()', parseCargoTestListResults.bind(this));
});
