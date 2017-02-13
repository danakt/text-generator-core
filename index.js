const yaml    = require('js-yaml')
const fs      = require('fs')
const path    = require('path')
// Экспорт ---------------------------------------------------------------------
module.exports = {
    loadTemplates,
    loadLinks,
    getRandomTemplate,
    fillTemplate,
    inflectWords,
    cleanSentence,
    getFlections,
}

/** ----------------------------------------------------------------------------
 * Изменение родов слов
 * @param  {string} sentence Предложение со словами, требующими изменения рода
 * @return {string}          Обработанное предложение
 */
function inflectWords(sentence, flections) {
    let splittedSentence = sentence.split(' ')

    for (let i = 0; i < splittedSentence.length; i++) {
        if (!/^<-|->$/g.test(splittedSentence[i])) {
            continue
        }

        // Смена рода прилагательного в зависимости
        // от следующего или предыдущего существительного
        let keyWordIndex = i
        if (/->$/g.test(splittedSentence[i])) {
            keyWordIndex++
        } else if (/^<-/g.test(splittedSentence[i])) {
            keyWordIndex--
        }

        // Если в ключевом слове нет указания рода, ничего не делаем
        if (/[А-я]#[мжс]/.test(splittedSentence[keyWordIndex]) === false) {
            continue
        }
        // Получаем род для изменения окончания
        let gender = splittedSentence[keyWordIndex]
            .replace(/[^#]*#([^\s]*)/, '$1')

        // Меняем окончание
        splittedSentence[i] = splittedSentence[i].replace(/^<-|->$/g, '')
        splittedSentence[i] = setInflect(splittedSentence[i], gender, flections)
    }

    let newSentence = splittedSentence.join(' ')
    newSentence = newSentence.replace(/([А-я])\s?#\s?[мжс]([^А-я]|$)/g, '$1$2')

    return newSentence.replace(/\s+<-|->\s+/g, ' ')
}

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

        // Приклеиваем комментарии с родом
        randomWord = randomWord.replace(/\s+?\#\s+?(.*)$/, '#$1')

        // Вставляем полученное слово в шаблон
        let escapedRegExp = splittedTemplateRp
            .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
        let regExp = new RegExp(escapedRegExp)
        newTemplate = newTemplate.replace(regExp, randomWord)
    }

    return newTemplate
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

/** Загрузка шаблоно -----------------------------------------------------------
 * @arg    {string} filename YAML-файл с описанием шаблонов для генерации
 * @return {object}          Шаблоны
 */

function loadTemplates(templatesFile) {
    let templatesFileContent = fs.readFileSync(templatesFile, 'utf8')
    templates = yaml.safeLoad(templatesFileContent)

    return templates
}

/** ----------------------------------------------------------------------------
 * Загрузка списка слов для использования
 * @param  {string} manifestFile Файл манифеста
 * @return {Map}                 Списки слов
 */

function loadLinks(manifestFile) {
    let links    = new Map()
    let manifest = yaml.safeLoad(fs.readFileSync(manifestFile, 'utf8'))

    for (let tpl in manifest) {
        // Подгрузка файла и разбиение на массив
        let filename = path.resolve(__dirname, manifest[tpl])
        let file = fs.readFileSync(filename, 'utf8')
        let list = file.split(/\n|\r\n/).filter(Boolean)

        // Сохранение массива в звено
        links.set(tpl, list)
    }

    return links
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
}

/** ----------------------------------------------------------------------------
 * Получени списка окончаний
 * @param  {string} filename Название файла
 * @return {object}          Объет со списком окончаний
 */

function getFlections(filename) {
    return yaml.safeLoad(fs.readFileSync(filename, 'utf8'))
}

/** ----------------------------------------------------------------------------
 * Изменение окончания
 * @param  {string} stringToInflect Выходное слово
 * @param  {string} gender          Род
 * @param  {object} flections       Объект со списком окончаний
 * @return {string}                 Изменённое слово
 */

function setInflect(stringToInflect, gender, flections) {
    let newString = stringToInflect.trim()
    gender = gender.replace(/[^А-я0-9]/g, '')

    for (let item in flections) {
        if (!flections.hasOwnProperty(item)) {
            continue
        }

        let regExp = new RegExp(item)
        if (regExp.test(newString)) {
            newString = newString.replace(regExp, flections[item][gender])

            break
        }
    }

    return newString
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
