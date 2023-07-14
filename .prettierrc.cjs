const { config } = require('@dhis2/cli-style')

module.exports = {
    ...require(config.prettier),
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
