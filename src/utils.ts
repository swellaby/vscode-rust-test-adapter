'use strict';

import { TestInfo, TestSuiteInfo } from 'vscode-test-adapter-api';

import { ICargoPackage } from './interfaces/cargo-package';
import { ITestCaseNode } from './interfaces/test-case-node';
import { ITestSuiteNode } from './interfaces/test-suite-node';
import { NodeCategory } from './enums/node-category';
import { INodeTarget } from './interfaces/node-target';

export const createEmptyTestSuiteNode = (
    id: string,
    cargoPackage: ICargoPackage,
    isStructuralNode: boolean = false,
    testCategory: NodeCategory = NodeCategory.unit,
    testSpecName: string = ''
): ITestSuiteNode => {
    const packageName = cargoPackage ? cargoPackage.name : undefined;
    return <ITestSuiteNode>{
        id,
        testSpecName,
        childrenNodeIds: [],
        packageName,
        isStructuralNode,
        category: testCategory,
        targets: []
    };
};

export const createTestCaseNode = (id: string, packageName: string, nodeTarget: INodeTarget, testSpecName: string = ''): ITestCaseNode => {
    return <ITestCaseNode>{
        id,
        packageName,
        nodeTarget,
        testSpecName
    };
};

export const createTestSuiteInfo = (id: string, label: string): TestSuiteInfo => {
    return {
        id,
        label,
        type: 'suite',
        children: []
    };
};

export const createTestInfo = (id: string, label: string): TestInfo => {
    return {
        id,
        label,
        type: 'test'
    };
};
