'use strict';

import { createEmptyTestSuiteNode, createTestInfoNode } from '../utils';
import { ILoadedTestsResult } from '../interfaces/loaded-tests-result';
import { ITestSuiteNode } from '../interfaces/test-suite-node';
import { ITestCaseNode } from '../interfaces/test-case-node';
import { ICargoPackage } from '../interfaces/cargo-package';

const updateTestTree = (
    testNode: ITestCaseNode,
    packageRootNode: ITestSuiteNode,
    modulePathParts: string[],
    testModulesMap: Map<string, ITestSuiteNode>,
    associatedPackage: ICargoPackage
) => {
    let currentNode = packageRootNode;
    modulePathParts.forEach(part => {
        const parentNodeId = currentNode.id;
        const currentNodeId = `${parentNodeId}::${part}`;
        let suiteNode = testModulesMap.get(currentNodeId);
        if (!suiteNode) {
            suiteNode = createEmptyTestSuiteNode(currentNodeId, part, associatedPackage);
            testModulesMap.set(currentNodeId, suiteNode);
            if (!currentNode.children.some(c => c.id === 'currentNodeId')) {
                currentNode.children.push(suiteNode);
            }
        }
        currentNode = suiteNode;
    });
    currentNode.children.push(testNode);
};

const initializeTestNode = (packageName: string, trimmedModulePathParts: string, testName: string, cargoPackage: ICargoPackage, testCasesMap: Map<string, ITestCaseNode>) => {
    const testNodeId = `${packageName}::${trimmedModulePathParts}`;
    const testNode = createTestInfoNode(testNodeId, testName, cargoPackage);
    testCasesMap.set(testNodeId, testNode);
    return testNode;
};

export const parseCargoTestListOutput = (cargoPackage: ICargoPackage, cargoOutput: string): ILoadedTestsResult => {
    if (cargoOutput.indexOf('0 tests,') === 0) {
        return undefined;
    }
    const packageName = cargoPackage.name;
    const packageRootNode = createEmptyTestSuiteNode(packageName, packageName, cargoPackage);
    const testSuitesMap: Map<string, ITestSuiteNode> = new Map<string, ITestSuiteNode>();
    testSuitesMap.set(packageName, packageRootNode);
    const testCasesMap: Map<string, ITestCaseNode> = new Map<string, ITestCaseNode>();
    const testsOutput = cargoOutput.split('\n\n')[0];
    testsOutput.split('\n').forEach(testLine => {
        const trimmedModulePathParts = testLine.split(': test')[0];
        const modulePathParts = trimmedModulePathParts.split('::');
        const testName = modulePathParts.pop();
        const testNode = initializeTestNode(packageName, trimmedModulePathParts, testName, cargoPackage, testCasesMap);
        updateTestTree(
            testNode,
            packageRootNode,
            modulePathParts,
            testSuitesMap,
            cargoPackage
        );
    });

    return <ILoadedTestsResult> {
        rootTestSuite: packageRootNode,
        testCasesMap,
        testSuitesMap
    };
};
