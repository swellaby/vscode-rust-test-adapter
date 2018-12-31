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

const parseOutput = (packageName: string, output: string): TestSuiteInfo[] => {
    const testsOutput = output.split('\n\n')[0];
    const testLines = testsOutput.split('\n');
    const testModulesMap: Map<string, TestSuiteInfo> = new Map<string, TestSuiteInfo>();
    testLines.forEach(testLine => {
        const line = testLine.split(': test')[0].split('::');
        const rootTestModule = line[0];
        const testName = line[1];
        // for (let i = 0; i < line.length - 2; i++) {

        // }
        let moduleTestSuite = testModulesMap.get(rootTestModule);
        if (!moduleTestSuite) {
            moduleTestSuite = {
                id: `${packageName}:${rootTestModule}`,
                label: rootTestModule,
                type: 'suite',
                children: []
            };
            testModulesMap.set(rootTestModule, moduleTestSuite);
        }
        const test: TestInfo = {
            id: `${packageName}:${rootTestModule}:${testName}`,
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
            const output = await loadPackageTests(p.packageRootDirectoryPath);
            console.log(`package: ${p.name}`);
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
