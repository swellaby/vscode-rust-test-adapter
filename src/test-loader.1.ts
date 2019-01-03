'use strict';

import * as childProcess from 'child_process';

import { ICargoMetadata } from './interfaces/cargo-metadata';
import { ILoadedTestsResult } from './interfaces/loaded-tests-result';
import { TestInfo, TestSuiteInfo } from 'vscode-test-adapter-api';
import { Log } from 'vscode-test-adapter-util';

// Get Cargo Metadata: cargo metadata --no-deps --format-version 1
// Check Configuration:
// 1. if config.unit - load unit tests
// 2. if config.loadDocTests - load doc tests
// 3. if config.loadTestTargets - load test targets

const runCargoTestCommand = async (testArgs: string, workspaceDir: string, log: Log) => new Promise<string>((resolve, reject) => {
    const execArgs: childProcess.ExecOptions = {
        cwd: workspaceDir,
        maxBuffer: 400 * 1024
    };
    const cmd = `cargo test ${testArgs ? `${testArgs}` : ''} -- --list`;
    childProcess.exec(cmd, execArgs, (err, stdout) => {
        if (err) {
            // log.debug(err);
            return reject(err);
        }
        resolve(stdout);
    });
});

const createEmptyTestSuiteInfoNode = (id: string, label: string): TestSuiteInfo => {
    return {
        id,
        label,
        type: 'suite',
        children: []
    };
};

const createTestInfoNode = (id: string, label: string): TestInfo => {
    return {
        id,
        label,
        type: 'test'
    };
};

// tslint:disable-next-line
const parseUnitTestListOutput = (packageName: string, cargoOutput: string): ILoadedTestsResult => {
    if (cargoOutput.indexOf('0 tests,') === 0) {
        return undefined;
    }
    const packageRootNode = createEmptyTestSuiteInfoNode(packageName, packageName);
    const testModulesMap: Map<string, TestSuiteInfo> = new Map<string, TestSuiteInfo>();
    testModulesMap.set(packageName, packageRootNode);
    const suiteOwnedTestIdsMap: Map<string, string[]> = new Map<string, string[]>();
    const testsOutput = cargoOutput.split('\n\n')[0];
    testsOutput.split('\n').forEach(testLine => {
        const trimmedModulePathParts = testLine.split(': test')[0];
        const modulePathParts = trimmedModulePathParts.split('::');
        const testName = modulePathParts.pop();
        const testNodeId = `${packageName}::${trimmedModulePathParts}`;
        const testNode = createTestInfoNode(testNodeId, testName);
        let currentNode = packageRootNode;
        modulePathParts.forEach(part => {
            const parentNodeId = currentNode.id;
            const currentNodeId = `${parentNodeId}::${part}`;
            let suiteNode = testModulesMap.get(currentNodeId);
            if (!suiteNode) {
                suiteNode = createEmptyTestSuiteInfoNode(currentNodeId, part);
                testModulesMap.set(currentNodeId, suiteNode);
                if (!currentNode.children.some(c => c.id === 'currentNodeId')) {
                    currentNode.children.push(suiteNode);
                }
            }
            currentNode = suiteNode;
        });
        currentNode.children.push(testNode);
    });

    return <ILoadedTestsResult> {
        rootTestSuite: packageRootNode,
        suiteOwnedTestIdsMap,
        testModulesMap
    };
};

const loadPackageUnitTestTree = async (packageName: string, workspaceDir: string, log: Log) => new Promise<ILoadedTestsResult>(async (resolve, reject) => {
    const cargoTestArgs = `-p ${packageName} --lib`;
    try {
        const cargoOutput = await runCargoTestCommand(cargoTestArgs, workspaceDir, log);
        return resolve(parseUnitTestListOutput(packageName, cargoOutput));
    } catch (err) {
        reject(err);
    }
});

const getCargoMetadata = async (workspaceDir: string, log: Log) => new Promise<ICargoMetadata>((resolve, reject) => {
    const execArgs: childProcess.ExecOptions = {
        cwd: workspaceDir,
        maxBuffer: 400 * 1024
    };
    const cmd = 'cargo metadata --no-deps --format-version 1';
    childProcess.exec(cmd, execArgs, (err, stdout) => {
        if (err) {
            return reject(err);
        }
        try {
            const cargoMetadata: ICargoMetadata = JSON.parse(stdout);
            resolve(cargoMetadata);
        } catch (err) {
            log.debug(err);
            reject(new Error('Unable to parse cargo metadata output'));
        }
    });
});

const buildRootTestSuiteInfoNode = (packageTestNodes: ILoadedTestsResult[]): TestSuiteInfo => {
    const testSuiteNodes = packageTestNodes.map(n => n.rootTestSuite);
    const testSuite: TestSuiteInfo = {
        id: 'root',
        type: 'suite',
        label: 'rust',
        children: []
    };
    testSuite.children = testSuiteNodes.length === 1
        ? testSuiteNodes[0].children
        : testSuiteNodes;

    return testSuite;
};

export const loadUnitTests = async (workspaceRoot: string, log: Log): Promise<{ rootNode: TestSuiteInfo, testSuitesMap: Map<string, TestSuiteInfo> }> => {
    try {
        let testSuitesMap = new Map<string, TestSuiteInfo>();
        const packages = (await getCargoMetadata(workspaceRoot, log)).packages;
        const packageTests = await Promise.all(packages.map(async p => {
            const packageTestResult = await loadPackageUnitTestTree(p.name, workspaceRoot, log);
            if (!packageTestResult) {
                return undefined;
            }
            testSuitesMap = new Map([...testSuitesMap, ...packageTestResult.testModulesMap]);
            return packageTestResult;
        }));
        // This condition will evaluate to true when there are no unit tests.
        if (packageTests.length >= 1 && !packageTests[0]) {
            return Promise.resolve(null);
        }
        const rootNode = buildRootTestSuiteInfoNode(packageTests);
        testSuitesMap.set(rootNode.id, rootNode);
        return Promise.resolve({ rootNode, testSuitesMap } );
    } catch (err) {
        return Promise.reject(err);
    }
};
