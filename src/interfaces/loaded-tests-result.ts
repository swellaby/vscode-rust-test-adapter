'use strict';

import { ITestSuiteNode } from './test-suite-node';
import { ITestCaseNode } from './test-case-node';

export interface ILoadedTestsResult {
    rootTestSuite: ITestSuiteNode;
    testSuitesMap: Map<string, ITestSuiteNode>;
    testCasesMap: Map<string, ITestCaseNode>;
}
