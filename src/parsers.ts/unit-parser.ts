'use strict';

import { TestSuiteInfo } from 'vscode-test-adapter-api';

import { BaseCargoTestListParser } from './base-parser';
import { ICargoTestListParser } from '../interfaces/cargo-test-list-parser';
import { ILoadedTestsResult } from '../interfaces/loaded-tests-result';

export class UnitCargoTestListParser extends BaseCargoTestListParser implements ICargoTestListParser {
    public parseCargoTestListOutput(packageName: string, cargoOutput: string): ILoadedTestsResult {
        if (cargoOutput.indexOf('0 tests,') === 0) {
            return undefined;
        }
        const packageRootNode = this.createEmptyTestSuiteInfoNode(packageName, packageName);
        const testModulesMap: Map<string, TestSuiteInfo> = new Map<string, TestSuiteInfo>();
        testModulesMap.set(packageName, packageRootNode);
        const suiteOwnedTestIdsMap: Map<string, string[]> = new Map<string, string[]>();
        const testsOutput = cargoOutput.split('\n\n')[0];
        testsOutput.split('\n').forEach(testLine => {
            const trimmedModulePathParts = testLine.split(': test')[0];
            const modulePathParts = trimmedModulePathParts.split('::');
            const testName = modulePathParts.pop();
            const testNodeId = `${packageName}::${trimmedModulePathParts}`;
            this.updateTestTree(testNodeId, testName, packageRootNode, modulePathParts, testModulesMap);
        });

        return <ILoadedTestsResult> {
            rootTestSuite: packageRootNode,
            suiteOwnedTestIdsMap,
            testModulesMap
        };
    }

    private updateTestTree(
        testNodeId: string,
        testName: string,
        packageRootNode: TestSuiteInfo,
        modulePathParts: string[],
        testModulesMap: Map<string, TestSuiteInfo>
    ) {
        const testNode = this.createTestInfoNode(testNodeId, testName);
        let currentNode = packageRootNode;
        modulePathParts.forEach(part => {
            const parentNodeId = currentNode.id;
            const currentNodeId = `${parentNodeId}::${part}`;
            let suiteNode = testModulesMap.get(currentNodeId);
            if (!suiteNode) {
                suiteNode = this.createEmptyTestSuiteInfoNode(currentNodeId, part);
                testModulesMap.set(currentNodeId, suiteNode);
                if (!currentNode.children.some(c => c.id === 'currentNodeId')) {
                    currentNode.children.push(suiteNode);
                }
            }
            currentNode = suiteNode;
        });
        currentNode.children.push(testNode);
    }
}
