'use strict';

import { ICargoPackage } from './cargo-package';
// import { TestInfo } from 'vscode-test-adapter-api';
import { NodeCategory } from '../enums/node-category';

export interface ITestCaseNode {
    id: string;
    associatedPackage: ICargoPackage;
    // category: NodeCategory;
}
