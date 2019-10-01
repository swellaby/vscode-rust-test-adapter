'use strict';

import { assert } from 'chai';
import { TestEvent } from 'vscode-test-adapter-api';

import {
    buildErroredTestEvent,
    buildTestEvent,
    getTestEventState
} from '../../../src/parsers/parser-utils';

suite('parser-utils Tests:', () => {
    suite('buildErroredTestEvent()', () => {
        test('Should return correct event when no message provided', () => {
            const testName = 'chopin';
            const testEvent: TestEvent = buildErroredTestEvent(testName);
            assert.deepEqual(testEvent, <TestEvent> {
                message: undefined,
                state: 'errored',
                test: testName,
                type: 'test'
            });
        });

        test('Should return correct event when message provided', () => {
            const testName = 'brahms';
            const message = 'foo';
            const testEvent: TestEvent = buildErroredTestEvent(testName, message);
            assert.deepEqual(testEvent, <TestEvent> {
                message,
                state: 'errored',
                test: testName,
                type: 'test'
            });
        });
    });

    suite('buildTestEvent()', () => {
        test('Should return correct event when no message provided', () => {
            const testName = 'ronald';
            const testStatus: TestEvent['state'] = 'passed';
            const testEvent: TestEvent = buildTestEvent(testStatus, testName);
            assert.deepEqual(testEvent, <TestEvent> {
                message: undefined,
                state: testStatus,
                test: testName,
                type: 'test'
            });
        });

        test('Should return correct event when message provided', () => {
            const testName = 'swanson';
            const testStatus: TestEvent['state'] = 'failed';
            const message = 'oops';
            const testEvent: TestEvent = buildTestEvent(testStatus, testName, message);
            assert.deepEqual(testEvent, <TestEvent> {
                message,
                state: testStatus,
                test: testName,
                type: 'test'
            });
        });
    });

    suite('getTestEventState()', () => {
        test('should return passed when status is ok', () => {
            assert.deepEqual(getTestEventState('ok'), 'passed');
        });

        test('should return failed when status is failed', () => {
            assert.deepEqual(getTestEventState('failed'), 'failed');
        });

        test('should return skipped when status is not ok or failed', () => {
            assert.deepEqual(getTestEventState('what?'), 'skipped');
        });
    });
});
