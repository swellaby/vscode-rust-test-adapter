'use strict';

import { ICargoPackage } from './cargo-package';
import { TestInfo } from 'vscode-test-adapter-api';
import { TestCategory } from '../enums/test-category';

export interface ITestCaseNode extends TestInfo {
    associatedPackage: ICargoPackage;
    category: TestCategory;
}
