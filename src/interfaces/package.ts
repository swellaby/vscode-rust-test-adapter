'use strict';

import { ITarget } from './target';

export interface IPackage {
    name: string;
    targets: ITarget[];
}
