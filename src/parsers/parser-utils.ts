'use strict';

import { TestEvent } from 'vscode-test-adapter-api';

export const getTestEventState = (result: string): TestEvent['state'] => {
    if (result === 'ok') {
        return 'passed';
    } else if (result === 'failed') {
        return 'failed';
    } else {
        return 'skipped';
    }
};

export const buildTestEvent = (testEventState: TestEvent['state'], testId: string, message?: string): TestEvent => {
    return {
        test: testId,
        state: testEventState,
        message,
        type: 'test'
    };
};

export const buildErroredTestEvent = (testId: string, message?: string): TestEvent => {
    return buildTestEvent('errored', testId, message);
};
