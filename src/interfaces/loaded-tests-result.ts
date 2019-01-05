'use strict';

import { TestSuiteInfo } from 'vscode-test-adapter-api';
import { ITestSuiteNode } from './test-suite-node';
import { ITestCaseNode } from './test-case-node';

export interface ILoadedTestsResult {
    rootTestSuite: TestSuiteInfo;
    testSuitesMap: Map<string, ITestSuiteNode>;
    testCasesMap: Map<string, ITestCaseNode>;
}
