'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import { swansonLibPackage } from '../../data/cargo-packages';
import { rustAdapterParams } from '../../test-utils';
import * as testLoader from '../../../src/test-loader';
import { IConfiguration } from '../../../src/interfaces/configuration';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    const { logStub } = rustAdapterParams;
    const packages = [swansonLibPackage];
    let loadUnitTestsStub: Sinon.SinonStub;
    let loadDocumentationTestsStub: Sinon.SinonStub;
    let loadIntegrationTestsStub: Sinon.SinonStub;
    const { getTestLoaders } = testLoader;

    setup(() => {
        loadUnitTestsStub = Sinon.stub(testLoader, 'loadUnitTests').callsFake(() => Promise.resolve(null));
        loadDocumentationTestsStub = Sinon.stub(testLoader, 'loadDocumentationTests').callsFake(() => Promise.resolve(null));
        loadIntegrationTestsStub = Sinon.stub(testLoader, 'loadIntegrationTests').callsFake(() => Promise.resolve(null));
    });

    test('Should return empty array when no all test types are disabled', () => {
        const config = <IConfiguration> {
            loadDocumentationTests: false,
            loadIntegrationTests: false,
            loadUnitTests: false
        };
        const results = getTestLoaders(packages, logStub, config);
        assert.deepEqual(results, []);
        assert.isFalse(loadDocumentationTestsStub.called);
        assert.isFalse(loadIntegrationTestsStub.called);
        assert.isFalse(loadUnitTestsStub.called);
    });

    test('Should include doc tests when enabled', () => {
        const config = <IConfiguration> {
            loadDocumentationTests: true
        };
        const results = getTestLoaders(packages, logStub, config);
        assert.deepEqual(results.length, 1);
        assert.isTrue(loadDocumentationTestsStub.called);
    });

    test('Should include integration tests when enabled', () => {
        const config = <IConfiguration> {
            loadIntegrationTests: true
        };
        const results = getTestLoaders(packages, logStub, config);
        assert.deepEqual(results.length, 1);
        assert.isTrue(loadIntegrationTestsStub.called);
    });

    test('Should include unit tests when enabled', () => {
        const config = <IConfiguration> {
            loadUnitTests: true
        };
        const results = getTestLoaders(packages, logStub, config);
        assert.deepEqual(results.length, 1);
        assert.isTrue(loadUnitTestsStub.called);
    });
}
