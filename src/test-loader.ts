'use strict';

import * as childProcess from 'child_process';

import { ICargoMetadata } from './interfaces/cargo-metadata';
import { ICargoPackage } from './interfaces/cargo-package';
import { TestInfo, TestSuiteInfo } from 'vscode-test-adapter-api';

const loadPackageTests = async (packageDirectoryPath: string): Promise<string> => new Promise<string>((resolve, reject) => {
    childProcess.exec('cargo test -- --list', { cwd: packageDirectoryPath }, (err, stdout) => {
        if (err) {
            return reject();
        }
        resolve(stdout);
    });
});

const getPackages = async (cargoManifestRootDirectory: string): Promise<ICargoPackage[]> => new Promise<ICargoPackage[]>((resolve, reject) => {
    const execArgs: childProcess.ExecOptions = {
        cwd: cargoManifestRootDirectory
    };
    childProcess.exec('cargo metadata --format-version 1', execArgs, (err, stdout) => {
        if (err) {
            return reject();
        }
        const cargoMetadata = <ICargoMetadata> JSON.parse(stdout);
        resolve(cargoMetadata.packages);
    });
});

const parseOutput = (packageName: string, output: string): TestSuiteInfo[] => {
    const testsOutput = output.split('\n\n')[0];
    const testLines = testsOutput.split('\n');
    const testModulesMap: Map<string, TestSuiteInfo> = new Map<string, TestSuiteInfo>();
    testLines.forEach(testLine => {
        const line = testLine.split(': test')[0].split('::');
        const testModule = line[0];
        const testName = line[1];
        let moduleTestSuite = testModulesMap.get(testModule);
        if (!moduleTestSuite) {
            moduleTestSuite = {
                id: `${packageName}:${testModule}`,
                label: testModule,
                type: 'suite',
                children: []
            };
            testModulesMap.set(testModule, moduleTestSuite);
        }
        const test: TestInfo = {
            id: `${packageName}:${testModule}:${testName}`,
            label: testName,
            type: 'test'
        };
        moduleTestSuite.children.push(test);
    });
    return Array.from(testModulesMap.values());
};

const buildRootTestSuiteInfoNode = (packageTestNodes: TestSuiteInfo[]): TestSuiteInfo => {
    const testSuite: TestSuiteInfo = {
        id: 'root',
        type: 'suite',
        label: 'rust',
        children: []
    };
    testSuite.children = packageTestNodes.length === 1
        ? packageTestNodes[0].children
        : packageTestNodes;

    return testSuite;
};

export const loadUnitTests = async (workspaceRoot: string): Promise<TestSuiteInfo> => {
    try {
        const packages = await getPackages(workspaceRoot);
        const packageTests = await Promise.all(packages.map(async p => {
            const packageDirectory = p.manifest_path.replace('Cargo.toml', '');
            const output = await loadPackageTests(packageDirectory);
            if (output.indexOf('0 tests,') === 0) {
                return undefined;
            }
            return <TestSuiteInfo>{
                id: p.name,
                type: 'suite',
                label: p.name,
                children: parseOutput(p.name, output)
            };
        }));
        // This condition will evaluate to true when there are no unit tests.
        if (packageTests.length >= 1 && !packageTests[0]) {
            return Promise.resolve(null);
        }
        return Promise.resolve(buildRootTestSuiteInfoNode(packageTests));
    } catch (err) {
        return Promise.reject(err);
    }
};
