'use strict';

import * as childProcess from 'child_process';

import { ICargoManifest } from './interfaces/cargo-manifest';
import { ICargoPackage } from './interfaces/cargo-package';
import { TestInfo, TestSuiteInfo } from 'vscode-test-adapter-api';
import * as toml from 'toml';
import * as fs from 'fs';
import * as path from 'path';

const loadPackageTests = async (packageDirectoryPath: string): Promise<string> => new Promise<string>((resolve, reject) => {
    const execArgs: childProcess.ExecOptions = {
        cwd: packageDirectoryPath,
        maxBuffer: 200 * 1024
    };
    childProcess.exec('cargo test -- --list', execArgs, (err, stdout) => {
        if (err) {
            // console.log(`got error on cargo test list`);
            // console.log(`err: ${err}`);
            return reject();
        }
        resolve(stdout);
    });
});

const parseCargoManifest = async (cargoManifestRootDirectory: string): Promise<ICargoManifest> => new Promise<ICargoManifest>((resolve, reject) => {
    fs.readFile(path.join(cargoManifestRootDirectory, 'Cargo.toml'), (err, data) => {
        if (err) {
            reject(err);
        }
        const parsed = toml.parse(data.toString());
        resolve(<ICargoManifest>{
            cargoPackage: parsed.package,
            workspace: parsed.workspace
        });
    });
});

const getPackages = async (cargoManifestRootDirectory: string): Promise<ICargoPackage[]> => new Promise<ICargoPackage[]>(async (resolve, reject) => {
    const rootCargoManifest = await parseCargoManifest(cargoManifestRootDirectory);
    const packages: ICargoPackage[] = [];
    if (!rootCargoManifest.workspace) {
        packages.push({
            packageRootDirectoryPath: cargoManifestRootDirectory,
            name: rootCargoManifest.cargoPackage.name
        });
    } else {
        await Promise.all(rootCargoManifest.workspace.members.map(async m => {
            const manifest = await parseCargoManifest(path.join(cargoManifestRootDirectory, m));
            packages.push({
                name: manifest.cargoPackage.name,
                packageRootDirectoryPath: path.join(cargoManifestRootDirectory, m)
            });
        }));
    }
    resolve(packages);
});

// tslint:disable
const parseOutput = (packageName: string, output: string): TestSuiteInfo[] => {
    const testsOutput = output.split('\n\n')[0];
    const testLines = testsOutput.split('\n');
    const testModulesMap: Map<string, TestSuiteInfo> = new Map<string, TestSuiteInfo>();
    testLines.forEach(testLine => {
        const trimmedModulePathParts = testLine.split(': test')[0];
        const modulePathParts = trimmedModulePathParts.split('::');
        const testName = modulePathParts.pop();
        const rootTestModuleName = modulePathParts.shift();
        let testId = `${packageName}:${trimmedModulePathParts.replace('::', ':')}`;
        let rootTestModule = testModulesMap.get(rootTestModuleName);
        if (!rootTestModule) {
            rootTestModule = {
                id: `${packageName}:${rootTestModuleName}`,
                label: rootTestModuleName,
                type: 'suite',
                children: []
            };
            testModulesMap.set(rootTestModuleName, rootTestModule);
        }

        let testModuleNode = rootTestModule;
        modulePathParts.forEach(part => {
            const parentNodeId = testModuleNode.id;
            const nodeId = `${parentNodeId}:${part}`;
            let childModuleNode = <TestSuiteInfo>testModuleNode.children.find(n => n.id === nodeId);
            if (!childModuleNode) {
                childModuleNode = {
                    id: `${nodeId}`,
                    label: part,
                    type: 'suite',
                    children: []
                }
                testModuleNode.children.push(childModuleNode);
            }
            testModuleNode = childModuleNode;
        });

        const test: TestInfo = {
            id: testId,
            label: testName,
            type: 'test'
        };
        testModuleNode.children.push(test);
    });
    return Array.from(testModulesMap.values());
};
// tslint:enable

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
            const output = await loadPackageTests(p.packageRootDirectoryPath);
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
