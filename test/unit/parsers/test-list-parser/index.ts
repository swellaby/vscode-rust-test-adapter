'use strict';

import * as Sinon from 'sinon';

import initializeTestNode from './initialize-test-node';
import parseCargoTestListResults from './parse-cargo-test-list-results';
import parseCargoTestListResult from './parse-cargo-test-list-result';
import parseCargoTestListOutput from './parse-cargo-test-list-output';
import * as utils from '../../../../src/utils';

suite('test-list-parser Tests:', function () {
    setup(function () {
        this.createEmptyTestSuiteNodeStub = Sinon.stub(utils, 'createEmptyTestSuiteNode');
        this.createTestSuiteInfoStub = Sinon.stub(utils, 'createTestSuiteInfo');
    });

    teardown(() => {
        Sinon.restore();
    });

    suite('initializeTestNode()', initializeTestNode.bind(this));
    suite('parseCargoTestListOutput()', parseCargoTestListOutput.bind(this));
    suite('parseCargoTestListResults()', parseCargoTestListResults.bind(this));
    suite('parseCargoTestListResult()', parseCargoTestListResult.bind(this));
});
