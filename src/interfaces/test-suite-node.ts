'use strict';

import { ICargoPackage } from './cargo-package';
// import { TestSuiteInfo } from 'vscode-test-adapter-api';
import { NodeCategory } from '../enums/node-category';
// import { TargetType } from '../enums/target-type';

export interface ITestSuiteNode {
    id: string;
    childrenNodeIds: string[];
    isStructuralNode: boolean;
    associatedPackage: ICargoPackage;
    testCategory: NodeCategory;
    packageHasMultipleTargets: boolean;
    packageHasBinTargets: boolean;
    binNames: string[];
    packageHasLibTarget: boolean;
    libName: string;
    testTargetNames: string[];
}
