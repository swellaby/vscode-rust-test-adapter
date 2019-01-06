'use strict';

import { NodeCategory } from '../enums/node-category';
import { INodeTarget } from './node-target';

export interface ITestCaseNode {
    id: string;
    testSpecName: string;
    packageName: string;
    category: NodeCategory;
    nodeTarget: INodeTarget;
}
