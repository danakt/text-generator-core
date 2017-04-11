var makeSentence = require('./bin/makeSentence')
var getTemplate  = require('./bin/getTemplate')
var prepareLinks = require('./bin/prepareLinks')

// Функция генерации текста ----------------------------------------------------
function getText(sentenceNum, options) {
    readyLinks = prepareLinks(options.links)
    var paragraph = ''

    for (var i = 0; i < Math.min(sentenceNum, 1e7); i++) {
        var template = getTemplate(readyLinks, options.templates)
        paragraph += makeSentence(template, options.flections) + ' '
    }

    return paragraph.trim()
}

// Экспорт ---------------------------------------------------------------------
module.exports = Object.assign(getText, {
    makeSentence: makeSentence,
    getTemplate:  getTemplate,
    prepareLinks: prepareLinks
})
