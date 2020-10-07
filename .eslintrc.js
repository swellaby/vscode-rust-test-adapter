'use strict';

module.exports = {
    extends: '@swellaby/eslint-config/lib/bundles/ts-node',
    overrides: [
        {
            files: [ 'src/enums/**/*.js' ],
            rules: {
                'no-unused-vars': [ 'off' ]
            }
        },
        // https://github.com/swellaby/vscode-rust-test-adapter/pull/89#issuecomment-704637554
        {
            files: [
                'src/cargo.js',
                'src/test-loader.js',
                'test/data/tree-nodes.js'
            ],
            rules: {
                'max-len': [ 'off' ]
            }
        }
    ]
};
