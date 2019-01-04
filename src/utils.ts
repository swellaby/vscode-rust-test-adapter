'use strict';

import { ICargoPackage } from './interfaces/cargo-package';
import { ITestCaseNode } from './interfaces/test-case-node';
import { ITestSuiteNode } from './interfaces/test-suite-node';

export const createEmptyTestSuiteNode = (id: string, label: string, cargoPackage: ICargoPackage): ITestSuiteNode => {
    return <ITestSuiteNode>{
        id,
        label,
        type: 'suite',
        children: [],
        associatedPackage: cargoPackage
    };
};

export const createTestInfoNode = (id: string, label: string, cargoPackage: ICargoPackage): ITestCaseNode => {
    return <ITestCaseNode>{
        id,
        label,
        type: 'test',
        associatedPackage: cargoPackage
    };
};
