'use strict';

import * as childProcess from 'child_process';
import { TestEvent } from 'vscode-test-adapter-api';

const runCargoTestCommand = async(packageName: string, workspaceRootDir: string, testFilter: string) => new Promise<string>((resolve, reject) => {
    const execArgs: childProcess.ExecOptions = {
        cwd: workspaceRootDir,
        maxBuffer: 200 * 1024
    };
    const command = `cargo test --lib -p ${packageName} ${
        testFilter
        ? `${testFilter} -- --exact`
        : '' }`;
    childProcess.exec(command, execArgs, (err, stdout, stderr) => {
        // If there are failed tests then stderr will be truthy so we want to return stdout.
        if (err && !stderr) {
            console.log('crash');
            return reject(err);
        }
        resolve(stdout);
    });
});

const parseTestResult = (packageName: string, testOutputLine: string): TestEvent => {
    const testLine = testOutputLine.substr(5).split(' ... ');
    const testName = testLine[0];
    const testResult = testLine[1].toLowerCase();
    let state;
    if (testResult === 'ok') {
        state = 'passed';
    } else if (testResult === 'failed') {
        state = 'failed';
    } else {
        state = 'skipped';
    }
    return {
        state,
        test: `${packageName}::${testName}`,
        type: 'test'
    };
};

const parseTestCaseResultOutput = (packageName: string, output: string): TestEvent => {
    let testResult: TestEvent;
    const startMessageIndex = output.search(/running \d* (test|tests)/);
    if (startMessageIndex > 0) {
        const startMessageEndIndex = output.indexOf('\n', startMessageIndex);
        const startMessageSummary = output.substring(startMessageIndex, startMessageEndIndex);
        if (startMessageSummary !== 'running 0 tests') {
            const testResultsOutput = output.substring(startMessageEndIndex + 1).split('\n\n')[0];
            const testResults = testResultsOutput.split('\n');
            testResult = parseTestResult(packageName, testResults[0]);
        }
    }

    return testResult;
};

export const runTestCase = async (testCaseNodeId: string, workspaceRootDir: string) => new Promise<TestEvent>(async (resolve, reject) => {
    try {
        let packageName = testCaseNodeId;
        let testFilter;
        const packageDelimiterIndex = testCaseNodeId.indexOf('::');
        if (packageDelimiterIndex > 0) {
            packageName = testCaseNodeId.substring(0, packageDelimiterIndex);
            testFilter = testCaseNodeId.substring(packageDelimiterIndex + 2);
        }
        const output = await runCargoTestCommand(packageName, workspaceRootDir, testFilter);
        resolve(parseTestCaseResultOutput(packageName, output));
    } catch (err) {
        console.log(`runTestsForNode Error: ${err}`);
        reject(err);
    }
});
