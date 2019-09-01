'use strict';

import * as Sinon from 'sinon';

import { rustAdapterParamStubs } from '../../test-utils';
import buildRootTestSuiteInfoNode from './build-root-test-suite-info-node';
import buildWorkspaceLoadedTestResult from './build-workspace-loaded-tests-result';
import loadDocumentationTests from './load-documentation-tests';
import loadIntegrationTests from './load-integration-tests';
import loadPackageUnitTestTree from './load-package-unit-test-tree';
import loadTestsForPackage from './load-tests-for-package';
import loadUnitTests from './load-unit-tests';
import loadWorkspaceTests from './load-workspace-tests';

suite('test-loader Tests:', function () {
    setup(function () {
        this.logDebugStub = rustAdapterParamStubs.log.getDebugStub();
        this.logWarnStub = rustAdapterParamStubs.log.getWarnStub();
    });

    teardown(() => {
        Sinon.restore();
    });

    suite('buildRootTestSuiteInfoNode()', buildRootTestSuiteInfoNode.bind(this));
    suite('buildWorkspaceLoadedTestResult()', buildWorkspaceLoadedTestResult.bind(this));
    suite('loadDocumentationTests()', loadDocumentationTests.bind(this));
    suite('loadIntegrationTests()', loadIntegrationTests.bind(this));
    suite('loadPackageUnitTestTree()', loadPackageUnitTestTree.bind(this));
    suite('loadTestsForPackage()', loadTestsForPackage.bind(this));
    suite('loadUnitTests()', loadUnitTests.bind(this));
    suite('loadWorkspaceTests()', loadWorkspaceTests.bind(this));
});
