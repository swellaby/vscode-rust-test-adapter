'use strict';

import { TestInfo, TestSuiteInfo } from 'vscode-test-adapter-api';

import { ICargoPackage } from './interfaces/cargo-package';
import { ICargoPackageTarget } from './interfaces/cargo-package-target';
import { ITestCaseNode } from './interfaces/test-case-node';
import { ITestSuiteNode } from './interfaces/test-suite-node';
import { NodeCategory } from './enums/node-category';
import { TargetType } from './enums/target-type';

const createSuiteNode = (
    id: string,
    label: string,
    cargoPackage: ICargoPackage,
    isStructuralNode: boolean,
    testCategory: NodeCategory
): ITestSuiteNode => {
    return <ITestSuiteNode>{
        id,
        childrenNodeIds: [],
        associatedPackage: cargoPackage,
        isStructuralNode,
        testCategory,
        packageHasMultipleTargets: false,
        packageHasLibTarget: false,
        libName: '',
        packageHasBinTargets: false,
        binNames: [],
        testTargetNames: []
    };
};

const extractTestTargetInfo = (targets: ICargoPackageTarget[], node: ITestSuiteNode) => {
    targets.forEach(target => {
        const targetKind = target.kind[0];
        if (targetKind === TargetType.test) {
            node.testTargetNames.push(target.name);
        }
    });
};

const extractPackageTargetInfo = (targets: ICargoPackageTarget[], node: ITestSuiteNode) => {
    targets.forEach(target => {
        const targetKind = target.kind[0];
        if (targetKind === TargetType.bin) {
            node.packageHasBinTargets = true;
            node.binNames.push(target.name);
        } else if (targetKind === TargetType.lib) {
            node.packageHasLibTarget = true;
            node.libName = target.name;
        }
    });
};

export const createEmptyTestSuiteNode = (
    id: string,
    label: string,
    cargoPackage: ICargoPackage,
    isStructuralNode: boolean = false,
    testCategory: NodeCategory = NodeCategory.unit
): ITestSuiteNode => {
    const node = createSuiteNode(id, label, cargoPackage, isStructuralNode, testCategory);
    if (cargoPackage && cargoPackage.targets) {
        const targets = cargoPackage.targets;
        node.packageHasMultipleTargets = targets.length > 1;

        if (node.packageHasMultipleTargets) {
            if (testCategory === NodeCategory.unit) {
                extractPackageTargetInfo(targets, node);
            } else if (testCategory === NodeCategory.integration) {
                extractTestTargetInfo(targets, node);
            }
        }
    }

    return node;
};

export const createTestCaseNode = (id: string, cargoPackage: ICargoPackage): ITestCaseNode => {
    return <ITestCaseNode>{
        id,
        associatedPackage: cargoPackage
    };
};

export const createTestSuiteInfo = (id: string, label: string): TestSuiteInfo => {
    return {
        id,
        label,
        type: 'suite',
        children: []
    };
};

export const createTestInfo = (id: string, label: string): TestInfo => {
    return {
        id,
        label,
        type: 'test'
    };
};
