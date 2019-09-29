'use strict';

import { TestEvent } from 'vscode-test-adapter-api';
import { getTestEventState, buildTestEvent, buildErroredTestEvent } from './parser-utils';

const parseTestResult = (testIdPrefix: string, testOutputLine: string): TestEvent => {
    const testLine = testOutputLine.split(' ... ');
    const testName = testLine[0];
    const test = `${testIdPrefix}::${testName}`;

    const rhs = testLine[1];
    if (!rhs) {
        return buildErroredTestEvent(test);
    }

    const firstNewLineIndex = rhs.indexOf('\n');
    const testResult = firstNewLineIndex > 0 ? rhs.substring(0, firstNewLineIndex).toLowerCase() : rhs.toLowerCase();
    const state = getTestEventState(testResult);
    return buildTestEvent(state, test);
};

// TODO: We need to check for and parse `failures` first, probably into some kind of Dictionary
// that is keyed off the test name. That data structure then needs to be funneled along to the
// parsing of the test result
export const parseTestCaseResultPrettyOutput = (testIdPrefix: string, output: string): TestEvent[] => {
    const testResults: TestEvent[] = [];
    const startMessageIndex = output.search(/running \d* (test|tests)/);
    if (startMessageIndex > 0) {
        const startMessageEndIndex = output.indexOf('\n', startMessageIndex);
        const startMessageSummary = output.substring(startMessageIndex, startMessageEndIndex);
        if (startMessageSummary !== 'running 0 tests') {
            const testResultsOutput = output.substring(startMessageEndIndex).split('\n\n')[0];
            const testResultLines = testResultsOutput.split('\ntest ');
            // First element will be an empty string as `testResultsOutput` starts with `\ntest `
            for (let i = 1; i < testResultLines.length; i++) {
                testResults.push(parseTestResult(testIdPrefix, testResultLines[i]));
            }
        }
    }

    return testResults;
};
