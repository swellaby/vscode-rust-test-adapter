'use strict';

import { ICargoPackage } from './cargo-package';
import { TestSuiteInfo } from 'vscode-test-adapter-api';
import { TestCategory } from '../enums/test-category';

export interface ITestSuiteNode extends TestSuiteInfo {
    isPackageNode: boolean;
    isStructuralNode: boolean;
    associatedPackage: ICargoPackage;
    category: TestCategory;
}
