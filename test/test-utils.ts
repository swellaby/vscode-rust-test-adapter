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

import * as dataTreeNodes from './data/tree-nodes';
import * as testResultOutputs from './data/test-run-outputs';

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

export const treeNodes = dataTreeNodes;

export const cargoPackages = {
    swansonLibPackage
};

export const testRunOutputs = testResultOutputs;
