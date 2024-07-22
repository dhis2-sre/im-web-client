// const { config } = require('@dhis2/cli-style')
// const defaultConfig = require(config.prettier)

// module.exports = {
//     ...defaultConfig,
//     printWidth: 180,
//     overrides: [
//         {
//             files: '**/*.yml',
//             options: {
//                 singleQuote: false,
//             },
//         },
//     ],
// }

module.exports = {
    printWidth: 80,
    tabWidth: 4,
    useTabs: false,
    semi: false,
    singleQuote: true,
    quoteProps: 'as-needed',
    jsxSingleQuote: false,
    trailingComma: 'es5',
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'always',
    rangeStart: 0,
    rangeEnd: Infinity,
    requirePragma: false,
    insertPragma: false,
    proseWrap: 'preserve',
    htmlWhitespaceSensitivity: 'css',
    endOfLine: 'lf',
    embeddedLanguageFormatting: 'auto',
    overrides: [
        {
            files: '**/*.yml',
            options: {
                singleQuote: false,
            },
        },
    ],
}
