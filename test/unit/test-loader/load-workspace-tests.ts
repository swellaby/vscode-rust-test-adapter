'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import { swansonLibPackage } from '../../data/cargo-packages';
import { rustAdapterParams } from '../../test-utils';
import * as testLoader from '../../../src/test-loader';
import * as cargo from '../../../src/cargo';
import {
    singleBinTargetMetadata
} from '../../data/cargo-metadata';
import { IConfiguration } from '../../../src/interfaces/configuration';
import { ICargoPackage } from '../../../src/interfaces/cargo-package';
import { ICargoMetadata } from '../../../src/interfaces/cargo-metadata';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let loadUnitTestsStub: Sinon.SinonStub;
    let getCargoMetadataStub: Sinon.SinonStub;
    const { loadWorkspaceTests } = testLoader;
    const { logStub } = rustAdapterParams;
    const packages = [swansonLibPackage];

    setup(() => {
        loadUnitTestsStub = Sinon.stub(testLoader, 'loadUnitTests');
        getCargoMetadataStub = Sinon.stub(cargo, 'getCargoMetadata').callsFake(() => Promise.resolve(<ICargoMetadata>{ packages: [] }));
    });

    test('Should handle no found tests correctly', async () => {
        loadUnitTestsStub.callsFake(() => null);
        assert.isNull(await loadWorkspaceTests('', logStub, <IConfiguration>{}));
    });
}
