'use strict';

import { INodeTarget } from './node-target';

export interface ICargoTestListResult {
    output: string;
    nodeTarget: INodeTarget;
}
