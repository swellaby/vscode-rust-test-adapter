'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import * as testListParser from '../../../../src/parsers/test-list-parser';
import { cargoTestListResults, cargoPackages } from '../../../test-utils';
import { ITestSuiteNode } from '../../../../src/interfaces/test-suite-node';
import { NodeCategory } from '../../../../src/enums/node-category';
import { TestSuiteInfo, TestInfo } from 'vscode-test-adapter-api';
import { ILoadedTestsResult } from '../../../../src/interfaces/loaded-tests-result';
import { ICargoTestListResult } from '../../../../src/interfaces/cargo-test-list-result';
import { ITestCaseNode } from '../../../../src/interfaces/test-case-node';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let createEmptyTestSuiteNodeStub: Sinon.SinonStub;
    let createTestSuiteInfoStub: Sinon.SinonStub;
    let parseCargoTestListResultStub: Sinon.SinonStub;
    const { parseCargoTestListResults } = testListParser;
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
    const stubTestSuiteInfo = <TestSuiteInfo> {
        id: packageName,
        label: packageName,
        type: 'suite',
        children: []
    };

    setup(function () {
        createEmptyTestSuiteNodeStub = this.test.ctx.createEmptyTestSuiteNodeStub;
        createEmptyTestSuiteNodeStub.callsFake(() => stubTestSuiteNode);
        createTestSuiteInfoStub = this.test.ctx.createTestSuiteInfoStub;
        createTestSuiteInfoStub.callsFake(() => stubTestSuiteInfo);
        parseCargoTestListResultStub = Sinon.stub(testListParser, 'parseCargoTestListResult');
    });

    test('Should return undefined with null package and null test results', () => {
        assert.isUndefined(parseCargoTestListResults(null, null));
    });

    test('Should return undefined with null package and undefined test results', () => {
        assert.isUndefined(parseCargoTestListResults(null, undefined));
    });

    test('Should return undefined with null package and empty test results', () => {
        assert.isUndefined(parseCargoTestListResults(null, []));
    });

    test('Should return undefined with null package and valid test results', () => {
        assert.isUndefined(parseCargoTestListResults(null, cargoTestListResults));
    });

    test('Should return undefined with undefined package and null test results', () => {
        assert.isUndefined(parseCargoTestListResults(undefined, null));
    });

    test('Should return undefined with undefined package and undefined test results', () => {
        assert.isUndefined(parseCargoTestListResults(undefined, undefined));
    });

    test('Should return undefined with undefined package and empty test results', () => {
        assert.isUndefined(parseCargoTestListResults(undefined, []));
    });

    test('Should return undefined with undefined package and valid test results', () => {
        assert.isUndefined(parseCargoTestListResults(undefined, cargoTestListResults));
    });

    test('Should return undefined with valid package and null test results', () => {
        assert.isUndefined(parseCargoTestListResults(swansonLibPackage, null));
    });

    test('Should return undefined with valid package and undefined test results', () => {
        assert.isUndefined(parseCargoTestListResults(swansonLibPackage, undefined));
    });

    test('Should return undefined with valid package and empty test results', () => {
        assert.isUndefined(parseCargoTestListResults(swansonLibPackage, []));
    });

    test('Should return undefined with valid package and empty test results', () => {
        assert.isUndefined(parseCargoTestListResults(swansonLibPackage, []));
    });

    test('Should return correct result when test results has no discovered tests', () => {
        const noDiscoveredTests = [
            undefined,
            <ICargoTestListResult> {
                output: '0 tests,'
            }
        ];
        const loadedTestsResult: ILoadedTestsResult = parseCargoTestListResults(swansonLibPackage, noDiscoveredTests);
        const testSuitesMap = new Map<string, ITestSuiteNode>();
        testSuitesMap.set(packageName, stubTestSuiteNode);
        assert.deepEqual(loadedTestsResult, <ILoadedTestsResult> {
            rootTestSuite: stubTestSuiteInfo,
            testCasesMap: new Map<string, ITestCaseNode>(),
            testSuitesMap
        });
    });

    test('Should pass correct args to parseCargoTestListResult with valid package and discovered tests', () => {
        const testSuitesMap = new Map<string, ITestSuiteNode>();
        testSuitesMap.set(packageName, stubTestSuiteNode);
        const testCasesMap = new Map<string, ITestCaseNode>();
        parseCargoTestListResults(swansonLibPackage, cargoTestListResults);
        const commonCallArgs = [
            packageName,
            swansonLibPackage,
            stubTestSuiteNode,
            testSuitesMap,
            stubTestSuiteInfo,
            testCasesMap
        ];
        assert.isTrue(parseCargoTestListResultStub.calledWithExactly(
            cargoTestListResults[0],
            ...commonCallArgs
        ));
        assert.isTrue(parseCargoTestListResultStub.calledWithExactly(
            cargoTestListResults[1],
            ...commonCallArgs
        ));
        assert.deepEqual(parseCargoTestListResultStub.callCount, 2);
    });

    test('Should flatten root node children when there is only a single child', () => {
        const suiteInfo: TestSuiteInfo = JSON.parse(JSON.stringify(stubTestSuiteInfo));
        const childSuiteInfo: TestSuiteInfo = <TestSuiteInfo> {
            id: 'fooBar',
            label: 'fooBar',
            type: 'suite',
            children: [
                <TestInfo> {
                    id: 'foo',
                    type: 'test'
                },
                <TestInfo> {
                    id: 'bar',
                    type: 'test'
                }
            ]
        };
        suiteInfo.children.push(childSuiteInfo);
        const expSuiteInfo: TestSuiteInfo = JSON.parse(JSON.stringify(suiteInfo));
        expSuiteInfo.children = childSuiteInfo.children;
        createTestSuiteInfoStub.callsFake(() => suiteInfo);
        const loadedTestsResult: ILoadedTestsResult = parseCargoTestListResults(swansonLibPackage, cargoTestListResults);
        const testSuitesMap = new Map<string, ITestSuiteNode>();
        testSuitesMap.set(packageName, stubTestSuiteNode);
        assert.deepEqual(loadedTestsResult, <ILoadedTestsResult> {
            rootTestSuite: expSuiteInfo,
            testCasesMap: new Map<string, ITestCaseNode>(),
            testSuitesMap
        });
    });
}
