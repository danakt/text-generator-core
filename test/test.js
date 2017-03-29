const fs        = require('fs')
const expect    = require('chai').expect

const getText   = require('../getText')
const { prepareLinks, getTemplate, makeSentence } = getText

const templates = require('./templates')
const flections = require('./patterns')

// Списки слов -----------------------------------------------------------------
let links = {
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
describe('Списки', () => {
    it('Загрузка списков', () => {
        let readyLinks = prepareLinks(links)

        for (let part in readyLinks) {
            // Каждое звено имеет не пустой массив
            expect(readyLinks[part]).to.have.length.above(0)
        }
    })
})

// Проверка генерации шаблона --------------------------------------------------
describe('Шаблон', () => {
    it('Генерация шаблона', () => {
        let readyLinks = prepareLinks(links)

        expect(getTemplate(readyLinks, templates)).to.have.length.above(0)
    })
})

// Проверка генерации шаблона --------------------------------------------------
describe('Предложение', () => {
    it('Построение предложения', () => {
        let readyLinks = prepareLinks(links)
        let objectTemplate = getTemplate(readyLinks, templates)

        expect(makeSentence(objectTemplate, flections)).a('string')
    })
})

// Генерация текста ------------------------------------------------------------
describe('Генерация текста', () => {
    let sentPattern = /[А-Я][^.?!]+[.?!]/g
    let sentNum = [1, 10, 1000, 1e4]

    for (let i = 0; i < sentNum.length; i++) {
        let itname = sentNum[i] === 1
            ? sentNum[i] + ' предложение'
            : sentNum[i] + ' предложений'

        it(itname, () => {
            let options = { links, templates, flections }
            let text = getText(sentNum[i], options)

            expect(text.match(sentPattern)).to.have.lengthOf(sentNum[i])
        })
    }
})
