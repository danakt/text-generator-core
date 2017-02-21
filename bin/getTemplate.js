// Построение объектного шаблона предложения -----------------------------------
module.exports = function getTemplate(templates) {
    // Получение случайного шаблона из списка
    let randomIndex = templates.length * Math.random() | 0
    let [templateString, templateOptions] = templates[randomIndex]

    // Навый объектный шаблон
    let newObjTemplate = []

    // Перебираем каждую часть предложения в строковом шаблоне
    for (let item of templateString.split(' ')) {
        let options = templateOptions[item]

        // Если такой части предложения не зарегистрировано
        if (options == null) {
            newObjTemplate.push({ шаблон: item })
            continue
        }

        // Если установлена вероятность выпадения, проверяем на удачу
        if (options['шанс'] != null && options['шанс'] < Math.random()) {
            continue
        }

        delete options['шанс']

        let templateItem = {}

        if (options['шаблоны'] != null) {
            let randIndex = options['шаблоны'].length * Math.random() | 0
            options['шаблон'] = options['шаблоны'][randIndex]
            delete options['шаблоны']
        }

        if (typeof options['шаблон'] === 'object') {
            let tempalteObj = options['шаблон']
            let wordString  = Object.keys(tempalteObj)[0]
            let wordOptions = tempalteObj[wordString]

            tempalteObj = Object.assign({}, options, wordOptions)
            tempalteObj['шаблон'] = wordString

            templateItem = tempalteObj
        } else {
            templateItem = options
        }

        templateItem['исходник'] = item
        newObjTemplate.push(templateItem)
    }

    return putVariables(newObjTemplate)
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
