'use strict';

module.exports = {
    extends: '@swellaby/eslint-config/lib/bundles/ts-node',
    overrides: [
        {
            files: [ 'generators/**/*.js' ],
            rules: {
                quotes: [ 'off' ]
            }
        },
        {
            files: [ 'src/enums/**/*.js' ],
            rules: {
                'no-unused-vars': [ 'off' ]
            }
        }
    ]
};
