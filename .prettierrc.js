const { config } = require('@dhis2/cli-style')

module.exports = {
    ...require(config.prettier),
    printWidth: 120,
    overrides: [
        {
            files: '**/*.yml',
            options: {
                singleQuote: false,
            },
        },
    ],
}
