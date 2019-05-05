'use strict';

import { assert } from 'chai';
import { TestInfo, TestSuiteInfo } from 'vscode-test-adapter-api';
import { ICargoPackage } from '../../src/interfaces/cargo-package';
import { ITestCaseNode } from '../../src/interfaces/test-case-node';
import { ITestSuiteNode } from '../../src/interfaces/test-suite-node';
import { NodeCategory } from '../../src/enums/node-category';
import { INodeTarget } from '../../src/interfaces/node-target';
import {
    createEmptyTestSuiteNode,
    createTestCaseNode,
    createTestInfo,
    createTestSuiteInfo
} from '../../src/utils';
import { TargetType } from '../../src/enums/target-type';

suite('utils', () => {
    suite('createEmptyTestSuiteNode()', () => {
        test('Should create node with correct defaults when not optional values not set', () => {
            const id = 'rusty-hook::git';
            const name = 'rusty-hook'
            const cargoPackage = <ICargoPackage>{ name };
            const node: ITestSuiteNode = createEmptyTestSuiteNode(id, cargoPackage);
            assert.deepEqual(node.id, id);
            assert.deepEqual(node.packageName, name);
            assert.deepEqual(node.childrenNodeIds, []);
            assert.deepEqual(node.targets, []);
            assert.deepEqual(node.testSpecName, '');
            assert.isFalse(node.isStructuralNode);
            assert.deepEqual(node.category, NodeCategory.unit);
        });

        test('Should set package name to undefined when the package is falsy', () => {
            const node: ITestSuiteNode = createEmptyTestSuiteNode('', undefined);
            assert.deepEqual(node.packageName, undefined);
        });

        test('Should use specified structuralNode status', () => {
            const node: ITestSuiteNode = createEmptyTestSuiteNode('', undefined, true);
            assert.isTrue(node.isStructuralNode);
        });

        test('Should use specified category', () => {
            const node: ITestSuiteNode = createEmptyTestSuiteNode('', undefined, true, NodeCategory.integration);
            assert.deepEqual(node.category, NodeCategory.integration);
        });

        test('Should use specified spec name', () => {
            const specName = 'rusty-hook::config::find_config_file_tests';
            const node: ITestSuiteNode = createEmptyTestSuiteNode('', undefined, true, NodeCategory.integration, specName);
            assert.deepEqual(node.testSpecName, specName);
        });
    });

    suite('createTestCaseNode()', () => {
        const id = 'nias';
        const packageName = 'nias';
        const nodeTarget = <INodeTarget>{
            targetName: 'nias::tests',
            targetType: TargetType.test
        };
        const nodeIdPrefix = 'foo';
        const testSpecName = 'bar';

        test('Should initialize the testSpecName with default empty string', () => {
            const node: ITestCaseNode = createTestCaseNode(id, packageName, nodeTarget, testSpecName, nodeIdPrefix);
            assert.deepEqual(node, {
                id,
                packageName,
                nodeIdPrefix,
                nodeTarget,
                testSpecName
            });
        });
    });
});
