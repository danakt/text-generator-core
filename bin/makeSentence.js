// Функция получения предложения из шаблона ------------------------------------
module.exports = function makeSentence(template, flections) {
    return joinWords(declination(template, flections))
}

// Изменение формы слова -------------------------------------------------------
function declination(obj, flections) {
    for (let i = 0; i < obj.length; i++) {
        let editItems = obj[i]['изменить']
        if (editItems != null && editItems.constructor === Set) {
            if (editItems.has('падеж')) {
                // Изменение падежа
                obj[i] = setFlection(obj[i], 'падеж', flections)
            }

            if (editItems.has('род')) {
                // TODO: Прикрутить вариацию
                // в заивисимости от части речи

                obj[i] = setFlection(obj[i], 'род', flections)
            }
        }
    }

    return obj
}

// Изменение окончания ---------------------------------------------------------
function setFlection(wordObject, target, flections) {
    for (var item in flections[target]) {
        if (!flections[target].hasOwnProperty(item)) {
            continue
        }

        let tg = wordObject[target]
        let exp = new RegExp(item)

        if(exp.test(wordObject['шаблон'])) {
            wordObject['шаблон'] = wordObject['шаблон']
                .replace(exp, flections[target][item][tg])

            break
        }
    }

    return wordObject
}

// Сборка предложения ----------------------------------------------------------
function joinWords(template) {
    let sentence = ''

    for (let i = 0; i < template.length; i++) {
        let item = template[i]['шаблон']

        // Заглавная буква
        if (i === 0) {
            item = item[0].toUpperCase() + item.substr(1)
        }

        // Точка в конце предложения
        if (i === template.length - 1) {
            item += '.'
        }

        sentence += ` ${item}`
    }

    return sentence.trim()
        .replace(/\s+,\s*|\s*,\s*,\s*/g, ', ') // Запятые
        .replace(/\s+([,.!?])\s*/g, '$1 ')     // Пробелы вокруг знаков
        .replace(/(([,.!?])\s*){2,}/g, '$1')   // Повторяющиеся знаки
        .replace(/\s\s+/g, ' ')                // Двойные пробелы
}
