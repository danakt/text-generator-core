const yaml = require('js-yaml')
const fs   = require('fs')
const path = require('path')

// Генерация случайного шаблона ------------------------------------------------
;(function runTime() {
    let { templates, links } = loadTemplates('./templates.yml')

    let template = getRandomTemplate(templates)
    let sentence = fillTemplate(template, links)

    console.log(sentence)
})()

/** ----------------------------------------------------------------------------
 * Подстановка случайных слов из списка в шаблон
 * @param  {string} template Шаблон для подстановки
 * @param  {Map}    links    Списки слов
 * @return {string}          Готвое предложение
 */

function fillTemplate(template, links) {
    let newTemplate = template
    let splittedTemplate = template.split(' ')
    for (var i = 0; i < splittedTemplate.length; i++) {
        let splittedTemplateRp = splittedTemplate[i].replace(/[^_А-я]/g, '')
        if (!links.has(splittedTemplateRp)) continue

        // Получаем случайное слово из списка
        let words = links.get(splittedTemplateRp)
        let randomWord = words[Math.random() * words.length | 0]

        if (/->$/g.test(splittedTemplate[i])) {
            // Здесь нужно будет склонять и менять род прилагательного,
            // в зависимости от следующего существительного
            splittedTemplate[i] = splittedTemplate[i].slice(0, -2)
        } else if (/^<-/g.test(splittedTemplate[i])) {
            // Здесь — в зависимости от предыдущего
            splittedTemplate[i] = splittedTemplate[i].slice(2)
        }

        // Удаляем комментарии
        randomWord = randomWord.replace(/\s+?\#.*$/, '')

        // Вставляем полученное слово в шаблон
        let escapedRegExp = splittedTemplateRp
            .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
        let regExp = new RegExp(escapedRegExp)
        newTemplate = newTemplate.replace(regExp, randomWord)
    }

    return cleanSentence(newTemplate)
}

/** ----------------------------------------------------------------------------
 * Получение случайного шаблона для предложения
 * @param  {Object} templates Объект с шаблоном и вариантами подстановки
 * @return {string}           Готовый шаблон для предложения
 */

function getRandomTemplate(templates) {
    // Получение случайного шаблона
    let templatesKeys = Object.keys(templates)
    let choice = templatesKeys[Math.random() * templatesKeys.length | 0]
    let list = templates[choice]

    // Постройка шаблона по списку перечисленных правил
    let splittedTemplate = choice.split(' ')
    tplLoop: for (let i = 0; i < splittedTemplate.length; i++) {
        let template = splittedTemplate[i]

        if (!list.hasOwnProperty(template)) continue
        let parts = [...list[template]]

        // Если есть настройки вероятности для данного шаблона
        // пропускаем этот шаблон случайным образом
        for (let item of parts) {
            if(typeof item === 'object' && item['вероятность'] != null) {
                if(Math.random() > getChance(item['вероятность'])) {
                    delete splittedTemplate[i]
                    continue tplLoop
                }
            }
        }

        // Удаляем объект с настройками
        parts = parts.filter(item => typeof item !== 'object')
        // Делаем случайную замену в шаблоне предложения
        splittedTemplate[i] = parts[Math.random() * parts.length | 0]
    }

    // Возврвщаем полученный шаблон
    let newTemplate = splittedTemplate.join(' ').trim()
    return newTemplate
}

/** Загрузка списков -----------------------------------------------------------
 * @arg    {string}    filename yaml-файл с описанием шаблонов для генерации
 * @return {object}
 *     @param {Map}    links Списки слов для шаблонов
 *     @param {object} templates Шаблоны
 */

function loadTemplates(filename) {
    let links = new Map()
    let templates

    yaml.safeLoadAll(fs.readFileSync(filename, 'utf8'), obj => {
        // Если это блок с манифестом,
        // импортируем списки слов в звенья
        let mainfest = 'манифест'
        if(obj[mainfest] != null) {
            for (let tpl in obj[mainfest]) {
                // Подгрузка файла и разбиение на массив
                let filename = path.resolve(__dirname, obj[mainfest][tpl])
                let file = fs.readFileSync(filename, 'utf8')
                let list = file.split(/\n|\r\n/).filter(Boolean)

                // Сохранение массива в звено
                links.set(tpl, list)
            }
        } else {
            // Получаем объект с шаблонами
            templates = obj
        }
    })

    return { templates, links }
}

/** ----------------------------------------------------------------------------
 * Приведение предложения к нормальному виду
 * @param  {string} string Предложение
 * @return {string}        Подготовленное предложение
 */
function cleanSentence(string) {
    // Удаляем от ненужных пробелов
    string = string.trim()
    // Ставим заглавную букву в начале предложения
    string = string[0].toUpperCase() + string.substr(1)
    // Добавляем точку в конец предложения
    if (!/[.!?]$/.test(string)) {
        string = string + '.'
    }

    return string
        // Удаляем пробелы перед знаками препинания
        .replace(/\s+([.,!?])(\s+?)/g, '$1$2')
        // Удаляем двойные пробелы
        .replace(/\s\s+/g, ' ')
        // Удаляем двойные запятые
        .replace(/,,+/g, ',')
        // Удаление стрелок
        .replace(/\s+<-|->\s+/g, ' ')
}

/** ----------------------------------------------------------------------------
 * Получение числа вероятности из настроек
 * @param  {string} string Строка из настроек
 * @return {float}         Вероятность
 */

function getChance(string) {
    return typeof string === 'string' && string.indexOf('/') > -1
        ? string.split('/').reduce((prev, cur) => prev / cur)
        : +string || 1
}
