'use strict';

import { ICargoPackageTarget } from './cargo-package-target';

/**
 * Describes a Cargo package.
 */
export interface ICargoPackage {
    name: string;
    targets: ICargoPackageTarget[];
    manifest_path: string;
}
