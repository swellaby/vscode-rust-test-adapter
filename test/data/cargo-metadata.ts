'use strict';

import { packageName } from './tree-nodes';

export const singleBinTargetMetadata = {
    packages: [
      {
        name: packageName,
        version: '0.1.2',
        id: `${packageName} 0.1.2 (path+file:///usr/c//dev/${packageName})`,
        license: null,
        license_file: null,
        description: null,
        source: null,
        dependencies: [
          {
            name: 'libc',
            source: 'registry+https://github.com/rust-lang/crates.io-index',
            req: '^0.2',
            kind: null,
            rename: null,
            optional: false,
            uses_default_features: true,
            features: [],
            target: null,
            registry: null
          }
        ],
        targets: [
          {
            kind: [ 'bin' ],
            crate_types: [ 'bin' ],
            name: packageName,
            src_path: `/usr/c//dev/${packageName}/src/main.rs`,
            edition: '2018'
          }
        ],
        features: {},
        manifest_path: `/usr/c//dev/${packageName}/Cargo.toml`,
        metadata: null,
        authors: [ 'calebcartwright <opensource@swellaby.com>'],
        categories: [],
        keywords: [],
        readme: null,
        repository: null,
        edition: '2018',
        links: null
      }
    ],
    workspace_members: [ `${packageName} 0.1.2 (path+file:///usr/c//dev/${packageName})` ],
    resolve: null,
    target_directory: `/usr/c//dev/${packageName}/target`,
    version: 1,
    workspace_root: `/usr/c//dev/${packageName}`
};

export const singleBinTargetMetadataJsonString = JSON.stringify(singleBinTargetMetadata);
