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
    let buildRootNodeInfoStub: Sinon.SinonStub;
    const { buildWorkspaceLoadedTestsResult } = testLoader;
    const {
        binTestSuitesMapStub,
        binTestCasesMapStub,
        libTestCasesMapStub,
        libTestSuitesMapStub,
        libRootTestSuiteInfo
    } = treeNodes;
    const {
        structuralNodesLoadedTestsResultStub: { rootTestSuite },
        binTestSuites: { binTestSuite1 },
        libTestSuites: { libTestSuite1 },
    } = treeNodes;
    const rootNodeInfo = { testSuiteInfo: rootTestSuite, testSuiteNode: binTestSuite1 }
    const workspaceResults = [
        {
            results: [ binLoadedTestsResultStub ],
            rootNode: libRootTestSuiteInfo,
            testSuiteNode: binTestSuite1
        },
        {
            results: [ libLoadedTestsResultStub ],
            rootNode: libRootTestSuiteInfo,
            testSuiteNode: libTestSuite1
        }
    ];

    setup(() => {
        buildRootNodeInfoStub = Sinon.stub(testLoader, 'buildRootNodeInfo').callsFake(() => (rootNodeInfo));
    });

    test('Should return correct load result for workspace', () => {
        const testSuitesMap = new Map<string, ITestSuiteNode>([ ...binTestSuitesMapStub, ...libTestSuitesMapStub ]);
        testSuitesMap.set(rootNodeInfo.testSuiteNode.id, rootNodeInfo.testSuiteNode);
        const expected = <ILoadedTestsResult> {
            rootTestSuite,
            testCasesMap: new Map<string, ITestCaseNode>([ ...binTestCasesMapStub, ...libTestCasesMapStub ]),
            testSuitesMap
        };

        const actual = buildWorkspaceLoadedTestsResult(workspaceResults);
        assert.deepEqual(actual, expected);
        const expRootNodes = workspaceResults.map(r => r.rootNode);
        assert.isTrue(buildRootNodeInfoStub.calledWithExactly(expRootNodes, 'root', 'rust'));
    });
}
