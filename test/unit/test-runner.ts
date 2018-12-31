'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';
import { runTestCase } from '../../src/test-runner';

suite('testRunner Tests:', () => {
    // setup(() => {
    // });

    teardown(() => {
        Sinon.restore();
    });

    test('Should display correct initialization method', async () => {
        const testNodeIds = [
            'crate2::tests::test_add',
            'crate2::tests::test_bad_add'
        ];
        const workspaceDir = 'c:/dev/rust-samples/calc-test';
        // const workspaceDir = 'c:/dev/cargo';
        const testResults = await Promise.all(testNodeIds.map(async id => {
            return await runTestCase(id, workspaceDir);
        }));

        testResults.forEach(tr => {
            console.log(`Test ${tr.test} resulted in: ${tr.state}`);
        });
    });

    test('foo', () => {
        assert.isTrue(false);
    });
});
