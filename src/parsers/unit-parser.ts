'use strict';

import { TestSuiteInfo, TestInfo } from 'vscode-test-adapter-api';
import { createEmptyTestSuiteNode, createTestCaseNode, createTestInfo, createTestSuiteInfo } from '../utils';
import { ILoadedTestsResult } from '../interfaces/loaded-tests-result';
import { ITestSuiteNode } from '../interfaces/test-suite-node';
import { ITestCaseNode } from '../interfaces/test-case-node';
import { ICargoPackage } from '../interfaces/cargo-package';

const updateTestTree = (
    testNode: TestInfo,
    packageRootNode: TestSuiteInfo,
    modulePathParts: string[],
    testModulesMap: Map<string, ITestSuiteNode>,
    associatedPackage: ICargoPackage
) => {
    let currentNode = packageRootNode;
    modulePathParts.forEach(part => {
        const parentNodeId = currentNode.id;
        const currentNodeId = `${parentNodeId}::${part}`;
        let suiteNode = testModulesMap.get(currentNodeId);
        let suiteInfo: TestSuiteInfo = <TestSuiteInfo>currentNode.children.find(c => c.id === currentNodeId);
        if (!suiteNode) {
            suiteNode = createEmptyTestSuiteNode(currentNodeId, part, associatedPackage);
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

const initializeTestNode = (packageName: string, trimmedModulePathParts: string, testName: string, cargoPackage: ICargoPackage, testCasesMap: Map<string, ITestCaseNode>) => {
    const testNodeId = `${packageName}::${trimmedModulePathParts}`;
    const testNode = createTestCaseNode(testNodeId, cargoPackage);
    const testInfo = createTestInfo(testNodeId, testName);
    testCasesMap.set(testNodeId, testNode);
    return testInfo;
};

const parseCargoTestListOutput = (
    cargoOutput: string,
    packageName: string,
    cargoPackage: ICargoPackage,
    testCasesMap: Map<string, ITestCaseNode>,
    packageSuiteInfo: TestSuiteInfo,
    testSuitesMap: Map<string, ITestSuiteNode>
) => {
    const testsOutput = cargoOutput.split('\n\n')[0];
    testsOutput.split('\n').forEach(testLine => {
        const trimmedModulePathParts = testLine.split(': test')[0];
        const modulePathParts = trimmedModulePathParts.split('::');
        const testName = modulePathParts.pop();
        const testNode = initializeTestNode(packageName, trimmedModulePathParts, testName, cargoPackage, testCasesMap);
        updateTestTree(testNode, packageSuiteInfo, modulePathParts, testSuitesMap, cargoPackage);
    });
};

export const parseCargoTestListOutputs = (cargoPackage: ICargoPackage, cargoOutputs: string[]): ILoadedTestsResult => {
    if (!cargoOutputs || cargoOutputs.length === 0) {
        return undefined;
    }
    const packageName = cargoPackage.name;
    const packageRootNode = createEmptyTestSuiteNode(packageName, packageName, cargoPackage);
    const packageSuiteInfo = createTestSuiteInfo(packageName, packageName);
    const testSuitesMap: Map<string, ITestSuiteNode> = new Map<string, ITestSuiteNode>();
    testSuitesMap.set(packageName, packageRootNode);
    const testCasesMap: Map<string, ITestCaseNode> = new Map<string, ITestCaseNode>();

    cargoOutputs.forEach(cargoOutput => {
        if (!cargoOutput || cargoOutput.indexOf('0 tests,') === 0) {
            return;
        }

        parseCargoTestListOutput(cargoOutput, packageName, cargoPackage, testCasesMap, packageSuiteInfo, testSuitesMap);
    });

    return <ILoadedTestsResult> {
        rootTestSuite: packageSuiteInfo,
        testCasesMap,
        testSuitesMap
    };
};
