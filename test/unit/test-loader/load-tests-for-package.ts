'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import { swansonLibPackage } from '../../data/cargo-packages';
import { rustAdapterParams, treeNodes } from '../../test-utils';
import * as testLoader from '../../../src/test-loader';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    const { logStub } = rustAdapterParams;
    const packages = [swansonLibPackage];
    const { loadTestsForPackages } = testLoader;
    const { binLoadedTestsResultStub, libLoadedTestsResultStub } = treeNodes;
    let loadPackageUnitTestTreeStub: Sinon.SinonStub;

    setup(() => {
        loadPackageUnitTestTreeStub = Sinon.stub(testLoader, 'loadPackageUnitTestTree').callsFake(() => Promise.resolve(undefined));
    });

    test('Should return empty array when no tests found', async () => {
        const results = await loadTestsForPackages(packages, logStub, testLoader.loadPackageUnitTestTree);
        assert.deepEqual(results, []);
    });

    test('Should return correct results when tests found', async () => {
        loadPackageUnitTestTreeStub.onSecondCall().callsFake(() => binLoadedTestsResultStub);
        loadPackageUnitTestTreeStub.onThirdCall().callsFake(() => libLoadedTestsResultStub);
        // Simulate a workspace with three packages to validate proper filtering of packages with no test.
        // At the time of the creation of this test there was only one dummy package object, hence the below array.
        const multiplePackages = [ swansonLibPackage, swansonLibPackage, swansonLibPackage ];
        const results = await loadTestsForPackages(multiplePackages, logStub, testLoader.loadPackageUnitTestTree);
        assert.deepEqual(results, [ binLoadedTestsResultStub, libLoadedTestsResultStub ]);
    });
}
