'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import * as testLoader from '../../../src/test-loader';
import { treeNodes } from '../../test-utils';
import { ILoadedTestsResult } from '../../../src/interfaces/loaded-tests-result';
import { ITestCaseNode } from '../../../src/interfaces/test-case-node';
import { ITestSuiteNode } from '../../../src/interfaces/test-suite-node';
import { binLoadedTestsResultStub, libLoadedTestsResultStub } from '../../data/tree-nodes';
import { createEmptyTestSuiteNode, createTestSuiteInfo } from '../../../src/utils';
import { NodeCategory } from '../../../src/enums/node-category';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let buildRootNodeInfoStub: Sinon.SinonStub;
    const { buildWorkspaceLoadedTestsResult } = testLoader;
    const {
        binTestSuitesMapStub,
        binTestCasesMapStub,
        libTestCasesMapStub,
        libTestSuitesMapStub
    } = treeNodes;
    const { structuralNodesLoadedTestsResultStub: { rootTestSuite } } = treeNodes;
    const expRootNodeId = 'root';
    const unitTestSuiteInfo = createTestSuiteInfo('unit', 'unit');
    const integrationTestSuiteInfo = createTestSuiteInfo('integration', 'integration');
    const expRootNodes = [ unitTestSuiteInfo, integrationTestSuiteInfo ];
    const rootTestSuiteNode = createEmptyTestSuiteNode(expRootNodeId, null, true, NodeCategory.structural);
    const unitTestSuiteNode = createEmptyTestSuiteNode('unit', null, true, NodeCategory.structural);
    const integrationTestSuiteNode = createEmptyTestSuiteNode('integration', null, true, NodeCategory.structural);
    rootTestSuiteNode.childrenNodeIds = rootTestSuite.children.map(c => c.id);
    const rootNodeInfo = { testSuiteInfo: rootTestSuite, testSuiteNode: rootTestSuiteNode };
    const workspaceResults = [
        {
            results: [ binLoadedTestsResultStub ],
            rootNode: unitTestSuiteInfo,
            testSuiteNode: unitTestSuiteNode
        },
        {
            results: [ libLoadedTestsResultStub ],
            rootNode: integrationTestSuiteInfo,
            testSuiteNode: integrationTestSuiteNode
        }
    ];

    setup(() => {
        buildRootNodeInfoStub = Sinon.stub(testLoader, 'buildRootNodeInfo').callsFake(() => (rootNodeInfo));
    });

    test('Should return correct load result for workspace', () => {
        const testSuitesMap = new Map<string, ITestSuiteNode>([ ...binTestSuitesMapStub, ...libTestSuitesMapStub ]);
        testSuitesMap.set(rootNodeInfo.testSuiteNode.id, rootNodeInfo.testSuiteNode);
        testSuitesMap.set(unitTestSuiteNode.id, unitTestSuiteNode);
        testSuitesMap.set(integrationTestSuiteNode.id, integrationTestSuiteNode);
        const expected = <ILoadedTestsResult> {
            rootTestSuite,
            testCasesMap: new Map<string, ITestCaseNode>([ ...binTestCasesMapStub, ...libTestCasesMapStub ]),
            testSuitesMap
        };

        const actual = buildWorkspaceLoadedTestsResult(workspaceResults);
        assert.deepEqual(actual, expected);
        assert.isTrue(buildRootNodeInfoStub.calledWithExactly(expRootNodes, expRootNodeId, 'rust'));
    });
}
