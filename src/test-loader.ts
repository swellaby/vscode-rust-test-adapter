'use strict';

import { Log } from 'vscode-test-adapter-util';
import { TestSuiteInfo } from 'vscode-test-adapter-api';

import { getCargoMetadata, getCargoUnitTestListForPackage } from './cargo';
import { ILoadedTestsResult } from './interfaces/loaded-tests-result';
import { ICargoPackage } from './interfaces/cargo-package';
import { parseCargoTestListResults } from './parsers/unit-parser';
import { createEmptyTestSuiteNode, createTestSuiteInfo } from './utils';
import { ITestSuiteNode } from './interfaces/test-suite-node';
import { ITestCaseNode } from './interfaces/test-case-node';
import { NodeCategory } from './enums/node-category';
import { IConfiguration } from './interfaces/configuration';

interface IRootNodeInfo { testSuiteInfo: TestSuiteInfo; testSuiteNode: ITestSuiteNode; }
interface ITestTypeLoadedTestsResult {
    results: ILoadedTestsResult[];
    rootNode: TestSuiteInfo;
    testSuiteNode: ITestSuiteNode;
}

export const buildRootTestSuiteInfoNode = (
    testSuiteNodes: TestSuiteInfo[],
    rootNodeId: string,
    rootNodeLabel: string
): IRootNodeInfo => {
    const rootTestSuiteNode = createEmptyTestSuiteNode(rootNodeId, null, true, NodeCategory.structural);
    const rootTestInfo = createTestSuiteInfo(rootNodeId, rootNodeLabel);
    rootTestInfo.children = testSuiteNodes.length === 1
        ? testSuiteNodes[0].children
        : rootTestInfo.children = testSuiteNodes;

    rootTestSuiteNode.childrenNodeIds = rootTestInfo.children.map(c => c.id);
    return { testSuiteInfo: rootTestInfo, testSuiteNode: rootTestSuiteNode };
};

export const loadPackageUnitTestTree = async (cargoPackage: ICargoPackage, log: Log) => new Promise<ILoadedTestsResult>(async (resolve, reject) => {
    try {
        const cargoTestListResults = await getCargoUnitTestListForPackage(cargoPackage, log);
        resolve(parseCargoTestListResults(cargoPackage, cargoTestListResults));
    } catch (err) {
        reject(err);
    }
});

export const loadTestsForPackages = async (
    packages: ICargoPackage[],
    log: Log,
    loadTestTypeTreeForPackage: (cargoPackage: ICargoPackage, log: Log) => Promise<ILoadedTestsResult>
): Promise<ILoadedTestsResult[]> => {
    const packageTests = await Promise.all(packages.map(async p => {
        const packageTestResult = await loadTestTypeTreeForPackage(p, log);
        if (!packageTestResult) {
            return undefined;
        }
        return packageTestResult;
    }));
    return packageTests.filter(Boolean);
};

export const loadUnitTests = async (
    packages: ICargoPackage[],
    log: Log
): Promise<ITestTypeLoadedTestsResult> => {
    const results = await loadTestsForPackages(packages, log, loadPackageUnitTestTree);
    if (results.length === 0) {
        return null;
    }
    const { testSuiteInfo: rootNode, testSuiteNode } = buildRootTestSuiteInfoNode(results.map(r => r.rootTestSuite), 'unit', 'unit');
    return { rootNode, results, testSuiteNode };
};

export const loadDocumentationTests = async (
    _packages: ICargoPackage[],
    _log: Log
): Promise<ILoadedTestsResult> => {
    return Promise.reject(new Error('Not yet implemented.'));
};

export const loadIntegrationTests = async (
    _packages: ICargoPackage[],
    _log: Log
): Promise<ILoadedTestsResult> => {
    return Promise.reject(new Error('Not yet implemented.'));
};

export const buildWorkspaceLoadedTestsResult = (workspaceTestResults: ITestTypeLoadedTestsResult[]): ILoadedTestsResult => {
    if (!workspaceTestResults || workspaceTestResults.length === 0) {
        return null;
    }
    const loadedTestsResults = workspaceTestResults.filter(Boolean);
    if (loadedTestsResults.length === 0) {
        return null;
    }
    let testSuitesMap = new Map<string, ITestSuiteNode>();
    const testSuitesMapIterators: [string, ITestSuiteNode][] = [];
    const testCasesMapIterators: [string, ITestCaseNode][] = [];
    const rootTestInfoNodes: TestSuiteInfo[] = [];
    loadedTestsResults.forEach(result => {
        rootTestInfoNodes.push(result.rootNode);
        testSuitesMap.set(result.testSuiteNode.id, result.testSuiteNode);
        result.results.map(r => {
            testSuitesMapIterators.push(...r.testSuitesMap);
            testCasesMapIterators.push(...r.testCasesMap);
        });
    });
    testSuitesMap = new Map<string, ITestSuiteNode>([...testSuitesMap, ...testSuitesMapIterators]);
    const testCasesMap = new Map<string, ITestCaseNode>(testCasesMapIterators);
    const { testSuiteInfo, testSuiteNode } = buildRootTestSuiteInfoNode(rootTestInfoNodes, 'root', 'rust');
    testSuitesMap.set(testSuiteNode.id, testSuiteNode);
    return { rootTestSuite: testSuiteInfo, testSuitesMap, testCasesMap };
};

// eslint-disable-next-line max-statements
export const loadWorkspaceTests = async (
    workspaceRoot: string,
    log: Log,
    config: IConfiguration
): Promise<ILoadedTestsResult> => {
    try {
        const packages = (await getCargoMetadata(workspaceRoot, log)).packages;
        if (packages.length === 0) {
            return Promise.resolve(null);
        }
        const promises = [];
        if (config.loadUnitTests) {
            promises.push(loadUnitTests(packages, log));
        }
        if (config.loadDocumentationTests) {
            promises.push(loadDocumentationTests(packages, log));
        }
        if (config.loadIntegrationTests) {
            promises.push(loadIntegrationTests(packages, log));
        }
        const workspaceTestResults: ITestTypeLoadedTestsResult[] = await Promise.all(promises);
        return buildWorkspaceLoadedTestsResult(workspaceTestResults);
    } catch (err) {
        return Promise.reject(err);
    }
};
