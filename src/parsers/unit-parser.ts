'use strict';

import { TestSuiteInfo, TestInfo } from 'vscode-test-adapter-api';
import { createEmptyTestSuiteNode, createTestCaseNode, createTestInfo, createTestSuiteInfo } from '../utils';
import { ILoadedTestsResult } from '../interfaces/loaded-tests-result';
import { ITestSuiteNode } from '../interfaces/test-suite-node';
import { ITestCaseNode } from '../interfaces/test-case-node';
import { ICargoPackage } from '../interfaces/cargo-package';
import { ICargoTestListResult } from '../interfaces/cargo-test-list-result';
import { INodeTarget } from '../interfaces/node-target';
import { NodeCategory } from '../enums/node-category';

const updateTestTree = (
    testNode: TestInfo,
    packageRootNode: TestSuiteInfo,
    modulePathParts: string[],
    testModulesMap: Map<string, ITestSuiteNode>,
    associatedPackage: ICargoPackage,
    nodeTarget: INodeTarget
) => {
    let currentNode = packageRootNode;
    let testSpecName = '';
    // This is easier to grok inline than it would be if it were split across multiple functions
    // eslint-disable-next-line max-statements
    modulePathParts.forEach(part => {
        testSpecName += `${part}::`;
        const parentNodeId = currentNode.id;
        const currentNodeId = `${parentNodeId}::${part}`;
        let suiteNode = testModulesMap.get(currentNodeId);
        let suiteInfo: TestSuiteInfo = <TestSuiteInfo>currentNode.children.find(c => c.id === currentNodeId);
        if (!suiteNode) {
            suiteNode = createEmptyTestSuiteNode(currentNodeId, associatedPackage, false, NodeCategory.unit, testSpecName);
            suiteNode.targets.push(nodeTarget);
            suiteInfo = createTestSuiteInfo(currentNodeId, part);
            testModulesMap.set(currentNodeId, suiteNode);
            if (!currentNode.children.some(c => c.id === currentNodeId)) {
                currentNode.children.push(suiteInfo);
            }
        }
        currentNode = suiteInfo;
    });
    currentNode.children.push(testNode);
};

const initializeTestNode = (
    trimmedModulePathParts: string,
    testName: string,
    nodeIdPrefix: string,
    cargoPackage: ICargoPackage,
    testCasesMap: Map<string, ITestCaseNode>,
    nodeTarget: INodeTarget
) => {
    const testNodeId = `${nodeIdPrefix}::${trimmedModulePathParts}`;
    const testNode = createTestCaseNode(testNodeId, cargoPackage.name, nodeTarget, nodeIdPrefix, trimmedModulePathParts);
    const testInfo = createTestInfo(testNodeId, testName);
    testCasesMap.set(testNodeId, testNode);
    return testInfo;
};

const parseCargoTestListOutput = (
    cargoTestListResult: ICargoTestListResult,
    nodeIdPrefix: string,
    cargoPackage: ICargoPackage,
    testCasesMap: Map<string, ITestCaseNode>,
    packageSuiteInfo: TestSuiteInfo,
    testSuitesMap: Map<string, ITestSuiteNode>
) => {
    const testsOutput = cargoTestListResult.output.split('\n\n')[0];
    testsOutput.split('\n').forEach(testLine => {
        const trimmedModulePathParts = testLine.split(': test')[0];
        const modulePathParts = trimmedModulePathParts.split('::');
        const testName = modulePathParts.pop();
        const testNode = initializeTestNode(trimmedModulePathParts, testName, nodeIdPrefix, cargoPackage, testCasesMap, cargoTestListResult.nodeTarget);
        updateTestTree(testNode, packageSuiteInfo, modulePathParts, testSuitesMap, cargoPackage, cargoTestListResult.nodeTarget);
    });
};

const parseCargoTestListResult = (
    cargoTestListResult: ICargoTestListResult,
    packageName: string,
    cargoPackage: ICargoPackage,
    packageRootNode: ITestSuiteNode,
    testSuitesMap: Map<string, ITestSuiteNode>,
    packageSuiteInfo: TestSuiteInfo,
    testCasesMap: Map<string, ITestCaseNode>
) => {
    const target = cargoTestListResult.nodeTarget;
    const targetName = target.targetName;
    const targetType = target.targetType;
    const targetNodeId = `${packageName}::${targetName}::${targetType}`;
    const targetRootNode = createEmptyTestSuiteNode(targetNodeId, cargoPackage);
    packageRootNode.childrenNodeIds.push(targetNodeId);
    packageRootNode.targets.push(target);
    targetRootNode.targets.push(target);
    testSuitesMap.set(targetNodeId, targetRootNode);
    const targetSuiteInfo = createTestSuiteInfo(targetNodeId, targetName);
    packageSuiteInfo.children.push(targetSuiteInfo);
    parseCargoTestListOutput(cargoTestListResult, targetNodeId, cargoPackage, testCasesMap, targetSuiteInfo, testSuitesMap);
};

export const parseCargoTestListResults = (cargoPackage: ICargoPackage, cargoTestListResults: ICargoTestListResult[]): ILoadedTestsResult => {
    if (!cargoTestListResults || cargoTestListResults.length === 0) {
        return undefined;
    }
    const packageName = cargoPackage.name;
    const packageRootNode = createEmptyTestSuiteNode(packageName, cargoPackage);
    const packageSuiteInfo = createTestSuiteInfo(packageName, packageName);
    const testSuitesMap: Map<string, ITestSuiteNode> = new Map<string, ITestSuiteNode>();
    testSuitesMap.set(packageName, packageRootNode);
    const testCasesMap: Map<string, ITestCaseNode> = new Map<string, ITestCaseNode>();

    cargoTestListResults.forEach(cargoTestListResult => {
        if (!cargoTestListResult || cargoTestListResult.output.indexOf('0 tests,') === 0) {
            return;
        }
        parseCargoTestListResult(cargoTestListResult, packageName, cargoPackage, packageRootNode, testSuitesMap, packageSuiteInfo, testCasesMap);
    });

    if (packageSuiteInfo.children.length === 1) {
        packageSuiteInfo.children = (<TestSuiteInfo>packageSuiteInfo.children[0]).children;
    }

    return <ILoadedTestsResult> {
        rootTestSuite: packageSuiteInfo,
        testCasesMap,
        testSuitesMap
    };
};
