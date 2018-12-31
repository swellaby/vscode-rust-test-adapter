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
        ? `${testFilter}`
        : '' }`;
    childProcess.exec(command, execArgs, (err, stdout, stderr) => {
        // If there are failed tests then stderr will be truthy so we want to return stdout.
        if (err && !stderr) {
            console.log('crash');
            return reject(err);
        }
        // console.log(`stdout: ${stdout}`);
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

const parseTestOutput = (packageName: string, output: string): TestEvent[] => {
    const testResultEvents: TestEvent[] = [];
    const startMessageIndex = output.search(/running \d* (test|tests)/);
    if (startMessageIndex > 0) {
        const startMessageEndIndex = output.indexOf('\n', startMessageIndex);
        const startMessageSummary = output.substring(startMessageIndex, startMessageEndIndex);
        if (startMessageSummary !== 'running 0 tests') {
            const testResultsOutput = output.substring(startMessageEndIndex + 1).split('\n\n')[0];
            const testResults = testResultsOutput.split('\n');
            testResults.forEach(t => {
                testResultEvents.push(parseTestResult(packageName, t));
            });
        }
    }

    return testResultEvents;
};

const runTestsForNode = async (nodeId: string, workspaceRootDir: string) => new Promise<TestEvent[]>(async (resolve, reject) => {
    try {
        let packageName = nodeId;
        let testFilter;
        const packageDelimiterIndex = nodeId.indexOf('::');
        if (packageDelimiterIndex > 0) {
            packageName = nodeId.substring(0, packageDelimiterIndex);
            testFilter = nodeId.substring(packageDelimiterIndex + 2);
        }
        const output = await runCargoTestCommand(packageName, workspaceRootDir, testFilter);
        resolve(parseTestOutput(packageName, output));
    } catch (err) {
        console.log(`runTestsForNode Error: ${err}`);
        reject(err);
    }
});

export const runTests = async (testNodeIds: string[], workspaceRootDir: string) => new Promise<TestEvent[]>(async (resolve, reject) => {
    const testEvents = await Promise.all(testNodeIds.map(async id => {
        return await runTestsForNode(id, workspaceRootDir);
    }));
    resolve([].concat(...testEvents));
});
