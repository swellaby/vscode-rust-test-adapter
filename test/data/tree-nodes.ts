'use strict';

import { TestSuiteInfo } from 'vscode-test-adapter-api';
import { ILoadedTestsResult } from '../../src/interfaces/loaded-tests-result';
import { ITestSuiteNode } from '../../src/interfaces/test-suite-node';
import { ITestCaseNode } from '../../src/interfaces/test-case-node';
import { INodeTarget } from '../../src/interfaces/node-target';
import { TargetType } from '../../src/enums/target-type';

export const packageName = 'rust-test-sample';

const binTarget: INodeTarget = {
    targetType: TargetType.bin,
    targetName: packageName
};

const testCase1 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::bin::fail',
    packageName,
    nodeTarget: binTarget,
    testSpecName: 'fail',
    nodeIdPrefix: 'rust-test-sample::rust-test-sample::bin'
};

const testCase2 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::bin::foo::bar_second',
    packageName,
    nodeTarget: binTarget,
    testSpecName: 'foo::bar_second',
    nodeIdPrefix: 'rust-test-sample::rust-test-sample::bin'
};

const testCase3 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::bin::foo::foo_tests::foo_works',
    packageName,
    nodeTarget: binTarget,
    testSpecName: 'foo::foo_tests::foo_works',
    nodeIdPrefix: 'rust-test-sample::rust-test-sample::bin'
};

const testCase4 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::bin::pass',
    packageName,
    nodeTarget: binTarget,
    testSpecName: 'pass',
    nodeIdPrefix: 'rust-test-sample::rust-test-sample::bin'
};

const testCase5 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::bin::tests::it_works',
    packageName,
    nodeTarget: binTarget,
    testSpecName: 'tests::it_works',
    nodeIdPrefix: 'rust-test-sample::rust-test-sample::bin'
};

export const testCases = {
    testCase1,
    testCase2,
    testCase3,
    testCase4,
    testCase5
};

export const testCasesMapStub: Map<string, ITestCaseNode> = new Map<string, ITestCaseNode>([
    [ testCase1.id, testCase1 ],
    [ testCase2.id, testCase2 ],
    [ testCase3.id, testCase3 ],
    [ testCase4.id, testCase4 ],
    [ testCase5.id, testCase5 ]
]);

const testSuite1 = <ITestSuiteNode>{
    id: 'rust-test-sample',
    testSpecName: '',
    childrenNodeIds: [
        'rust-test-sample::rust-test-sample::bin'
    ],
    packageName,
    isStructuralNode: false,
    category: 'unit',
    targets: [ binTarget ]
};

const testSuite2 = <ITestSuiteNode>{
    id: 'rust-test-sample::rust-test-sample::bin',
    testSpecName: '',
    childrenNodeIds: [],
    packageName,
    isStructuralNode: false,
    category: 'unit',
    targets: [ binTarget ]
};

const testSuite3 = <ITestSuiteNode>{
    id: 'rust-test-sample::rust-test-sample::bin::foo',
    testSpecName: 'foo::',
    childrenNodeIds: [],
    packageName,
    isStructuralNode: false,
    category: 'unit',
    targets: [ binTarget ]
};

const testSuite4 = <ITestSuiteNode>{
    id: 'rust-test-sample::rust-test-sample::bin::foo::foo_tests',
    testSpecName: 'foo::foo_tests::',
    childrenNodeIds: [],
    packageName,
    isStructuralNode: false,
    category: 'unit',
    targets: [ binTarget ]
};

const testSuite5 = <ITestSuiteNode>{
    id: 'rust-test-sample::rust-test-sample::bin::tests',
    testSpecName: 'tests::',
    childrenNodeIds: [],
    packageName,
    isStructuralNode: false,
    category: 'unit',
    targets: [ binTarget ]
};

const rootTestSuite = <ITestSuiteNode>{
    id: 'root',
    testSpecName: '',
    childrenNodeIds: [
        testCase1.id,
        testSuite3.id,
        testCase4.id,
        testSuite5.id
    ],
    isStructuralNode: true,
    category: 'structural',
    targets: []
};

export const testSuites = {
    testSuite1,
    testSuite2,
    testSuite3,
    testSuite4,
    testSuite5,
    rootTestSuite
};

export const testSuitesMapStub: Map<string, ITestSuiteNode> = new Map<string, ITestSuiteNode>([
    [ testSuite1.id, testSuite1 ],
    [ testSuite2.id, testSuite2 ],
    [ testSuite3.id, testSuite3 ],
    [ testSuite4.id, testSuite4 ],
    [ testSuite5.id, testSuite5 ],
    [ rootTestSuite.id, rootTestSuite ]
]);

const rootTestSuiteInfo = <TestSuiteInfo>{
    id: rootTestSuite.id,
    label: 'rust',
    type: 'suite',
    children: [
        {
            id: testCase1.id,
            label: testCase1.testSpecName,
            type: 'test'
        },
        {
            id: testSuite3.id,
            label: 'foo',
            type: 'suite',
            children: [
                {
                    id: testCase2.id,
                    label: 'bar_second',
                    type: 'test'
                },
                {
                    id: testSuite4.id,
                    label: 'foo_tests',
                    type: 'suite',
                    children: [
                        {
                            id: testCase3.id,
                            label: 'foo_works',
                            type: 'test'
                        }
                    ]
                }
            ]
        },
        {
            id: testCase4.id,
            label: 'pass',
            type: 'test'
        },
        {
            id: testSuite5.id,
            label: 'tests',
            type: 'suite',
            children: [
                {
                    id: testCase5.id,
                    label: 'it_works',
                    type: 'test'
                }
            ]
        }
    ]
};

export const loadedTestsResultStub = <ILoadedTestsResult>{
    rootTestSuite: rootTestSuiteInfo,
    testCasesMap: testCasesMapStub,
    testSuitesMap: testSuitesMapStub
};

const unitTestSuiteInfo = <ITestSuiteNode>{
    id: 'Unit Tests',
    testSpecName: '',
    childrenNodeIds: rootTestSuite.childrenNodeIds,
    isStructuralNode: true,
    category: 'structural',
    targets: []
};

const structuralNodesRootTestSuite: ITestSuiteNode = JSON.parse(JSON.stringify(rootTestSuite));
structuralNodesRootTestSuite.childrenNodeIds = [unitTestSuiteInfo.id];
const structuralNodesSuitesMap = new Map(testSuitesMapStub);
structuralNodesSuitesMap.set(unitTestSuiteInfo.id, unitTestSuiteInfo);
structuralNodesSuitesMap.set(rootTestSuite.id, structuralNodesRootTestSuite);
const structuralNodeRootTestSuiteInfo = <TestSuiteInfo>{
    id: rootTestSuite.id,
    label: 'rust',
    type: 'suite',
    children: [
        {
            id: unitTestSuiteInfo.id,
            label: unitTestSuiteInfo.testSpecName,
            type: 'suite',
            children: JSON.parse(JSON.stringify(rootTestSuiteInfo.children))
        }
    ]
};

export const structuralNodesLoadedTestsResultStub = <ILoadedTestsResult>{
    rootTestSuite: structuralNodeRootTestSuiteInfo,
    testCasesMap: testCasesMapStub,
    testSuitesMap: structuralNodesSuitesMap
};
