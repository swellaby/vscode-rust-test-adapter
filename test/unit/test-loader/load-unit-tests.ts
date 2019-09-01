'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import { swansonLibPackage } from '../../data/cargo-packages';
import { rustAdapterParams } from '../../test-utils';
import * as testLoader from '../../../src/test-loader';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let loadTestsForPackagesStub: Sinon.SinonStub;
    let buildRootTestSuiteInfoNodeStub: Sinon.SinonStub;
    const { logStub } = rustAdapterParams;
    const { loadUnitTests } = testLoader;
    const packages = [swansonLibPackage];

    setup(() => {
        loadTestsForPackagesStub = Sinon.stub(testLoader, 'loadTestsForPackages');
        buildRootTestSuiteInfoNodeStub = Sinon.stub(testLoader, 'buildRootTestSuiteInfoNode');
    });

    test('Should handle no found tests correctly', async () => {
        loadTestsForPackagesStub.callsFake(() => []);
        assert.isNull(await loadUnitTests(packages, logStub));
    });
}
