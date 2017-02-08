const yaml = require('js-yaml')
const fs   = require('fs')
const path = require('path')

// Генерация случайного шаблона ------------------------------------------------
;(function runTime() {
    let { links, templates } = loadTemplates('./templates.yml')
    console.log(getRandomTemplate(templates))
})()

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
                if(Math.random() <= getChance(item['вероятность'])) {
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

    return { links, templates }
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
