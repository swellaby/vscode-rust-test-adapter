'use strict';

import * as Sinon from 'sinon';
import {
    TestEvent,
    TestLoadStartedEvent,
    TestLoadFinishedEvent,
    TestRunStartedEvent,
    TestRunFinishedEvent,
    TestSuiteInfo
} from 'vscode-test-adapter-api';
import { Log } from 'vscode-test-adapter-util';

import { ILoadedTestsResult } from '../src/interfaces/loaded-tests-result';
import { ITestSuiteNode } from '../src/interfaces/test-suite-node';
import { ITestCaseNode } from '../src/interfaces/test-case-node';

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

export const testCasesMapStub: Map<string, ITestCaseNode> = new Map<string, ITestCaseNode>();
export const testSuitesMapStub: Map<string, ITestSuiteNode> = new Map<string, ITestSuiteNode>();

export const loadedTestsResultStub = <ILoadedTestsResult>{
    rootTestSuite: <TestSuiteInfo>{

    },
    testCasesMap: testCasesMapStub,
    testSuitesMap: testSuitesMapStub
};
