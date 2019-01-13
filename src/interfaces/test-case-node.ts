'use strict';

import { NodeCategory } from '../enums/node-category';
import { INodeTarget } from './node-target';

export interface ITestCaseNode {
    id: string;
    testSpecName: string;
    nodeIdPrefix: string;
    packageName: string;
    category: NodeCategory;
    nodeTarget: INodeTarget;
}
