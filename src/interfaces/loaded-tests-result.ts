'use strict';

import { TestSuiteInfo } from 'vscode-test-adapter-api';

export interface ILoadedTestsResult {
    rootTestSuite: TestSuiteInfo;
    testModulesMap: Map<string, TestSuiteInfo>;
    suiteOwnedTestIdsMap: Map<string, string[]>;
}
