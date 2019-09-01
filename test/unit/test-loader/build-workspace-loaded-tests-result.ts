'use strict';
// tslint:disable
// eslint-disable

import { assert } from 'chai';
import * as Sinon from 'sinon';

import * as testLoader from '../../../src/test-loader';
import { treeNodes } from '../../test-utils';
import { ILoadedTestsResult } from '../../../src/interfaces/loaded-tests-result';
import { ITestCaseNode } from '../../../src/interfaces/test-case-node';
import { ITestSuiteNode } from '../../../src/interfaces/test-suite-node';
import { binLoadedTestsResultStub, libLoadedTestsResultStub } from '../../data/tree-nodes';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let buildRootTestSuiteInfoNodeStub: Sinon.SinonStub;
    const { buildWorkspaceLoadedTestsResult } = testLoader;
    const {
        binLoadedTestsResultStub: { rootTestSuite },
        binTestSuitesMapStub,
        binTestCasesMapStub,
        libTestCasesMapStub,
        libTestSuitesMapStub
    } = treeNodes;

    // setup(() => {
    //     buildRootTestSuiteInfoNodeStub = Sinon.stub(testLoader, 'buildRootTestSuiteInfoNode').callsFake(() => rootTestSuite);
    // });

    // test('Should return null when results array is null', () => {
    //     assert.isNull(buildWorkspaceLoadedTestsResult(null));
    // });

    // test('Should return null when results array is undefined', () => {
    //     assert.isNull(buildWorkspaceLoadedTestsResult(undefined));
    // });

    // test('Should return null when results array is empty', () => {
    //     assert.isNull(buildWorkspaceLoadedTestsResult([]));
    // });

    // test('Should return null when results array only contains null', () => {
    //     assert.isNull(buildWorkspaceLoadedTestsResult([null]));
    // });

    // test('Should return null when results array only contains undefined', () => {
    //     assert.isNull(buildWorkspaceLoadedTestsResult([undefined]));
    // });

    // test('Should return correct load result for workspace', () => {
    //     const testSuitesMap = new Map<string, ITestSuiteNode>([ ...binTestSuitesMapStub, ...libTestSuitesMapStub ]);
    //     const expected = <ILoadedTestsResult> {
    //         rootTestSuite,
    //         testCasesMap: new Map<string, ITestCaseNode>([ ...binTestCasesMapStub, ...libTestCasesMapStub ]),
    //         testSuitesMap
    //     };
    //     const workspaceResults = [ binLoadedTestsResultStub, libLoadedTestsResultStub ];
    //     const actual = buildWorkspaceLoadedTestsResult(workspaceResults);
    //     assert.deepEqual(actual, expected);
    //     assert.isTrue(buildRootTestSuiteInfoNodeStub.calledWithExactly(workspaceResults, testSuitesMap, 'root', 'rust'));
    // });
}
