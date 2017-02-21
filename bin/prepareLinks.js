const fs   = require('fs')
const path = require('path')
const yaml = require('js-yaml')

module.exports = function(filename) {
    let fileContent = fs.readFileSync(path.resolve('./', filename))
    let obj = yaml.safeLoad(fileContent)

    return function() {
        return obj[obj.length * Math.random() | 0]
    }
}
