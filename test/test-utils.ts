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
    loadedTestsResultStub,
    structuralNodesLoadedTestsResultStub,
    testCases,
    testCasesMapStub,
    testSuites,
    testSuitesMapStub
} from './data/tree-nodes';

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
    error: (_message: string) => null
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
        getErrorStub: () => Sinon.stub(logStub, 'error')
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
    loadedTestsResultStub,
    testCases,
    testCasesMapStub,
    testSuites,
    testSuitesMapStub,
    structuralNodesLoadedTestsResultStub
};
