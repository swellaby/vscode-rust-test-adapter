'use strict';

import { assert } from 'chai';
import { Log } from 'vscode-test-adapter-util';

import { swansonLibPackage } from '../../data/cargo-packages';
import { rustAdapterParams } from '../../test-utils';
import { loadTestsForPackages } from '../../../src/test-loader';
import { ICargoPackage } from '../../../src/interfaces/cargo-package';
import { ILoadedTestsResult } from '../../../src/interfaces/loaded-tests-result';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    const { logStub } = rustAdapterParams;
    const packages = [swansonLibPackage];

    test('Should return empty array when no tests found', async () => {
        const loader = async (_cargoPackage: ICargoPackage, _log: Log) => {
            return Promise.resolve(undefined);
        };
        const results = await loadTestsForPackages(packages, logStub, loader);
        assert.deepEqual(results, []);
    });
}
