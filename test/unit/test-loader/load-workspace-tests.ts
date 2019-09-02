'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import { swansonLibPackage } from '../../data/cargo-packages';
import { rustAdapterParams, treeNodes } from '../../test-utils';
import * as testLoader from '../../../src/test-loader';
import * as cargo from '../../../src/cargo';
import { IConfiguration } from '../../../src/interfaces/configuration';
import { ICargoMetadata } from '../../../src/interfaces/cargo-metadata';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let getTestLoadersStub: Sinon.SinonStub;
    let getCargoMetadataStub: Sinon.SinonStub;
    let buildWorkspaceLoadedTestsResultStub: Sinon.SinonStub;
    let logDebugStub: Sinon.SinonStub;
    const { loadWorkspaceTests } = testLoader;
    const { logStub } = rustAdapterParams;
    const { binLoadedTestsResultStub, libRootTestSuiteInfo, binTestSuites } = treeNodes;
    const packages = [swansonLibPackage];
    const workspaceRoot = 'foo/bar';
    const loadUnitTestsResults = {
        results: [ binLoadedTestsResultStub ],
        rootNode: libRootTestSuiteInfo,
        testSuiteNode: binTestSuites[0]
    };

    setup(function () {
        getCargoMetadataStub = Sinon.stub(cargo, 'getCargoMetadata').callsFake(() => Promise.resolve(<ICargoMetadata>{ packages }));
        buildWorkspaceLoadedTestsResultStub = Sinon.stub(testLoader, 'buildWorkspaceLoadedTestsResult').callsFake(() => binLoadedTestsResultStub);
        Sinon.stub(testLoader, 'loadUnitTests').callsFake(() => Promise.resolve(loadUnitTestsResults));
        getTestLoadersStub = Sinon.stub(testLoader, 'getTestLoaders').callsFake(() => [ testLoader.loadUnitTests(packages, logStub) ]);
        logDebugStub = this.test.ctx.logDebugStub;
    });

    test('Should correctly handle thrown exception', async () => {
        const expErr = new Error('crashed');
        getCargoMetadataStub.throws(expErr);
        try {
            await loadWorkspaceTests(workspaceRoot, logStub, <IConfiguration>{});
            assert.fail('Should have thrown');
        } catch (err) {
            const baseErrorMessage = `Fatal error while attempting to load tests for workspace ${workspaceRoot}`;
            assert.isTrue(logDebugStub.calledWithExactly(`${baseErrorMessage}. Details: ${expErr}`));
            assert.deepEqual(err, expErr);
        }
    });

    test('Should return null when cargo packages is null', async () => {
        getCargoMetadataStub.callsFake(() => <ICargoMetadata>{ packages: null });
        assert.isNull(await loadWorkspaceTests(workspaceRoot, logStub, <IConfiguration>{}));
    });

    test('Should return null when cargo packages is undefined', async () => {
        getCargoMetadataStub.callsFake(() => <ICargoMetadata>{ packages: undefined });
        assert.isNull(await loadWorkspaceTests(workspaceRoot, logStub, <IConfiguration>{}));
    });

    test('Should return null when cargo packages is empty', async () => {
        getCargoMetadataStub.callsFake(() => <ICargoMetadata>{ packages: [] });
        assert.isNull(await loadWorkspaceTests(workspaceRoot, logStub, <IConfiguration>{}));
    });

    test('Should return correct result', async () => {
        const config = <IConfiguration> {
            loadDocumentationTests: false,
            loadIntegrationTests: false,
            loadUnitTests: true
        };
        const loadedTestsResult = await loadWorkspaceTests(workspaceRoot, logStub, config);
        assert.isTrue(getCargoMetadataStub.calledWithExactly(workspaceRoot, logStub));
        assert.isTrue(getTestLoadersStub.calledWithExactly(packages, logStub, config));
        assert.isTrue(buildWorkspaceLoadedTestsResultStub.calledWithExactly([ loadUnitTestsResults ]));
        assert.deepEqual(loadedTestsResult, binLoadedTestsResultStub);
    });
}
