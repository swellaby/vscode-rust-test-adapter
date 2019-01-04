'use strict';

import { ICargoPackage } from './cargo-package';
import { TestSuiteInfo } from 'vscode-test-adapter-api';

export interface ITestSuiteNode extends TestSuiteInfo {
    isPackageLevelNode: boolean;
    isStructuralNode: boolean;
    associatedPackage: ICargoPackage;
}
