'use strict';

import * as Sinon from 'sinon';

import { rustAdapterParamStubs } from '../../test-utils';
import aggregateWorkspaceTestResults from './aggregate-workspace-test-results';
import buildRootNodeInfo from './build-root-node-info';
import buildWorkspaceLoadedTestResult from './build-workspace-loaded-tests-result';
import getTestLoaders from './get-test-loaders';
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

    suite('aggregateWorkspaceTestResults()', aggregateWorkspaceTestResults.bind(this));
    suite('buildRootNodeInfo()', buildRootNodeInfo.bind(this));
    suite('buildWorkspaceLoadedTestResult()', buildWorkspaceLoadedTestResult.bind(this));
    suite('getTestLoaders()', getTestLoaders.bind(this));
    suite('loadDocumentationTests()', loadDocumentationTests.bind(this));
    suite('loadIntegrationTests()', loadIntegrationTests.bind(this));
    suite('loadPackageUnitTestTree()', loadPackageUnitTestTree.bind(this));
    suite('loadTestsForPackage()', loadTestsForPackage.bind(this));
    suite('loadUnitTests()', loadUnitTests.bind(this));
    suite('loadWorkspaceTests()', loadWorkspaceTests.bind(this));
});
