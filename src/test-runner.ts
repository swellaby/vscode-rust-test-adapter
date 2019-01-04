'use strict';

import * as childProcess from 'child_process';
import { TestEvent } from 'vscode-test-adapter-api';
import { ICargoPackage } from './interfaces/cargo-package';
import { ITestCaseNode } from './interfaces/test-case-node';
import { ITestSuiteNode } from './interfaces/test-suite-node';

const runCargoTestCommand = async(packageName: string, workspaceRootDir: string, testFilter: string) => new Promise<string>((resolve, reject) => {
    const execArgs: childProcess.ExecOptions = {
        cwd: workspaceRootDir,
        maxBuffer: 100 * 1024
    };
    // update this to receive the package, and conditionally use the lib or bin flag
    // depending on the package target type
    // const command = `cargo test --lib -p ${packageName} ${testFilter} -- --exact`;
    const command = `cargo test -p ${packageName} ${testFilter}`;
    console.log(`command: ${command}`);
    childProcess.exec(command, execArgs, (err, stdout, stderr) => {
        // If there are failed tests then stderr will be truthy so we want to return stdout.
        if (err && !stderr) {
            console.log('crash');
            return reject(err);
        }
        console.log(`stdout:`);
        console.log(`${stdout}`);
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

const parseTestCaseResultOutput = (packageName: string, output: string): TestEvent[] => {
    const testResults: TestEvent[] = [];
    const startMessageIndex = output.search(/running \d* (test|tests)/);
    if (startMessageIndex > 0) {
        const startMessageEndIndex = output.indexOf('\n', startMessageIndex);
        const startMessageSummary = output.substring(startMessageIndex, startMessageEndIndex);
        if (startMessageSummary !== 'running 0 tests') {
            const testResultsOutput = output.substring(startMessageEndIndex + 1).split('\n\n')[0];
            const testResultLines = testResultsOutput.split('\n');
            testResultLines.forEach(testResultLine => {
                testResults.push(parseTestResult(packageName, testResultLine));
            });
        }
    }

    return testResults;
};

// const parseTestCaseResultOutput = (packageName: string, output: string): TestEvent => {
//     let testResult: TestEvent;
//     const startMessageIndex = output.search(/running \d* (test|tests)/);
//     if (startMessageIndex > 0) {
//         const startMessageEndIndex = output.indexOf('\n', startMessageIndex);
//         const startMessageSummary = output.substring(startMessageIndex, startMessageEndIndex);
//         if (startMessageSummary !== 'running 0 tests') {
//             const testResultsOutput = output.substring(startMessageEndIndex + 1).split('\n\n')[0];
//             const testResults = testResultsOutput.split('\n');
//             testResult = parseTestResult(packageName, testResults[0]);
//         }
//     }

//     return testResult;
// };

// export const runTestCase = async (testCaseNodeId: string, workspaceRootDir: string) => new Promise<TestEvent>(async (resolve, reject) => {
//     try {
//         let packageName = testCaseNodeId;
//         let testFilter;
//         const packageDelimiterIndex = testCaseNodeId.indexOf('::');
//         if (packageDelimiterIndex > 0) {
//             packageName = testCaseNodeId.substring(0, packageDelimiterIndex);
//             testFilter = testCaseNodeId.substring(packageDelimiterIndex + 2);
//         }
//         const output = await runCargoTestCommand(packageName, workspaceRootDir, testFilter);
//         resolve(parseTestCaseResultOutput(packageName, output));
//     } catch (err) {
//         console.log(`runTestsForNode Error: ${err}`);
//         reject(err);
//     }
// });

export const runTestCase = async (testCaseNode: ITestCaseNode, workspaceRootDir: string) => new Promise<TestEvent>(async (resolve, reject) => {
    try {
        const associatedPackage = testCaseNode.associatedPackage;
        let packageName = associatedPackage.name;
        const testCaseNodeId = testCaseNode.id;
        let testFilter;
        const packageDelimiterIndex = testCaseNodeId.indexOf('::');
        if (packageDelimiterIndex > 0) {
            packageName = testCaseNodeId.substring(0, packageDelimiterIndex);
            testFilter = testCaseNodeId.substring(packageDelimiterIndex + 2);
        }
        if (associatedPackage.targets[0].kind[0] === 'lib') {
            testFilter += ' --lib ';
        } else {
            testFilter += ` --bin ${packageName} `;
        }
        testFilter += '-- --exact';
        const output = await runCargoTestCommand(packageName, workspaceRootDir, testFilter);
        resolve(parseTestCaseResultOutput(packageName, output)[0]);
    } catch (err) {
        console.log(`Test Case Run Error: ${err}`);
        reject(err);
    }
});

export const runTestSuite = async (testSuiteNode: ITestSuiteNode, workspaceRootDir: string) => new Promise<TestEvent[]>(async (resolve, reject) => {
    try {
        const associatedPackage = testSuiteNode.associatedPackage;
        const packageName = associatedPackage.name;
        console.log(`running suite`);
        console.log(`associated package name: ${packageName}`);
        const testSuiteNodeId = testSuiteNode.id;
        console.log(`suite node Id: ${testSuiteNodeId}`);
        let testFilter = testSuiteNodeId;
        if (testSuiteNodeId.startsWith(packageName)) {
            testFilter = `${testSuiteNodeId.slice(packageName.length + 2)}::`;
        }
        if (associatedPackage.targets[0].kind[0] === 'lib') {
            testFilter += ' --lib ';
        } else {
            testFilter += ` --bin ${packageName} `;
        }
        const output = await runCargoTestCommand(packageName, workspaceRootDir, testFilter);
        resolve(parseTestCaseResultOutput(packageName, output));
    } catch (err) {
        console.log(`Test Case Run Error: ${err}`);
        reject(err);
    }
});
