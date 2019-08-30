'use strict';

import { TestSuiteInfo } from 'vscode-test-adapter-api';

import { getCargoMetadata, getCargoUnitTestListForPackage } from './cargo';
import { ILoadedTestsResult } from './interfaces/loaded-tests-result';
import { Log } from 'vscode-test-adapter-util';
import { ICargoPackage } from './interfaces/cargo-package';
import { parseCargoTestListResults } from './parsers/unit-parser';
import { createEmptyTestSuiteNode, createTestSuiteInfo } from './utils';
import { ITestSuiteNode } from './interfaces/test-suite-node';
import { ITestCaseNode } from './interfaces/test-case-node';
import { TargetType } from './enums/target-type';
import { NodeCategory } from './enums/node-category';
import { ICargoTestListResult } from './interfaces/cargo-test-list-result';

const buildRootTestSuiteInfoNode = (packageTestNodes: ILoadedTestsResult[], testSuitesMap: Map<string, ITestSuiteNode>): TestSuiteInfo => {
    const testSuiteNodes: TestSuiteInfo[] = [];
    packageTestNodes.forEach(packageTestNode => {
        if (packageTestNode && packageTestNode.rootTestSuite) {
            testSuiteNodes.push(packageTestNode.rootTestSuite);
        }
    });

    const rootNodeId = 'root';
    const rootTestSuiteNode = createEmptyTestSuiteNode(rootNodeId, null, true, NodeCategory.structural);
    const rootTestInfo = createTestSuiteInfo(rootNodeId, 'rust');
    rootTestInfo.children = testSuiteNodes.length === 1
        ? testSuiteNodes[0].children
        : rootTestInfo.children = testSuiteNodes;

    rootTestSuiteNode.childrenNodeIds = rootTestInfo.children.map(c => c.id);
    testSuitesMap.set(rootNodeId, rootTestSuiteNode);
    return rootTestInfo;
};

const loadPackageUnitTestTree = async (cargoPackage: ICargoPackage, log: Log) => new Promise<ILoadedTestsResult>(async (resolve, reject) => {
    try {
        const cargoTestListResults = await getCargoUnitTestListForPackage(cargoPackage, log);
        resolve(parseCargoTestListResults(cargoPackage, cargoTestListResults));
    } catch (err) {
        reject(err);
    }
});

export const loadUnitTests = async (workspaceRoot: string, log: Log): Promise<ILoadedTestsResult> => {
    try {
        let testSuitesMap = new Map<string, ITestSuiteNode>();
        let testCasesMap = new Map<string, ITestCaseNode>();
        const packages = (await getCargoMetadata(workspaceRoot, log)).packages;
        if (packages.length === 0) {
            return Promise.resolve(null);
        }
        const packageTests = await Promise.all(packages.map(async p => {
            const packageTestResult = await loadPackageUnitTestTree(p, log);
            if (!packageTestResult) {
                return undefined;
            }
            testSuitesMap = new Map([...testSuitesMap, ...packageTestResult.testSuitesMap]);
            testCasesMap = new Map([...testCasesMap, ...packageTestResult.testCasesMap]);
            return packageTestResult;
        }));
        // This condition will evaluate to true when there are no unit tests.
        if (packageTests.length >= 1 && !packageTests[0]) {
            return Promise.resolve(null);
        }
        const rootNode = buildRootTestSuiteInfoNode(packageTests, testSuitesMap);
        return Promise.resolve({ rootTestSuite: rootNode, testSuitesMap, testCasesMap });
    } catch (err) {
        return Promise.reject(err);
    }
};
