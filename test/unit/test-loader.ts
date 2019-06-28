'use strict';

import { assert } from 'chai';
import * as childProcess from 'child_process';
import * as Sinon from 'sinon';

import * as testLoader from '../../src/test-loader';

suite('test-loader Tests:', () => {
    let childProcessExecStub: Sinon.SinonStub;

    setup(() => {
        childProcessExecStub = Sinon.stub(childProcess, 'exec');
    });

    teardown(() => {
        Sinon.restore();
    });

    suite('getCargoMetadata()', () => {
        test('Should fail with correct error message when exception is thrown on metadata retrieval', async () => {
            const errorMessage = 'boom!';
            childProcessExecStub.throws(new Error(errorMessage));
            try {
                await testLoader.loadUnitTests(null, null);
                assert.fail('Should have thrown');
            } catch (err) {
                assert.deepEqual(err.message, errorMessage);
            }
        });
    });
});
