var fs        = require('fs')
var expect    = require('chai').expect

var getText   = require('../')
var templates = require('./templates')
var flections = require('./patterns')

// Списки слов -----------------------------------------------------------------
var links = {
    НАЧ_ВВОД:   [ require('./links/нач_ввод') ],
    ВВОД:       [ require('./links/ввод') ],
    СУЩ:        [ require('./links/сущ') ],
    ГЛАГ:       [ require('./links/глаг') ],
    ПРИЛ:       [ require('./links/прил') ],
    ДЕЕПРИЧ:    [ require('./links/дееприч') ],
    КРАТК_ПРИЛ: [ require('./links/кратк_прил') ],
    УТВЕРЖД:    [ require('./links/утвержд') ],
}

// Проверка списков ------------------------------------------------------------
describe('Списки', function() {
    it('Загрузка списков', function() {
        var readyLinks = getText.prepareLinks(links)

        for (var part in readyLinks) {
            // Каждое звено имеет не пустой массив
            expect(readyLinks[part]).to.have.length.above(0)
        }
    })
})

// Проверка генерации шаблона --------------------------------------------------
describe('Шаблон', function() {
    it('Генерация шаблона', function() {
        var readyLinks = getText.prepareLinks(links)
        var text = getText.getTemplate(readyLinks, templates)
        expect(text).to.have.length.above(0)
    })
})

// Проверка генерации шаблона --------------------------------------------------
describe('Предложение', function() {
    it('Построение предложения', function() {
        var readyLinks = getText.prepareLinks(links)
        var objectTemplate = getText.getTemplate(readyLinks, templates)
        var text = getText.makeSentence(objectTemplate, flections)
        expect(text).a('string')
    })
})

// Генерация текста ------------------------------------------------------------
describe('Генерация текста', function() {
    var sentPattern = /[А-Я][^.?!]+[.?!]/g
    var sentNum = [1, 10, 1000, 1e4]

    for (var i = 0; i < sentNum.length; i++) {
        var itname = sentNum[i] === 1
            ? sentNum[i] + ' предложение'
            : sentNum[i] + ' предложений'

        it(itname, (function(num) {
            var options = {
                links:     links,
                templates: templates,
                flections: flections
            }

            var text = getText(num, options)
            expect(text.match(sentPattern)).to.have.lengthOf(num)
        }).bind(null, sentNum[i]))
    }
})
