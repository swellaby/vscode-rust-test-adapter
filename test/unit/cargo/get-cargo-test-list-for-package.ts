'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import * as cargo from '../../../src/cargo';
import { rustAdapterParams, cargoPackages } from '../../test-utils';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let logDebugStub: Sinon.SinonStub;
    let getCargoTestListOutputStub: Sinon.SinonStub;
    const { logStub } = rustAdapterParams;
    const { swansonLibPackage } = cargoPackages;

    setup(function () {
        getCargoTestListOutputStub = Sinon.stub(cargo, 'getCargoTestListOutput').callsFake(() => Promise.resolve(''));
        logDebugStub = this.test.ctx.logDebugStub;
    });

    test('Should handle null package parameter correctly', async () => {
        try {
            await cargo.getCargoTestListForPackage(null, logStub);
            assert.fail('Should have thrown');
        } catch (err) {
            assert.deepEqual(err.message, 'Invalid value specified for parameter `cargoPackage`. Unable to load tests for null/undefined package.');
        }
    });

    test('Should handle undefined package parameter correctly', async () => {
        try {
            await cargo.getCargoTestListForPackage(undefined, logStub);
            assert.fail('Should have thrown');
        } catch (err) {
            assert.deepEqual(err.message, 'Invalid value specified for parameter `cargoPackage`. Unable to load tests for null/undefined package.');
        }
    });

    test('Should handle thrown exception correctly', async () => {
        const error = new Error(':(');
        getCargoTestListOutputStub.callsFake(() => Promise.reject(error));

        try {
            await cargo.getCargoTestListForPackage(swansonLibPackage, logStub);
            assert.fail('Should have thrown');
        } catch (err) {
            assert.isTrue(logDebugStub.calledWith(error));
            assert.deepEqual(err.message, `Failed to load tests for package: ${swansonLibPackage.name}.`);
        }
    });
}
