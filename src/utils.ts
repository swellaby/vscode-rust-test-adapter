'use strict';

import { TestInfo, TestSuiteInfo } from 'vscode-test-adapter-api';

export const createEmptyTestSuiteInfoNode = (id: string, label: string): TestSuiteInfo => {
    return {
        id,
        label,
        type: 'suite',
        children: []
    };
};

export const createTestInfoNode = (id: string, label: string): TestInfo => {
    return {
        id,
        label,
        type: 'test'
    };
};
