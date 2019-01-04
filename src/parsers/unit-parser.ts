'use strict';

import { TestSuiteInfo } from 'vscode-test-adapter-api';

import {
    createEmptyTestSuiteNode,
    createTestInfoNode
} from '../utils';
import { ILoadedTestsResult } from '../interfaces/loaded-tests-result';
import { ITestSuiteNode } from '../interfaces/test-suite-node';
import { ITestCaseNode } from '../interfaces/test-case-node';
import { ICargoPackage } from '../interfaces/cargo-package';

// const updateOwnedTestCaseIdMap = (ownedTestCaseIdsMap: Map<string, string[]>, parentNodeId: string, testNodeId: string) => {
//     let mappedTestCaseIds = ownedTestCaseIdsMap.get(parentNodeId);
//     if (!mappedTestCaseIds) {
//         mappedTestCaseIds = [];
//         ownedTestCaseIdsMap.set(parentNodeId, mappedTestCaseIds);
//     }
//     mappedTestCaseIds.push(testNodeId);
// };

// tslint:disable-next-line:max-func-length
const updateTestTree = (
    testNode: ITestCaseNode,
    packageRootNode: ITestSuiteNode,
    modulePathParts: string[],
    testModulesMap: Map<string, ITestSuiteNode>,
    associatedPackage: ICargoPackage
) => {
    let currentNode = packageRootNode;
    // util::dependency_queue::test::deep_first
    // testNodeId = cargo::util::dependency_queue::test::deep_first
    // currentNode = cargo
    modulePathParts.forEach(part => {
        const parentNodeId = currentNode.id;
        // parentNodeId = cargo
        const currentNodeId = `${parentNodeId}::${part}`;
        // currentNodeId = cargo::util
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

// tslint:disable-next-line:max-func-body-length
export const parseCargoTestListOutput = (cargoPackage: ICargoPackage, cargoOutput: string): ILoadedTestsResult => {
    if (cargoOutput.indexOf('0 tests,') === 0) {
        return undefined;
    }
    const packageName = cargoPackage.name;
    const packageRootNode = createEmptyTestSuiteNode(packageName, packageName, cargoPackage);
    packageRootNode.isPackageLevelNode = true;
    packageRootNode.associatedPackage = cargoPackage;
    const testSuitesMap: Map<string, ITestSuiteNode> = new Map<string, ITestSuiteNode>();
    testSuitesMap.set(packageName, packageRootNode);
    const testCasesMap: Map<string, ITestCaseNode> = new Map<string, ITestCaseNode>();
    // const suiteOwnedTestIdsMap: Map<string, string[]> = new Map<string, string[]>();
    const testsOutput = cargoOutput.split('\n\n')[0];
    testsOutput.split('\n').forEach(testLine => {
        const trimmedModulePathParts = testLine.split(': test')[0];
        const modulePathParts = trimmedModulePathParts.split('::');
        const testName = modulePathParts.pop();
        const testNodeId = `${packageName}::${trimmedModulePathParts}`;
        const testNode = createTestInfoNode(testNodeId, testName, cargoPackage);
        testCasesMap.set(testNodeId, testNode);
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
