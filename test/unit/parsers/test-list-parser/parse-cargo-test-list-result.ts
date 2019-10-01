'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import * as testListParser from '../../../../src/parsers/test-list-parser';
import { cargoTestListResults, cargoPackages } from '../../../test-utils';
import { ITestSuiteNode } from '../../../../src/interfaces/test-suite-node';
import { NodeCategory } from '../../../../src/enums/node-category';
import { TestSuiteInfo } from 'vscode-test-adapter-api';
import { ICargoTestListResult } from '../../../../src/interfaces/cargo-test-list-result';
import { ITestCaseNode } from '../../../../src/interfaces/test-case-node';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let createEmptyTestSuiteNodeStub: Sinon.SinonStub;
    let createTestSuiteInfoStub: Sinon.SinonStub;
    let parseCargoTestListOutputStub: Sinon.SinonStub;
    const { parseCargoTestListResult } = testListParser;
    const { swansonLibPackage } = cargoPackages;
    const { name: packageName } = swansonLibPackage;
    let stubPackageTestSuiteNode: ITestSuiteNode;
    let stubPackageTestSuiteInfo: TestSuiteInfo;
    let stubTargetTestSuiteNode: ITestSuiteNode;
    let stubTargetTestSuiteInfo: TestSuiteInfo;
    const firstCargoTestListResult: ICargoTestListResult = cargoTestListResults[0];
    let testSuitesMap: Map<string, ITestSuiteNode>;
    const testCasesMap = new Map<string, ITestCaseNode>();
    const { nodeTarget: target } = firstCargoTestListResult;
    const { targetName, targetType } = target;
    const expTargetNodeId = `${packageName}::${targetName}::${targetType}`;

    const initPackageStubNodes = () => {
        stubPackageTestSuiteNode = <ITestSuiteNode> {
            id: packageName,
            testSpecName: '',
            childrenNodeIds: [],
            packageName: packageName,
            isStructuralNode: false,
            category: NodeCategory.unit,
            targets: []
        };
        stubPackageTestSuiteInfo = <TestSuiteInfo> {
            id: packageName,
            label: packageName,
            type: 'suite',
            children: []
        };
    };

    const initTargetStubNodes = () => {
        stubTargetTestSuiteNode = <ITestSuiteNode> {
            id: packageName,
            testSpecName: '',
            childrenNodeIds: [],
            packageName: packageName,
            isStructuralNode: false,
            category: NodeCategory.unit,
            targets: []
        };
        stubTargetTestSuiteInfo = <TestSuiteInfo> {
            id: packageName,
            label: packageName,
            type: 'suite',
            children: []
        };
    };

    setup(function () {
        createEmptyTestSuiteNodeStub = this.test.ctx.createEmptyTestSuiteNodeStub;
        createEmptyTestSuiteNodeStub.callsFake(() => stubTargetTestSuiteNode);
        createTestSuiteInfoStub = this.test.ctx.createTestSuiteInfoStub;
        createTestSuiteInfoStub.callsFake(() => stubTargetTestSuiteInfo);
        parseCargoTestListOutputStub = Sinon.stub(testListParser, 'parseCargoTestListOutput');
        testSuitesMap = new Map<string, ITestSuiteNode>();
        initPackageStubNodes();
        initTargetStubNodes();
        parseCargoTestListResult(firstCargoTestListResult, packageName, swansonLibPackage, stubPackageTestSuiteNode, testSuitesMap, stubPackageTestSuiteInfo, testCasesMap);
    });

    test('Should create correct target root nodes', () => {
        assert.isTrue(createEmptyTestSuiteNodeStub.calledWithExactly(expTargetNodeId, swansonLibPackage));
        assert.isTrue(createTestSuiteInfoStub.calledWithExactly(expTargetNodeId, targetName));
    });

    test('Should set correct target and children fields on package nodes', () => {
        assert.deepEqual(stubPackageTestSuiteNode.childrenNodeIds, [ expTargetNodeId ]);
        assert.deepEqual(stubPackageTestSuiteNode.targets, [ target ]);
        assert.deepEqual(stubPackageTestSuiteInfo.children, [ stubTargetTestSuiteInfo ]);
        assert.deepEqual(stubTargetTestSuiteNode.targets, [ target ]);
    });

    test('Should add target root node to the test suite node map', () => {
        const expMap = new Map<string, ITestSuiteNode>();
        expMap.set(expTargetNodeId, stubTargetTestSuiteNode);
        assert.deepEqual(testSuitesMap, expMap);
    });

    test('Should pass correct args to parseCargoTestListOutput', () => {
        const expMap = new Map<string, ITestSuiteNode>();
        expMap.set(expTargetNodeId, stubTargetTestSuiteNode);
        const expArgs = [
            firstCargoTestListResult,
            expTargetNodeId,
            swansonLibPackage,
            testCasesMap,
            stubTargetTestSuiteInfo,
            expMap
        ];
        assert.isTrue(parseCargoTestListOutputStub.calledOnceWithExactly(...expArgs));
    });
}
