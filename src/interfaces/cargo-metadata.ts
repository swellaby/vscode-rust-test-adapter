'use strict';

import { ICargoPackage } from './cargo-package';

/**
 * Describes the metadata Cargo provides about a
 * package or packages in a workspace.
 */
export interface ICargoMetadata {
    packages: ICargoPackage[];
    workspace_members: string[];
    workspace_root: string;
}
