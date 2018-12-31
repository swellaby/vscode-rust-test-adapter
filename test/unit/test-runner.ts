'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';
// import { Log } from 'vscode-test-adapter-util';
import { runTests } from '../../src/test-runner';

suite('RustAdapter Tests:', () => {
    // setup(() => {
    // });

    teardown(() => {
        Sinon.restore();
    });

    test('Should display correct initialization method', async () => {
        // const testNodeIds = [
        //     'crate2::tests::test_add',
        //     'crate2::tests::test_bad_add'
        // ];
        const testNodeIds = [
            'crate2',
            'foo',
            'waka',
            'src'
        ];
        const workspaceDir = 'c:/dev/rust-samples/calc-test';
        const testResults = await runTests(testNodeIds, workspaceDir);
        testResults.forEach(tr => {
            console.log(`Test ${tr.test} resulted in: ${tr.state}`);
        });
    });
});
