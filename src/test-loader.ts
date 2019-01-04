'use strict';

import * as childProcess from 'child_process';

import { ICargoMetadata } from './interfaces/cargo-metadata';
import { ILoadedTestsResult } from './interfaces/loaded-tests-result';
import { TestSuiteInfo } from 'vscode-test-adapter-api';
import { Log } from 'vscode-test-adapter-util';
import { ICargoPackage } from './interfaces/cargo-package';
import { parseCargoTestListOutput } from './parsers/unit-parser';
import { createEmptyTestSuiteNode } from './utils';
import { ITestSuiteNode } from './interfaces/test-suite-node';
import { ITestCaseNode } from './interfaces/test-case-node';

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

const loadPackageUnitTestTree = async (cargoPackage: ICargoPackage, log: Log) => new Promise<ILoadedTestsResult>(async (resolve, reject) => {
    const manifestPath = cargoPackage.manifest_path;
    const packageName = cargoPackage.name;
    const cargoTestArgs = `-p ${packageName}`;
    const packageRootDirectory = manifestPath.endsWith('Cargo.toml') ? manifestPath.slice(0, -10) : manifestPath;

    try {
        const cargoOutput = await runCargoTestCommand(cargoTestArgs, packageRootDirectory, log);
        return resolve(parseCargoTestListOutput(cargoPackage, cargoOutput));
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

const buildRootTestSuiteInfoNode = (packageTestNodes: ILoadedTestsResult[]): ITestSuiteNode => {
    const testSuiteNodes = [ ...packageTestNodes.reduce((nodes, n) => {
        if (n.rootTestSuite) {
            nodes.push(n.rootTestSuite);
        }
        return nodes;
    // tslint:disable-next-line:align
    }, [])];
    const rootTestSuiteNode = createEmptyTestSuiteNode('root', 'rust', null);
    rootTestSuiteNode.children = testSuiteNodes.length === 1
        ? testSuiteNodes[0].children
        : testSuiteNodes;

    return rootTestSuiteNode;
};

export const loadUnitTests = async (workspaceRoot: string, log: Log): Promise<ILoadedTestsResult> => {
    try {
        let testSuitesMap = new Map<string, ITestSuiteNode>();
        let testCasesMap = new Map<string, ITestCaseNode>();
        const packages = (await getCargoMetadata(workspaceRoot, log)).packages;
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
        const rootNode = buildRootTestSuiteInfoNode(packageTests);
        testSuitesMap.set(rootNode.id, rootNode);
        return Promise.resolve({ rootTestSuite: rootNode, testSuitesMap, testCasesMap });
    } catch (err) {
        return Promise.reject(err);
    }
};
