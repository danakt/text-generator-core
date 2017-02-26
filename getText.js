const makeSentence = require('./bin/makeSentence.js')
const getTemplate  = require('./bin/getTemplate')
const prepareLinks = require('./bin/prepareLinks')

// Функция генерации текста ----------------------------------------------------
module.exports = function(sentenceNum, { links, templates, flections }) {
    readyLinks = prepareLinks(links)
    let paragraph = ''

    for (let i = 0; i < Math.min(sentenceNum, 1e7); i++) {
        let template = getTemplate(readyLinks, templates)
        paragraph += makeSentence(template, flections) + ' '
    }

    return paragraph.trim()
}
