const fs = require('fs')

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

        // Если списков было несколько — объединяем их
        if (Array.isArray(list[item])) {
            for (let words of list[item]) {
                listOfWords = [
                    ...listOfWords,
                    ...words.map(objectifier)
                ]
            }
        }

        // Сохраняем полученный список
        links[item] = [
            ...listOfWords,
            ...(links[item] || [])
        ]
    }

    return links
}

// Функция для превращение строкового пункта в объект --------------------------
function objectifier(item) {
    if (typeof item === 'string') {
        return { [item]: {} }
    } else if (Array.isArray(item) && typeof item[0] === 'string') {
        return { [item[0]]: item[1] || {} }
    } else {
        return item
    }
}
