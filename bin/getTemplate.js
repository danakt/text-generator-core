// Построение объектного шаблона предложения -----------------------------------
module.exports = function getTemplate(links, templates) {
    // Получение случайного шаблона из списка
    let randomIndex = templates.length * Math.random() | 0
    let [templateString, templateOptions] = templates[randomIndex]

    // Новый объектный шаблон
    let newObjTemplate = []

    // Построение шаблона
    for (let item of templateString.split(' ')) {
        let options = Object.assign({}, templateOptions[item])

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

        let templateItem = getWord(options, links)

        templateItem['исходник'] = item
        newObjTemplate.push(templateItem)
    }

    return putVariables(newObjTemplate)
}

// Получание слов в шаблоне части предложения ----------------------------------
function getWord(options, links) {
    // Если шаблонов несколько, выбираем один из них
    if (options['шаблоны'] != null) {
        let randIndex = options['шаблоны'].length * Math.random() | 0
        options['шаблон'] = options['шаблоны'][randIndex]
        delete options['шаблоны']
    }

    // Подборка случайных слов в шаблоне
    let matches = options['шаблон']
        .split(/[^0-9А-я_]/)
        .filter(item => links[item] != null)

    for (let i = 0; i < matches.length; i++) {
        // Получаем случайное слово из списка
        let words    = links[matches[i]]
        let randWord = words[ Math.random() * words.length | 0]
        let wordString  = Object.keys(randWord)[0] // Слово

        // Выражение для замены
        let expr = new RegExp(matches[i])

        // Если в шаблоне только одно слово
        if (matches.length === 1 && i === 0) {
            // Объединяем шаблон и объект с параметрами
            let wordOptions = randWord[wordString]
            options = Object.assign({}, options, wordOptions)
        }

        options['шаблон'] = options['шаблон']
            .replace(expr, wordString)
    }

    return options
}

// Подстановка родов слов предложения ------------------------------------------
function putVariables(templateArray) {
    return templateArray.map(item => {
        // Получние рода
        if (item['род'] != null && !/[мжс]/.test(item['род'])) {
            let genderItem = templateArray.find(genderSrc =>
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
