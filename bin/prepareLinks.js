const fs = require('fs')

// Подготовка списков слов -----------------------------------------------------
module.exports = function prepareLinks(list) {
    // Обнуляем список
    var links = {}

    for (var item in list) {
        if (!list.hasOwnProperty(item)) {
            continue
        }

        // Подготавливаем список слов
        var listOfWords = []

        // Если списков было несколько — объединяем их
        if (Array.isArray(list[item])) {
            for (var words of list[item]) {
                ;[].push.apply(
                    listOfWords,
                    words.map(objectifier)
                )
            }
        }

        // Сохраняем полученный список
        links[item] = [].slice.call(listOfWords)
        ;[].push.apply(
            links[item],
            links[item] || []
        )
    }

    return links
}

// Функция для превращение строкового пункта в объект --------------------------
function objectifier(item) {
    if (typeof item === 'string') {
        return { [item]: {} }
    } else if (Array.isArray(item) && typeof item[0] === 'string') {
        var retObj = {}
        retObj[item[0]] = item[1] || {}
        return retObj
    } else {
        return item
    }
}
