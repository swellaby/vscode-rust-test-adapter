'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import * as testLoader from '../../../src/test-loader';
import { treeNodes } from '../../test-utils';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let aggregateWorkspaceTestsResultsStub: Sinon.SinonStub;
    const { buildWorkspaceLoadedTestsResult } = testLoader;
    const {
        structuralNodesLoadedTestsResultStub,
        libLoadedTestsResultStub,
        libTestSuites: { libTestSuite1 }
    } = treeNodes;
    const workspaceResults = [
        {
            results: [ libLoadedTestsResultStub ],
            rootNode: structuralNodesLoadedTestsResultStub.rootTestSuite,
            testSuiteNode: libTestSuite1
        }
    ];

    setup(() => {
        aggregateWorkspaceTestsResultsStub = Sinon.stub(testLoader, 'aggregateWorkspaceTestsResults').callsFake(() => structuralNodesLoadedTestsResultStub);
    });

    test('Should return null when results array is null', () => {
        assert.isNull(buildWorkspaceLoadedTestsResult(null));
    });

    test('Should return null when results array is undefined', () => {
        assert.isNull(buildWorkspaceLoadedTestsResult(undefined));
    });

    test('Should return null when results array is empty', () => {
        assert.isNull(buildWorkspaceLoadedTestsResult([]));
    });

    test('Should return null when results array only contains null', () => {
        assert.isNull(buildWorkspaceLoadedTestsResult([null]));
    });

    test('Should return null when results array only contains undefined', () => {
        assert.isNull(buildWorkspaceLoadedTestsResult([undefined]));
    });

    test('Should return correct result when tests are retrieved successfully', () => {
        const result = buildWorkspaceLoadedTestsResult(workspaceResults);
        assert.deepEqual(result, structuralNodesLoadedTestsResultStub);
        assert.isTrue(aggregateWorkspaceTestsResultsStub.calledWithExactly(workspaceResults));
    });
}
