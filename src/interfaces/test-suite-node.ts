'use strict';

import { NodeCategory } from '../enums/node-category';
import { INodeTarget } from './node-target';

export interface ITestSuiteNode {
    id: string;
    testSpecName: string;
    testIdPrefix: string;
    childrenNodeIds: string[];
    isStructuralNode: boolean;
    packageName: string;
    category: NodeCategory;
    targets: INodeTarget[];
}
