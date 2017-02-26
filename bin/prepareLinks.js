const fs   = require('fs')
const yaml = require('js-yaml')

// Подготовка списков слов -----------------------------------------------------
module.exports = function prepareLinks(list) {
    // Обнуляем список
    let links = {}

    for (let item in list) {
        if (!list.hasOwnProperty(item)) {
            continue
        }

        // Подготавливаем список слов
        let listOfWords = []

        // Если списков было несколько — объединяем их и
        if (typeof list[item] !== 'string' && Array.isArray(list[item])) {
            for (var i = 0; i < list[item].length; i++) {
                listOfWords = [
                    ...listOfWords,
                    ...yaml.safeLoad(list[item][i]).map(objectifier)
                ]
            }
        } else
        // Если список один — парсим их сразу
        if (typeof list[item] === 'string') {
            listOfWords = yaml.safeLoad(list[item]).map(objectifier)
        }

        // Сохраняем полученный список
        if (links[item] != null) {
            links[item] = [
                ...links[item],
                ...listOfWords,
            ]
        } else {
            links[item] = listOfWords
        }
    }

    return links
}

// Функция для превращение строкового пункта в объект --------------------------
function objectifier(item) {
    return typeof item === 'string'
        ? { [item]: {} }
        : item
}
