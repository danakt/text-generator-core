const fs   = require('fs')
const path = require('path')
const yaml = require('js-yaml')

module.exports = function(filename) {
    let outputLinks = []

    for (arg of arguments) {
        let fileContent = fs.readFileSync(path.resolve('./', arg))
        let obj = yaml.safeLoad(fileContent)

        outputLinks = [
            ...outputLinks,
            ...obj
        ]
    }

    return function() {
        return outputLinks[outputLinks.length * Math.random() | 0]
    }
}
