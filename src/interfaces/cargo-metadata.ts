'use strict';

import { ICargoPackage } from './cargo-package';

export interface ICargoMetadata {
    packages: ICargoPackage[];
}
