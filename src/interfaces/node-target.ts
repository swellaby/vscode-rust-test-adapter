'use strict';

import { TargetType } from '../enums/target-type';

export interface INodeTarget {
    targetType: TargetType;
    targetName: string;
}
