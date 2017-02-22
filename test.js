const makeSentence = require('./bin/makeSentence.js')
const getTemplate  = require('./bin/getTemplate')

const templates    = require('./templates')
const flections    = require('./patterns')

function getRandomtext(sentenceNum) {
    let paragraph = ''

    for (var i = 0; i < sentenceNum; i++) {
        paragraph += makeSentence(getTemplate(templates()), flections) + ' '
    }

    return paragraph.trim()
}

console.log(getRandomtext(10))
