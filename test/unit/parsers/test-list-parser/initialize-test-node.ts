'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import { initializeTestNode } from '../../../../src/parsers/test-list-parser';
import { cargoTestListResults, cargoPackages } from '../../../test-utils';
import { NodeCategory } from '../../../../src/enums/node-category';
import { TestInfo } from 'vscode-test-adapter-api';
import * as utils from '../../../../src/utils';
import { ICargoTestListResult } from '../../../../src/interfaces/cargo-test-list-result';
import { ITestCaseNode } from '../../../../src/interfaces/test-case-node';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let createTestCaseNodeStub: Sinon.SinonStub;
    let createTestInfoStub: Sinon.SinonStub;
    const { swansonLibPackage } = cargoPackages;
    const { name: packageName } = swansonLibPackage;
    const firstCargoTestListResult: ICargoTestListResult = cargoTestListResults[0];
    const { nodeTarget: target } = firstCargoTestListResult;
    const { targetName, targetType } = target;
    const expTargetNodeId = `${packageName}::${targetName}::${targetType}`;
    const stubTestCaseNode = <ITestCaseNode> {
        id: 'foo',
        packageName,
        nodeTarget: target,
        testSpecName: 'bar',
        nodeIdPrefix: expTargetNodeId
    };
    const stubTestInfo = <TestInfo> {
        id: 'foo',
        label: 'foo',
        type: 'test'
    };
    let testCasesMap: Map<string, ITestCaseNode>;
    let result: TestInfo;
    const testName = 'test_add';
    const fullTestSpec = `tests::foo::${testName}`;
    const testNodeId = `${expTargetNodeId}::${fullTestSpec}`;

    setup(() => {
        createTestCaseNodeStub = Sinon.stub(utils, 'createTestCaseNode').callsFake(() => stubTestCaseNode);
        createTestInfoStub = Sinon.stub(utils, 'createTestInfo').callsFake(() => stubTestInfo);
        testCasesMap = new Map<string, ITestCaseNode>();
        result = initializeTestNode(fullTestSpec, testName, expTargetNodeId, swansonLibPackage, testCasesMap, target);
    });

    test('Should return correct test info node', () => {
        assert.deepEqual(result, stubTestInfo);
    });

    test('Should pass correct args to test node creation functions', () => {
        assert.isTrue(createTestCaseNodeStub.calledOnceWithExactly(testNodeId, packageName, target, expTargetNodeId, fullTestSpec));
        assert.isTrue(createTestInfoStub.calledOnceWithExactly(testNodeId, testName));
    });

    test('Should add test case node to the map', () => {
        const expTestCaseMap = new Map<string, ITestCaseNode>();
        expTestCaseMap.set(testNodeId, stubTestCaseNode);
        assert.deepEqual(testCasesMap, expTestCaseMap);
    });
}
