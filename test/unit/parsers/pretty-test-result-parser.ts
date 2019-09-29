'use strict';

import { assert } from 'chai';
import Sinon = require('sinon');
import { TestEvent } from 'vscode-test-adapter-api';

import { parseTestCaseResultPrettyOutput } from '../../../src/parsers/pretty-test-result-parser';
import * as parserUtils from '../../../src/parsers/parser-utils';
import { testRunOutputs } from '../../test-utils';

suite('pretty-test-result-parser Tests:', () => {
    let getTestEventStateStub: Sinon.SinonStub;
    let buildTestEventStub: Sinon.SinonStub;
    let buildErroredTestEventStub: Sinon.SinonStub;
    const testIdPrefix = 'swanson::swanson::tests';
    const testAddResultEvent = <TestEvent> {
        state: 'passed',
        test: `${testIdPrefix}::tests::test_add`,
        type: 'test'
    };
    const testBadAddResultEvent = <TestEvent> {
        state: 'failed',
        test: `${testIdPrefix}::tests::test_bad_add`,
        type: 'test'
    };

    setup(() => {
        getTestEventStateStub = Sinon.stub(parserUtils, 'getTestEventState');
        buildTestEventStub = Sinon.stub(parserUtils, 'buildTestEvent');
        buildErroredTestEventStub = Sinon.stub(parserUtils, 'buildErroredTestEvent');
    });

    teardown(() => {
        Sinon.restore();
    });

    suite('parseTestCaseResultPrettyOutput()', () => {
        test('Should return empty array when test output is null', () => {
            const testResults = parseTestCaseResultPrettyOutput(testIdPrefix, null);
            assert.deepEqual(testResults, []);
        });

        test('Should return empty array when test output is undefined', () => {
            const testResults = parseTestCaseResultPrettyOutput(testIdPrefix, null);
            assert.deepEqual(testResults, []);
        });

        test('Should return empty array when test output is empty', () => {
            const testResults = parseTestCaseResultPrettyOutput(testIdPrefix, '');
            assert.deepEqual(testResults, []);
        });

        test('Should return empty array when test output does not contain test output', () => {
            const testResults = parseTestCaseResultPrettyOutput(testIdPrefix, '\n\n');
            assert.deepEqual(testResults, []);
        });

        test('Should return empty array when test output does contains zero test results', () => {
            const testResults = parseTestCaseResultPrettyOutput(testIdPrefix, 'running 0 tests\n');
            assert.deepEqual(testResults, []);
        });

        test('Should return correct results when test output contains valid test results', () => {
            const { mixedTestResults } = testRunOutputs;
            getTestEventStateStub.onFirstCall().callsFake(() => 'passed');
            getTestEventStateStub.onSecondCall().callsFake(() => 'failed');
            buildTestEventStub.onFirstCall().callsFake(() => testAddResultEvent);
            buildTestEventStub.onSecondCall().callsFake(() => testBadAddResultEvent);
            const testResults = parseTestCaseResultPrettyOutput(testIdPrefix, mixedTestResults);
            assert.deepEqual(testResults, [ testAddResultEvent, testBadAddResultEvent ]);
            assert.isTrue(getTestEventStateStub.firstCall.calledWithExactly('ok'));
            assert.isTrue(getTestEventStateStub.secondCall.calledWithExactly('failed'));
            assert.isTrue(buildTestEventStub.firstCall.calledWithExactly('passed', testAddResultEvent.test));
            assert.isTrue(buildTestEventStub.secondCall.calledWithExactly('failed', testBadAddResultEvent.test));
        });

        test('Should return correct results when test output contains extra output', () => {
            const { extraOutputTestResults } = testRunOutputs;
            getTestEventStateStub.callsFake(() => 'passed');
            buildTestEventStub.callsFake(() => testAddResultEvent);
            const testResults = parseTestCaseResultPrettyOutput(testIdPrefix, extraOutputTestResults);
            assert.deepEqual(testResults, [ testAddResultEvent, testAddResultEvent, testAddResultEvent ]);
        });

        test('Should return correct results when test output contains a test with missing result', () => {
            const { invalidOutputTestResults } = testRunOutputs;
            const erroredTestEvent = <TestEvent> {
                state: 'errored',
                test: `${testIdPrefix}::tests::test_foo`,
                type: 'test'
            };
            getTestEventStateStub.callsFake(() => 'passed');
            buildTestEventStub.callsFake(() => testAddResultEvent);
            buildErroredTestEventStub.callsFake(() => erroredTestEvent);
            const testResults = parseTestCaseResultPrettyOutput(testIdPrefix, invalidOutputTestResults);
            assert.deepEqual(testResults, [ erroredTestEvent, testAddResultEvent ]);
            assert.isTrue(buildErroredTestEventStub.calledWithExactly(`${erroredTestEvent.test} ...`));
        });

        test('Should return correct results when test output contains a a single test', () => {
            const { singleTestResult } = testRunOutputs;
            getTestEventStateStub.callsFake(() => 'passed');
            buildTestEventStub.callsFake(() => testAddResultEvent);
            const testResults = parseTestCaseResultPrettyOutput(testIdPrefix, singleTestResult);
            assert.deepEqual(testResults, [ testAddResultEvent ]);
        });
    });
});
