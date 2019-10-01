'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import { updateTestTree } from '../../../../src/parsers/test-list-parser';
import { cargoTestListResults, cargoPackages } from '../../../test-utils';
import { ITestSuiteNode } from '../../../../src/interfaces/test-suite-node';
import { NodeCategory } from '../../../../src/enums/node-category';
import { TestSuiteInfo, TestInfo } from 'vscode-test-adapter-api';
import { ICargoTestListResult } from '../../../../src/interfaces/cargo-test-list-result';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let createEmptyTestSuiteNodeStub: Sinon.SinonStub;
    let createTestSuiteInfoStub: Sinon.SinonStub;
    const { swansonLibPackage } = cargoPackages;
    const { name: packageName } = swansonLibPackage;
    const stubTestSuiteNode = <ITestSuiteNode> {
        id: packageName,
        testSpecName: '',
        childrenNodeIds: [],
        packageName: packageName,
        isStructuralNode: false,
        category: NodeCategory.unit,
        targets: []
    };
    let stubTargetRootTestSuiteInfo: TestSuiteInfo;
    const stubTestInfo = <TestInfo> {
        id: 'foo',
        label: 'foo',
        type: 'test'
    };
    const firstCargoTestListResult: ICargoTestListResult = cargoTestListResults[0];
    let testSuitesMap: Map<string, ITestSuiteNode>;
    const { nodeTarget: target } = firstCargoTestListResult;
    const testsModulePathPath = 'tests';
    let testsChildTestSuiteNode: ITestSuiteNode;
    let testsChildTestSuiteInfo: TestSuiteInfo;

    const initStubNodes = () => {
        stubTargetRootTestSuiteInfo = <TestSuiteInfo> {
            id: packageName,
            label: packageName,
            type: 'suite',
            children: []
        };
        testsChildTestSuiteNode = <ITestSuiteNode> {
            id: `${stubTargetRootTestSuiteInfo.id}::${testsModulePathPath}`,
            testSpecName: `${testsModulePathPath}::`,
            childrenNodeIds: [],
            packageName: packageName,
            isStructuralNode: false,
            category: NodeCategory.unit,
            targets: []
        };
        testsChildTestSuiteInfo = <TestSuiteInfo> {
            id: `${stubTargetRootTestSuiteInfo.id}::${testsModulePathPath}`,
            label: '',
            type: 'suite',
            children: []
        };
    };

    setup(function () {
        initStubNodes();
        testSuitesMap = new Map<string, ITestSuiteNode>();
        testSuitesMap.set(packageName, stubTestSuiteNode);
        createEmptyTestSuiteNodeStub = this.test.ctx.createEmptyTestSuiteNodeStub;
        createEmptyTestSuiteNodeStub.onFirstCall().callsFake(() => testsChildTestSuiteNode);
        createTestSuiteInfoStub = this.test.ctx.createTestSuiteInfoStub;
        createTestSuiteInfoStub.onFirstCall().callsFake(() => testsChildTestSuiteInfo);
    });

    test('Should add test case directly to test suite when test is at root', () => {
        updateTestTree(stubTestInfo, stubTargetRootTestSuiteInfo, [ ], testSuitesMap, swansonLibPackage, target);
        assert.deepEqual(stubTargetRootTestSuiteInfo.children, [ stubTestInfo ]);
    });

    test('Should correctly handle a net-new test suite info node', () => {
        const expTestChildTestSuiteInfo = JSON.parse(JSON.stringify(testsChildTestSuiteInfo));
        expTestChildTestSuiteInfo.children = [ stubTestInfo ];
        const expTestSuiteNodeMap = new Map<string, ITestSuiteNode>();
        expTestSuiteNodeMap.set(packageName, stubTestSuiteNode);
        expTestSuiteNodeMap.set(testsChildTestSuiteNode.id , testsChildTestSuiteNode);
        updateTestTree(stubTestInfo, stubTargetRootTestSuiteInfo, [ testsModulePathPath ], testSuitesMap, swansonLibPackage, target);
        assert.deepEqual(stubTargetRootTestSuiteInfo.children, [ expTestChildTestSuiteInfo ]);
        assert.deepEqual(testsChildTestSuiteNode.targets, [ target ]);
        assert.deepEqual(expTestSuiteNodeMap, testSuitesMap);
    });

    test('Should correctly handle an existing test suite node', () => {
        stubTargetRootTestSuiteInfo.children.push(testsChildTestSuiteInfo);
        const expTestChildTestSuiteInfo = JSON.parse(JSON.stringify(testsChildTestSuiteInfo));
        expTestChildTestSuiteInfo.children = [ stubTestInfo ];
        const expTestSuiteNodeMap = new Map<string, ITestSuiteNode>();
        expTestSuiteNodeMap.set(packageName, stubTestSuiteNode);
        expTestSuiteNodeMap.set(testsChildTestSuiteNode.id , testsChildTestSuiteNode);
        testSuitesMap.set(testsChildTestSuiteNode.id , testsChildTestSuiteNode);
        updateTestTree(stubTestInfo, stubTargetRootTestSuiteInfo, [ testsModulePathPath ], testSuitesMap, swansonLibPackage, target);
        assert.deepEqual(stubTargetRootTestSuiteInfo.children, [ expTestChildTestSuiteInfo ]);
        assert.deepEqual(expTestSuiteNodeMap, testSuitesMap);
    });

    test('Should correctly handle multiple test cases within a given test suite', () => {
        const stubTestInfo2 = <TestInfo> {
            id: 'bar',
            label: 'bar',
            type: 'test'
        };
        stubTargetRootTestSuiteInfo.children.push(testsChildTestSuiteInfo);
        const expTestChildTestSuiteInfo = JSON.parse(JSON.stringify(testsChildTestSuiteInfo));
        expTestChildTestSuiteInfo.children = [ stubTestInfo, stubTestInfo2 ];
        updateTestTree(stubTestInfo, stubTargetRootTestSuiteInfo, [ testsModulePathPath ], testSuitesMap, swansonLibPackage, target);
        updateTestTree(stubTestInfo2, stubTargetRootTestSuiteInfo, [ testsModulePathPath ], testSuitesMap, swansonLibPackage, target);
        assert.deepEqual(stubTargetRootTestSuiteInfo.children, [ expTestChildTestSuiteInfo ]);
    });
}
