'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import * as testListParser from '../../../../src/parsers/test-list-parser';
import { cargoTestListResults, cargoPackages } from '../../../test-utils';
import { ITestSuiteNode } from '../../../../src/interfaces/test-suite-node';
import { NodeCategory } from '../../../../src/enums/node-category';
import { TestSuiteInfo, TestInfo } from 'vscode-test-adapter-api';
import { ICargoTestListResult } from '../../../../src/interfaces/cargo-test-list-result';
import { ITestCaseNode } from '../../../../src/interfaces/test-case-node';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let initializeTestNodeStub: Sinon.SinonStub;
    let updateTestTreeStub: Sinon.SinonStub;
    const { parseCargoTestListOutput } = testListParser;
    const { swansonLibPackage } = cargoPackages;
    const { name: packageName } = swansonLibPackage;
    const firstCargoTestListResult: ICargoTestListResult = cargoTestListResults[0];
    const secondCargoTestListResult: ICargoTestListResult = cargoTestListResults[1];
    let testSuitesMap: Map<string, ITestSuiteNode>;
    const testCasesMap = new Map<string, ITestCaseNode>();
    const { nodeTarget: firstTarget } = firstCargoTestListResult;
    const { targetName: firstTargetName, targetType: firstTargetType } = firstTarget;
    const firstExpTargetNodeId = `${packageName}::${firstTargetName}::${firstTargetType}`;
    const { nodeTarget: secondTarget } = secondCargoTestListResult;
    const { targetName: secondTargetName, targetType: secondTargetType } = firstTarget;
    const secondExpTargetNodeId = `${packageName}::${secondTargetName}::${secondTargetType}`;
    const stubPackageTestSuiteInfo = <TestSuiteInfo> {
        id: packageName,
        label: packageName,
        type: 'suite',
        children: []
    };
    const stubTestInfo = <TestInfo> {
        id: 'foo',
        type: 'test'
    };

    setup(() => {
        initializeTestNodeStub = Sinon.stub(testListParser, 'initializeTestNode').callsFake(() => stubTestInfo);
        updateTestTreeStub = Sinon.stub(testListParser, 'updateTestTree');
        testSuitesMap = new Map<string, ITestSuiteNode>();
    });

    test('Should correctly handle single test', () => {
        parseCargoTestListOutput(firstCargoTestListResult, firstExpTargetNodeId, swansonLibPackage, testCasesMap, stubPackageTestSuiteInfo, testSuitesMap);
        assert.deepEqual(initializeTestNodeStub.callCount, 1);
        assert.deepEqual(updateTestTreeStub.callCount, 1);
        const expInitializeTestNodeStubArgs = [
            'tests::test_subtract',
            'test_subtract',
            firstExpTargetNodeId,
            swansonLibPackage,
            testCasesMap,
            firstTarget
        ];
        assert.isTrue(initializeTestNodeStub.calledOnceWithExactly(...expInitializeTestNodeStubArgs));
        assert.isTrue(updateTestTreeStub.calledOnceWithExactly(stubTestInfo, stubPackageTestSuiteInfo, [ 'tests', 'test_subtract' ], testSuitesMap, firstTarget));
    });

    test('Should correctly handle multiple tests', () => {
        parseCargoTestListOutput(secondCargoTestListResult, secondExpTargetNodeId, swansonLibPackage, testCasesMap, stubPackageTestSuiteInfo, testSuitesMap);
        assert.deepEqual(initializeTestNodeStub.callCount, 2);
        assert.deepEqual(updateTestTreeStub.callCount, 2);
        assert.isTrue(initializeTestNodeStub.calledWithExactly('tests::test_add', 'test_add', secondExpTargetNodeId, swansonLibPackage, testCasesMap, secondTarget));
        assert.isTrue(initializeTestNodeStub.calledWithExactly('tests::test_bad_add', 'test_bad_add', secondExpTargetNodeId, swansonLibPackage, testCasesMap, secondTarget));
        assert.isTrue(updateTestTreeStub.calledWithExactly(stubTestInfo, stubPackageTestSuiteInfo, [ 'tests', 'test_add' ], testSuitesMap, secondTarget));
        assert.isTrue(updateTestTreeStub.calledWithExactly(stubTestInfo, stubPackageTestSuiteInfo, [ 'tests', 'test_bad_add' ], testSuitesMap, secondTarget));
    });
}
