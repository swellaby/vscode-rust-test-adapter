'use strict';

import { TestEvent } from 'vscode-test-adapter-api';

import { ITestCaseNode } from './interfaces/test-case-node';
import { ITestSuiteNode } from './interfaces/test-suite-node';
import { runCargoTestsForPackageTargetWithPrettyFormat } from './cargo';
import { ICargoTestExecutionParameters } from './interfaces/cargo-test-execution-parameters';

const parseTestResult = (testIdPrefix: string, testOutputLine: string): TestEvent => {
    const testLine = testOutputLine.substr(5).split(' ... ');
    const testName = testLine[0];
    const testResult = testLine[1].toLowerCase();
    let state;
    // TODO: should this be startsWith to account for test warnings?
    if (testResult === 'ok') {
        state = 'passed';
    } else if (testResult === 'failed') {
        state = 'failed';
    } else {
        state = 'skipped';
    }
    // TODO: figure out how to get failed test output here for message
    return {
        state,
        test: `${testIdPrefix}::${testName}`,
        type: 'test'
    };
};

const parseTestCaseResultOutput = (testIdPrefix: string, output: string): TestEvent[] => {
    const testResults: TestEvent[] = [];
    const startMessageIndex = output.search(/running \d* (test|tests)/);
    if (startMessageIndex > 0) {
        const startMessageEndIndex = output.indexOf('\n', startMessageIndex);
        const startMessageSummary = output.substring(startMessageIndex, startMessageEndIndex);
        if (startMessageSummary !== 'running 0 tests') {
            const testResultsOutput = output.substring(startMessageEndIndex + 1).split('\n\n')[0];
            const testResultLines = testResultsOutput.split('\n');
            testResultLines.forEach(testResultLine => {
                testResults.push(parseTestResult(testIdPrefix, testResultLine));
            });
        }
    }

    return testResults;
};

export const runTestCase = async (testCaseNode: ITestCaseNode, workspaceRootDir: string) => new Promise<TestEvent>(async (resolve, reject) => {
    try {
        const { packageName, nodeTarget, testSpecName, nodeIdPrefix } = testCaseNode;
        const params = <ICargoTestExecutionParameters> {
            cargoSubCommandArgs: testSpecName,
            nodeTarget: nodeTarget,
            packageName,
            targetWorkspace: workspaceRootDir,
            testBinaryArgs: '--exact'
        };
        const output = await runCargoTestsForPackageTargetWithPrettyFormat(params);
        resolve(parseTestCaseResultOutput(nodeIdPrefix, output)[0]);
    } catch (err) {
        console.log(`Test Case Run Error: ${err}`);
        reject(err);
    }
});

export const runTestSuite = async (testSuiteNode: ITestSuiteNode, workspaceRootDir: string) => new Promise<TestEvent[]>(async (resolve, reject) => {
    try {
        const { packageName, testSpecName, targets } = testSuiteNode;
        const results = await Promise.all(targets.map(async target => {
            const testIdPrefix = `${packageName}::${target.targetName}::${target.targetType}`;
            const params = <ICargoTestExecutionParameters> {
                cargoSubCommandArgs: `${testSpecName} --no-fail-fast`,
                nodeTarget: target,
                packageName,
                targetWorkspace: workspaceRootDir
            };
            const output = await runCargoTestsForPackageTargetWithPrettyFormat(params);
            return parseTestCaseResultOutput(testIdPrefix, output);
        }));

        resolve([].concat(...results));
    } catch (err) {
        console.log(`Test Suite Run Error: ${err}`);
        reject(err);
    }
});
