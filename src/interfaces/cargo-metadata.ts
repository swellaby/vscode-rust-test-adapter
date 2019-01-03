'use strict';

import { IPackage } from './package';

export interface ICargoMetadata {
    packages: IPackage[];
    workspace_members: string[];
    workspace_root: string;
}
