'use strict';

import { TestSuiteInfo } from 'vscode-test-adapter-api';
import { ILoadedTestsResult } from '../../src/interfaces/loaded-tests-result';
import { ITestSuiteNode } from '../../src/interfaces/test-suite-node';
import { ITestCaseNode } from '../../src/interfaces/test-case-node';

const testCase1 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::bin::fail',
    packageName: 'rust-test-sample',
    nodeTarget: {
        targetType: 'bin',
        targetName: 'rust-test-sample'
    },
    testSpecName: 'fail',
    nodeIdPrefix: 'rust-test-sample::rust-test-sample::bin'
};

const testCase2 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::bin::foo::bar_second',
    packageName: 'rust-test-sample',
    nodeTarget: {
        targetType: 'bin',
        targetName: 'rust-test-sample'
    },
    testSpecName: 'foo::bar_second',
    nodeIdPrefix: 'rust-test-sample::rust-test-sample::bin'
};

const testCase3 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::bin::foo::foo_tests::foo_works',
    packageName: 'rust-test-sample',
    nodeTarget: {
        targetType: 'bin',
        targetName: 'rust-test-sample'
    },
    testSpecName: 'foo::foo_tests::foo_works',
    nodeIdPrefix: 'rust-test-sample::rust-test-sample::bin'
};

const testCase4 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::bin::pass',
    packageName: 'rust-test-sample',
    nodeTarget: {
        targetType: 'bin',
        targetName: 'rust-test-sample'
    },
    testSpecName: 'pass',
    nodeIdPrefix: 'rust-test-sample::rust-test-sample::bin'
};

const testCase5 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::bin::tests::it_works',
    packageName: 'rust-test-sample',
    nodeTarget: {
        targetType: 'bin',
        targetName: 'rust-test-sample'
    },
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
    packageName: 'rust-test-sample',
    isStructuralNode: false,
    category: 'unit',
    targets: [
        {
            targetType: 'bin',
            targetName: 'rust-test-sample'
        }
    ]
};

const testSuite2 = <ITestSuiteNode>{
    id: 'rust-test-sample::rust-test-sample::bin',
    testSpecName: '',
    childrenNodeIds: [],
    packageName: 'rust-test-sample',
    isStructuralNode: false,
    category: 'unit',
    targets: [
        {
            targetType: 'bin',
            targetName: 'rust-test-sample'
        }
    ]
};

const testSuite3 = <ITestSuiteNode>{
    id: 'rust-test-sample::rust-test-sample::bin::foo',
    testSpecName: 'foo::',
    childrenNodeIds: [],
    packageName: 'rust-test-sample',
    isStructuralNode: false,
    category: 'unit',
    targets: [
        {
            targetType: 'bin',
            targetName: 'rust-test-sample'
        }
    ]
};

const testSuite4 = <ITestSuiteNode>{
    id: 'rust-test-sample::rust-test-sample::bin::foo::foo_tests',
    testSpecName: 'foo::foo_tests::',
    childrenNodeIds: [],
    packageName: 'rust-test-sample',
    isStructuralNode: false,
    category: 'unit',
    targets: [
        {
            targetType: 'bin',
            targetName: 'rust-test-sample'
        }
    ]
};

const testSuite5 = <ITestSuiteNode>{
    id: 'rust-test-sample::rust-test-sample::bin::tests',
    testSpecName: 'tests::',
    childrenNodeIds: [],
    packageName: 'rust-test-sample',
    isStructuralNode: false,
    category: 'unit',
    targets: [
        {
            targetType: 'bin',
            targetName: 'rust-test-sample'
        }
    ]
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
