'use strict';

import { TestInfo, TestSuiteInfo } from 'vscode-test-adapter-api';

import { ICargoTestListParser } from '../interfaces/cargo-test-list-parser';
import { ILoadedTestsResult } from '../interfaces/loaded-tests-result';

export abstract class BaseCargoTestListParser implements ICargoTestListParser {
    public abstract parseCargoTestListOutput(packageName: string, cargoOutput: string): ILoadedTestsResult;

    protected createEmptyTestSuiteInfoNode(id: string, label: string): TestSuiteInfo {
        return {
            id,
            label,
            type: 'suite',
            children: []
        };
    }

    protected createTestInfoNode(id: string, label: string): TestInfo {
        return {
            id,
            label,
            type: 'test'
        };
    }
}
