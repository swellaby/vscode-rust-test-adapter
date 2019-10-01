'use strict';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import { swansonLibPackage } from '../../data/cargo-packages';
import { rustAdapterParams, treeNodes } from '../../test-utils';
import * as testLoader from '../../../src/test-loader';
import { NodeCategory } from '../../../src/enums/node-category';
import { createEmptyTestSuiteNode } from '../../../src/utils';

// tslint:disable-next-line:max-func-body-length
export default function suite() {
    let loadTestsForPackagesStub: Sinon.SinonStub;
    let buildRootTestSuiteInfoNodeStub: Sinon.SinonStub;
    const {
        binLoadedTestsResultStub,
        libLoadedTestsResultStub,
        structuralNodesLoadedTestsResultStub: { rootTestSuite }
    } = treeNodes;
    const loadedTestsResults = [ binLoadedTestsResultStub, libLoadedTestsResultStub ];
    const { logStub } = rustAdapterParams;
    const { loadUnitTests } = testLoader;
    const packages = [ swansonLibPackage ];
    const expUnitRootNodeId = 'unit';
    const rootTestSuiteNode = createEmptyTestSuiteNode(expUnitRootNodeId, null, true, NodeCategory.structural);
    rootTestSuiteNode.childrenNodeIds = rootTestSuite.children.map(c => c.id);
    const rootNodeInfo = { testSuiteInfo: rootTestSuite, testSuiteNode: rootTestSuiteNode };

    setup(() => {
        loadTestsForPackagesStub = Sinon.stub(testLoader, 'loadTestsForPackages').callsFake(() => Promise.resolve(loadedTestsResults));
        buildRootTestSuiteInfoNodeStub = Sinon.stub(testLoader, 'buildRootNodeInfo').callsFake(() => rootNodeInfo);
    });

    test('Should return null when loaded tests results is null', async () => {
        loadTestsForPackagesStub.callsFake(() => null);
        assert.isNull(await loadUnitTests(packages, logStub));
    });

    test('Should return null when loaded tests results is undefined', async () => {
        loadTestsForPackagesStub.callsFake(() => undefined);
        assert.isNull(await loadUnitTests(packages, logStub));
    });

    test('Should return null when loaded tests results is empty', async () => {
        loadTestsForPackagesStub.callsFake(() => []);
        assert.isNull(await loadUnitTests(packages, logStub));
    });

    test('Should return correct load result on success', async () => {
        const expected = {
            rootNode: rootTestSuite,
            results: loadedTestsResults,
            testSuiteNode: rootTestSuiteNode
        };
        const result = await loadUnitTests(packages, logStub);
        assert.deepEqual(expected, result);
        assert.isTrue(buildRootTestSuiteInfoNodeStub.calledWithExactly(loadedTestsResults.map(r => r.rootTestSuite), 'unit', 'unit'));
    });
}
