'use strict';

import { TestSuiteInfo } from 'vscode-test-adapter-api';
import { ILoadedTestsResult } from '../../src/interfaces/loaded-tests-result';
import { ITestSuiteNode } from '../../src/interfaces/test-suite-node';
import { ITestCaseNode } from '../../src/interfaces/test-case-node';
import { INodeTarget } from '../../src/interfaces/node-target';
import { TargetType } from '../../src/enums/target-type';

export const packageName = 'rust-test-sample';

const libTarget: INodeTarget = {
    targetType: TargetType.lib,
    targetName: packageName
};

const libTestCase1 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::lib::add',
    packageName,
    nodeTarget: libTarget,
    testSpecName: 'add',
    nodeIdPrefix: 'rust-test-sample::rust-test-sample::lib'
};

export const libTestCases = {
    libTestCase1
};

const binTarget: INodeTarget = {
    targetType: TargetType.bin,
    targetName: packageName
};

const binTestCase1 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::bin::fail',
    packageName,
    nodeTarget: binTarget,
    testSpecName: 'fail',
    nodeIdPrefix: 'rust-test-sample::rust-test-sample::bin'
};

const binTestCase2 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::bin::foo::bar_second',
    packageName,
    nodeTarget: binTarget,
    testSpecName: 'foo::bar_second',
    nodeIdPrefix: 'rust-test-sample::rust-test-sample::bin'
};

const binTestCase3 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::bin::foo::foo_tests::foo_works',
    packageName,
    nodeTarget: binTarget,
    testSpecName: 'foo::foo_tests::foo_works',
    nodeIdPrefix: 'rust-test-sample::rust-test-sample::bin'
};

const binTestCase4 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::bin::pass',
    packageName,
    nodeTarget: binTarget,
    testSpecName: 'pass',
    nodeIdPrefix: 'rust-test-sample::rust-test-sample::bin'
};

const binTestCase5 = <ITestCaseNode>{
    id: 'rust-test-sample::rust-test-sample::bin::tests::it_works',
    packageName,
    nodeTarget: binTarget,
    testSpecName: 'tests::it_works',
    nodeIdPrefix: 'rust-test-sample::rust-test-sample::bin'
};

export const binTestCases = {
    binTestCase1,
    binTestCase2,
    binTestCase3,
    binTestCase4,
    binTestCase5
};

export const binTestCasesMapStub: Map<string, ITestCaseNode> = new Map<string, ITestCaseNode>([
    [ binTestCase1.id, binTestCase1 ],
    [ binTestCase2.id, binTestCase2 ],
    [ binTestCase3.id, binTestCase3 ],
    [ binTestCase4.id, binTestCase4 ],
    [ binTestCase5.id, binTestCase5 ]
]);

export const libTestCasesMapStub: Map<string, ITestCaseNode> = new Map<string, ITestCaseNode>([
    [ libTestCase1.id, libTestCase1 ]
]);

const libTestSuite1 = <ITestSuiteNode>{
    id: 'rust-test-sample',
    testSpecName: '',
    childrenNodeIds: [
        'rust-test-sample::rust-test-sample::lib'
    ],
    packageName,
    isStructuralNode: false,
    category: 'unit',
    targets: [ libTarget ]
};

const binTestSuite1 = <ITestSuiteNode>{
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

const binTestSuite2 = <ITestSuiteNode>{
    id: 'rust-test-sample::rust-test-sample::bin',
    testSpecName: '',
    childrenNodeIds: [],
    packageName,
    isStructuralNode: false,
    category: 'unit',
    targets: [ binTarget ]
};

const binTestSuite3 = <ITestSuiteNode>{
    id: 'rust-test-sample::rust-test-sample::bin::foo',
    testSpecName: 'foo::',
    childrenNodeIds: [],
    packageName,
    isStructuralNode: false,
    category: 'unit',
    targets: [ binTarget ]
};

const binTestSuite4 = <ITestSuiteNode>{
    id: 'rust-test-sample::rust-test-sample::bin::foo::foo_tests',
    testSpecName: 'foo::foo_tests::',
    childrenNodeIds: [],
    packageName,
    isStructuralNode: false,
    category: 'unit',
    targets: [ binTarget ]
};

const binTestSuite5 = <ITestSuiteNode>{
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
        binTestCase1.id,
        binTestSuite3.id,
        binTestCase4.id,
        binTestSuite5.id
    ],
    isStructuralNode: true,
    category: 'structural',
    targets: []
};

export const binTestSuites = {
    binTestSuite1,
    binTestSuite2,
    binTestSuite3,
    binTestSuite4,
    binTestSuite5,
    rootTestSuite
};

export const binTestSuitesMapNoRootStub: Map<string, ITestSuiteNode> = new Map<string, ITestSuiteNode>([
    [ binTestSuite1.id, binTestSuite1 ],
    [ binTestSuite2.id, binTestSuite2 ],
    [ binTestSuite3.id, binTestSuite3 ],
    [ binTestSuite4.id, binTestSuite4 ],
    [ binTestSuite5.id, binTestSuite5 ]
]);

export const binTestSuitesMapStub: Map<string, ITestSuiteNode> = new Map<string, ITestSuiteNode>([
    ...binTestSuitesMapNoRootStub,
    [ rootTestSuite.id, rootTestSuite ]
]);

export const libTestSuitesMapNoRootStub: Map<string, ITestSuiteNode> = new Map<string, ITestSuiteNode>([
    [ libTestSuite1.id, libTestSuite1 ]
]);

export const libTestSuitesMapStub: Map<string, ITestSuiteNode> = new Map<string, ITestSuiteNode>([
    ...libTestSuitesMapNoRootStub,
    [ rootTestSuite.id, rootTestSuite ]
]);

export const libRootTestSuiteInfo = <TestSuiteInfo> {
    id: rootTestSuite.id,
    label: 'rust',
    type: 'suite',
    children: [
        {
            id: libTestCase1.id,
            label: libTestCase1.testSpecName,
            type: 'test'
        }
    ]
};

const binRootTestSuiteInfo = <TestSuiteInfo>{
    id: rootTestSuite.id,
    label: 'rust',
    type: 'suite',
    children: [
        {
            id: binTestCase1.id,
            label: binTestCase1.testSpecName,
            type: 'test'
        },
        {
            id: binTestSuite3.id,
            label: 'foo',
            type: 'suite',
            children: [
                {
                    id: binTestCase2.id,
                    label: 'bar_second',
                    type: 'test'
                },
                {
                    id: binTestSuite4.id,
                    label: 'foo_tests',
                    type: 'suite',
                    children: [
                        {
                            id: binTestCase3.id,
                            label: 'foo_works',
                            type: 'test'
                        }
                    ]
                }
            ]
        },
        {
            id: binTestCase4.id,
            label: 'pass',
            type: 'test'
        },
        {
            id: binTestSuite5.id,
            label: 'tests',
            type: 'suite',
            children: [
                {
                    id: binTestCase5.id,
                    label: 'it_works',
                    type: 'test'
                }
            ]
        }
    ]
};

export const binLoadedTestsResultStub = <ILoadedTestsResult>{
    rootTestSuite: binRootTestSuiteInfo,
    testCasesMap: binTestCasesMapStub,
    testSuitesMap: binTestSuitesMapStub
};

export const libLoadedTestsResultStub = <ILoadedTestsResult>{
    rootTestSuite: binRootTestSuiteInfo,
    testCasesMap: libTestCasesMapStub,
    testSuitesMap: libTestSuitesMapStub
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
const structuralNodesSuitesMap = new Map(binTestSuitesMapStub);
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
            children: JSON.parse(JSON.stringify(binRootTestSuiteInfo.children))
        }
    ]
};

export const structuralNodesLoadedTestsResultStub = <ILoadedTestsResult>{
    rootTestSuite: structuralNodeRootTestSuiteInfo,
    testCasesMap: binTestCasesMapStub,
    testSuitesMap: structuralNodesSuitesMap
};
