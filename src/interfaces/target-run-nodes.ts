'use strict';

import { ITestCaseNode } from './test-case-node';
import { ITestSuiteNode } from './test-suite-node';

/**
 * Describes the sets of test case and test suite nodes to run.
 */
export interface ITargetRunNodes {
    testCases: ITestCaseNode[];
    testSuites: ITestSuiteNode[];
}
