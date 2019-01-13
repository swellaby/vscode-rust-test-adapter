'use strict';

import * as childProcess from 'child_process';
import { TestEvent } from 'vscode-test-adapter-api';

import { ITestCaseNode } from './interfaces/test-case-node';
import { ITestSuiteNode } from './interfaces/test-suite-node';
import { TargetType } from './enums/target-type';
import { INodeTarget } from './interfaces/node-target';

const runCargoTestCommand = async(packageName: string, workspaceRootDir: string, testFilter: string) => new Promise<string>((resolve, reject) => {
    const execArgs: childProcess.ExecOptions = {
        cwd: workspaceRootDir,
        maxBuffer: 200 * 1024
    };

    const command = `cargo test -p ${packageName} ${testFilter}`;
    console.log(`command: ${command}`);
    childProcess.exec(command, execArgs, (err, stdout, stderr) => {
        // If there are failed tests then stderr will be truthy so we want to return stdout.
        if (err && !stderr) {
            console.log('crash');
            return reject(err);
        }
        console.log('output:\n');
        console.log(`${stdout}`);
        resolve(stdout);
    });
});

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

const buildTargetFilter = (nodeTarget: INodeTarget): string => {
    if (nodeTarget.targetType === TargetType.lib) {
        return ' --lib ';
    } else if (nodeTarget.targetType === TargetType.bin) {
        return ` --bin ${nodeTarget.targetName} `;
    } else {
        return ` --test ${nodeTarget.targetName} `;
    }
};

export const runTestCase = async (testCaseNode: ITestCaseNode, workspaceRootDir: string) => new Promise<TestEvent>(async (resolve, reject) => {
    try {
        const packageName = testCaseNode.packageName;
        const target = buildTargetFilter(testCaseNode.nodeTarget);
        const specName = testCaseNode.testSpecName;
        const testFilter = `${target} ${specName} -- --exact`;
        const output = await runCargoTestCommand(packageName, workspaceRootDir, testFilter);
        resolve(parseTestCaseResultOutput(testCaseNode.nodeIdPrefix, output)[0]);
    } catch (err) {
        console.log(`Test Case Run Error: ${err}`);
        reject(err);
    }
});

export const runTestSuite = async (testSuiteNode: ITestSuiteNode, workspaceRootDir: string) => new Promise<TestEvent[]>(async (resolve, reject) => {
    try {
        const packageName = testSuiteNode.packageName;
        const specName = testSuiteNode.testSpecName;

        const results = await Promise.all(testSuiteNode.targets.map(async target => {
            const targetFilter = buildTargetFilter(target);
            const testFilter = `${targetFilter} ${specName}`;
            const testIdPrefix = `${packageName}::${target.targetName}::${target.targetType}`;
            const output = await runCargoTestCommand(packageName, workspaceRootDir, testFilter);
            return parseTestCaseResultOutput(testIdPrefix, output);
        }));

        resolve([].concat(...results));
    } catch (err) {
        console.log(`Test Suite Run Error: ${err}`);
        reject(err);
    }
});
