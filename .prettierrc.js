const { config } = require('@dhis2/cli-style')
const defaultConfig = require(config.prettier)

module.exports = {
    ...defaultConfig,
    printWidth: 180,
    overrides: [
        {
            files: '**/*.yml',
            options: {
                singleQuote: false,
            },
        },
    ],
}
