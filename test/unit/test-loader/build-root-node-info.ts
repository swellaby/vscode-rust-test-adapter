'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';
import { TestSuiteInfo } from 'vscode-test-adapter-api';

import { buildRootNodeInfo } from '../../../src/test-loader';
import * as utils from '../../../src/utils';
import { treeNodes } from '../../test-utils';
import { NodeCategory } from '../../../src/enums/node-category';
import { ITestSuiteNode } from '../../../src/interfaces/test-suite-node';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let createEmptyTestSuiteNodeStub: Sinon.SinonStub;
    let createTestSuiteInfoStub: Sinon.SinonStub;
    const rootNodeId = 'foo';
    const rootNodeLabel = 'bar';
    const emptyTestSuiteNode = <ITestSuiteNode> {
        id: rootNodeId,
        testSpecName: '',
        category: NodeCategory.structural,
        childrenNodeIds: [],
        isStructuralNode: true,
        packageName: undefined,
        targets: []
    };
    const rootTestSuiteInfo = <TestSuiteInfo> {
        id: rootNodeId,
        label: rootNodeLabel,
        type: 'suite',
        children: []
    };
    const { binLoadedTestsResultStub, libLoadedTestsResultStub } = treeNodes;

    setup(() => {
        createEmptyTestSuiteNodeStub = Sinon.stub(utils, 'createEmptyTestSuiteNode').callsFake(() => emptyTestSuiteNode);
        createTestSuiteInfoStub = Sinon.stub(utils, 'createTestSuiteInfo').callsFake(() => rootTestSuiteInfo);
    });

    test('Should create correct tree node objects', () => {
        buildRootNodeInfo([binLoadedTestsResultStub.rootTestSuite], rootNodeId, rootNodeLabel);
        assert.isTrue(createEmptyTestSuiteNodeStub.calledWithExactly(
            rootNodeId,
            null,
            true,
            NodeCategory.structural
        ));
        assert.isTrue(createTestSuiteInfoStub.calledWithExactly(rootNodeId, rootNodeLabel));
    });

    test('Should flatten root nodes children when there is only one child', () => {
        const { testSuiteInfo } = buildRootNodeInfo([ binLoadedTestsResultStub.rootTestSuite ], rootNodeId, rootNodeLabel);
        assert.deepEqual(testSuiteInfo.children, binLoadedTestsResultStub.rootTestSuite.children);
    });

    test('Should not flatten root nodes children when there is more than one child', () => {
        const nodes = [ binLoadedTestsResultStub.rootTestSuite, libLoadedTestsResultStub.rootTestSuite ];
        const { testSuiteInfo } = buildRootNodeInfo(nodes, rootNodeId, rootNodeLabel);
        assert.deepEqual(testSuiteInfo.children, nodes);
    });

    test('Should set correct childrenNodeIds on test suite node', () => {
        const { testSuiteNode, testSuiteInfo } = buildRootNodeInfo([ binLoadedTestsResultStub.rootTestSuite ], rootNodeId, rootNodeLabel);
        assert.deepEqual(testSuiteNode.childrenNodeIds, testSuiteInfo.children.map(c => c.id));
    });
}
