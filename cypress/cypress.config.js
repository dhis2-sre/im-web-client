const { defineConfig } = require('cypress')
const fs = require('fs')

module.exports = defineConfig({
    e2e: {
        videosFolder: 'videos/',
        videoUploadOnPasses: false,
        supportFile: false,
        specPattern: './**/*.cy.{js,jsx,ts,tsx}',
        setupNodeEvents(on) {
            const filesToDelete = []
            on('after:spec', (spec, results) => {
                if (results.stats.failures === 0 && results.video) {
                    filesToDelete.push(results.video)
                }
            })
            on('after:run', async () => {
                filesToDelete.forEach((path) => {
                    fs.unlink(path, (err) => {
                        if (err) {
                            console.error(err)
                            return
                        }
                        console.log('Successfully deleted passing test video ' + path)
                    })
                })
            })
        },
    },
})
