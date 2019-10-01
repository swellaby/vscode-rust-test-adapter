'use strict';

import { ICargoPackage } from '../../src/interfaces/cargo-package';
import { ICargoPackageTarget } from '../../src/interfaces/cargo-package-target';

export const swansonLibPackage = <ICargoPackage>{
    manifest_path: '/foo/bar/Cargo.toml',
    name: 'swanson',
    targets: [
        <ICargoPackageTarget> {
            kind: [ 'lib' ],
            name: 'swanson'
        },
        <ICargoPackageTarget> {
            kind: [ 'bin' ],
            name: 'ron'
        }
    ]
};
