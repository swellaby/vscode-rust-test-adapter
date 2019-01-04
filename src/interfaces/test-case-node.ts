'use strict';

import { ICargoPackage } from './cargo-package';
import { TestInfo } from 'vscode-test-adapter-api';

export interface ITestCaseNode extends TestInfo {
    associatedPackage: ICargoPackage;
}
