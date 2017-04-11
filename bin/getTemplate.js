// Построение объектного шаблона предложения -----------------------------------
module.exports = function getTemplate(links, templates) {
    // Получение случайного шаблона из списка
    var randomIndex = templates.length * Math.random() | 0

    var templateString  = templates[randomIndex][0]
    var templateOptions = templates[randomIndex][1]

    // Новый объектный шаблон
    var newObjTemplate = []

    // Построение шаблона
    var splittedTemplateString = templateString.split(' ')
    for (var i = 0; i < splittedTemplateString.length; i++) {
        var item = splittedTemplateString[i]

        var options = Object.assign({}, templateOptions[item])

        // Если такой части предложения не зарегистрировано,
        // переходим к следующей итерации
        if (options == null) {
            newObjTemplate.push({ шаблон: item })
            continue
        }

        // Если установлена вероятность выпадения, проверяем на удачу
        if (options['шанс'] != null && options['шанс'] < Math.random()) {
            continue
        } else {
            delete options['шанс']
        }

        var templateItem = getWord(options, links)

        templateItem['исходник'] = item
        newObjTemplate.push(templateItem)
    }

    return putVariables(newObjTemplate)
}

// Получание слов в шаблоне части предложения ----------------------------------
function getWord(options, links) {
    // Если шаблонов несколько, выбираем один из них
    if (options['шаблоны'] != null) {
        var randIndex = options['шаблоны'].length * Math.random() | 0
        options['шаблон'] = options['шаблоны'][randIndex]
        delete options['шаблоны']
    }

    // Подборка случайных слов в шаблоне
    var matches = options['шаблон']
        .split(/[^0-9А-я_]/)
        .filter(item => links[item] != null)

    for (var i = 0; i < matches.length; i++) {
        // Получаем случайное слово из списка
        var words       = links[matches[i]]
        var randWord    = words[ Math.random() * words.length | 0]
        var wordString  = Object.keys(randWord)[0] // Слово

        // Выражение для замены
        var expr = new RegExp(matches[i])

        // Если в шаблоне только одно слово
        if (matches.length === 1 && i === 0) {
            // Объединяем шаблон и объект с параметрами
            var wordOptions = randWord[wordString]
            options = Object.assign({}, options, wordOptions)
        }

        options['шаблон'] = options['шаблон'].replace(expr, wordString)
    }

    return options
}

// Подстановка родов слов предложения ------------------------------------------
function putVariables(templateArray) {
    return templateArray.map(item => {
        // Получние рода
        if (item['род'] != null && !/[мжс]/.test(item['род'])) {
            var genderItem = templateArray.find(genderSrc =>
                genderSrc['исходник'] === item['род']
            )

            if (genderItem != null) {
                item['род'] = genderItem['род']

                item['изменить'] = new Set(item['изменить']).add('род')
            }
        }

        if (item['падеж'] != null) {
            item['изменить'] = new Set(item['изменить']).add('падеж')
        }

        return item
    })
}
