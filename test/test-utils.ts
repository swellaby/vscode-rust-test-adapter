'use strict';

import * as Sinon from 'sinon';
import {
    TestEvent,
    TestLoadStartedEvent,
    TestLoadFinishedEvent,
    TestRunStartedEvent,
    TestRunFinishedEvent
} from 'vscode-test-adapter-api';
import { Log } from 'vscode-test-adapter-util';

import {
    binLoadedTestsResultStub,
    structuralNodesLoadedTestsResultStub,
    binTestCases,
    binTestCasesMapStub,
    binTestSuites,
    binTestSuitesMapStub,
    libLoadedTestsResultStub,
    libTestCases,
    libTestCasesMapStub,
    libTestSuitesMapNoRootStub,
    libTestSuitesMapStub
} from './data/tree-nodes';

import {
    swansonLibPackage
} from './data/cargo-packages';

type TestRunEvent = TestRunStartedEvent | TestRunFinishedEvent | TestEvent;
type TestLoadEvent = TestLoadStartedEvent | TestLoadFinishedEvent;

const testsEmitterStub = {
    fire: (_event: TestLoadEvent) => null,
    dispose: () => null,
    event: {}
};

const testStatesEmitterStub = {
    fire: (_event: TestRunEvent) => null,
    dispose: () => null,
    event: {}
};

const autoRunEmitterStub = {
    dispose: () => null,
    event: {}
};

const logStub = <Log>{
    info: (_message: string) => null,
    error: (_message: string) => null,
    debug: (_message: string) => null,
    warn: (_message: string) => null
};

export const rustAdapterParams = {
    logStub,
    testsEmitterStub,
    testStatesEmitterStub,
    autoRunEmitterStub
};

export const rustAdapterParamStubs = {
    log: {
        getInfoStub: () => Sinon.stub(logStub, 'info'),
        getErrorStub: () => Sinon.stub(logStub, 'error'),
        getDebugStub: () => Sinon.stub(logStub, 'debug'),
        getWarnStub: () => Sinon.stub(logStub, 'warn')
    },
    testsEmitterStubs: {
        getDisposeStub: () => Sinon.stub(testsEmitterStub, 'dispose'),
        getFireStub: () => Sinon.stub(testsEmitterStub, 'fire')
    },
    testsStatesEmitterStubs: {
        getDisposeStub: () => Sinon.stub(testStatesEmitterStub, 'dispose'),
        getFireStub: () => Sinon.stub(testStatesEmitterStub, 'fire')
    },
    autoRunEmitterStubs: {
        getDisposeStub: () => Sinon.stub(autoRunEmitterStub, 'dispose')
    }
};

export const treeNodes = {
    binLoadedTestsResultStub,
    binTestCases,
    binTestCasesMapStub,
    binTestSuites,
    binTestSuitesMapStub,
    structuralNodesLoadedTestsResultStub,
    libLoadedTestsResultStub,
    libTestCases,
    libTestCasesMapStub,
    libTestSuitesMapNoRootStub,
    libTestSuitesMapStub
};

export const cargoPackages = {
    swansonLibPackage
};
