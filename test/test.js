const fs        = require('fs')
const expect    = require('chai').expect

const getText   = require('../getText')
const { prepareLinks, getTemplate, makeSentence } = getText

const templates = require('./templates')
const flections = require('./patterns')

// Списки слов -----------------------------------------------------------------
let readFile = filename => (
    fs.readFileSync('./test/links/' + filename, 'utf-8')
)
let links = {
    НАЧ_ВВОД:   [ readFile('нач_ввод.yml') ],
    ВВОД:       [ readFile('ввод.yml') ],
    СУЩ:        [ readFile('сущ.yml') ],
    ГЛАГ:       [ readFile('глаг.yml') ],
    ПРИЛ:       [ readFile('прил.yml') ],
    ДЕЕПРИЧ:    [ readFile('дееприч.yml') ],
    КРАТК_ПРИЛ: [ readFile('кратк_прил.yml') ],
    УТВЕРЖД:    [ readFile('утвержд.yml') ],
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
