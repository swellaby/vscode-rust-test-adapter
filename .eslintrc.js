'use strict';

module.exports = {
    extends: '@swellaby/eslint-config/lib/bundles/ts-node',
    overrides: [
        {
            files: [ 'src/enums/**/*.js' ],
            rules: {
                'no-unused-vars': [ 'off' ]
            }
        }
    ]
};
