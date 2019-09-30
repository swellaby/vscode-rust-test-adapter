'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import { swansonLibPackage } from '../../data/cargo-packages';
import {
    rustAdapterParams,
    treeNodes
} from '../../test-utils';
import { loadPackageUnitTestTree } from '../../../src/test-loader';
import { ICargoTestListResult } from '../../../src/interfaces/cargo-test-list-result';
import * as cargo from '../../../src/cargo';
import * as testListParser from '../../../src/parsers/test-list-parser';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let getCargoUnitTestListForPackageStub: Sinon.SinonStub;
    let parseCargoTestListResultsStub: Sinon.SinonStub;
    let logDebugStub: Sinon.SinonStub;
    const { logStub } = rustAdapterParams;
    const { binLoadedTestsResultStub } = treeNodes;

    setup(function () {
        getCargoUnitTestListForPackageStub = Sinon.stub(cargo, 'getCargoUnitTestListForPackage');
        parseCargoTestListResultsStub = Sinon.stub(testListParser, 'parseCargoTestListResults');
        logDebugStub = this.test.ctx.logDebugStub;
    });

    test('Should handle error correctly', async () => {
        const expErr = new Error('load failed');
        getCargoUnitTestListForPackageStub.throws(() => expErr);
        try {
            await loadPackageUnitTestTree(swansonLibPackage, logStub);
            assert.fail('Should have thrown');
        } catch (err) {
            const baseErrorMessage = `Fatal error while attempting to load unit tests for package: ${swansonLibPackage.name}`;
            assert.isTrue(logDebugStub.calledWithExactly(`${baseErrorMessage}. Details: ${expErr}`));
            assert.deepEqual(err, expErr);
        }
    });

    test('Should correctly load tree', async () => {
        const cargoTestListResults: ICargoTestListResult[] = [];
        getCargoUnitTestListForPackageStub.callsFake(() => cargoTestListResults);
        parseCargoTestListResultsStub.callsFake(() => binLoadedTestsResultStub);
        const result = await loadPackageUnitTestTree(swansonLibPackage, logStub);
        assert.deepEqual(result, binLoadedTestsResultStub);
        assert.isTrue(getCargoUnitTestListForPackageStub.calledWithExactly(swansonLibPackage, logStub));
        assert.isTrue(parseCargoTestListResultsStub.calledWithExactly(swansonLibPackage, cargoTestListResults));
    });
}
