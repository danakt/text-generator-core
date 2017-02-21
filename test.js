const makeSentence = require('./bin/makeSentence.js')
const getTemplate  = require('./bin/getTemplate')

const templates    = require('./templates')
const flections    = require('./patterns')

console.log(makeSentence(getTemplate(templates), flections))
