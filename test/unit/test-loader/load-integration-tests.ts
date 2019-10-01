'use strict';

import { assert } from 'chai';
import { loadIntegrationTests } from '../../../src/test-loader';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    test('Should throw unimplemented error', (done) => {
        loadIntegrationTests(null, null).catch(err => {
            assert.deepEqual(err.message, 'Not yet implemented.');
            done();
        });
    });
}
