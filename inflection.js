/** ----------------------------------------------------------------------------
 * Окончания
 * @type {object}
 */

const morphemes = {
    // Краткие прилагательные
    '([^л])ен': ['$1на',  '$1но'],
    '([л])ен':  ['$1ьна', '$1ьно'],
    // Прилагательные
    'ный': ['ная', 'ное'],
    'щий': ['щая', 'щее'],
    'кий': ['кая', 'кое'],
}

/** ----------------------------------------------------------------------------
 * Установка окончания слова
 * @param {string} baseString      Строка, содержащая род
 * @param {string} stringToInflect Строка для изменения окончания
 */

module.exports = function setInflect(baseString, stringToInflect) {
    let gender = baseString.split('#')[1].trim()
    let genderIndex

    // Если в иходной строке нет информации о роде,
    // возращаем строку без изменений
    if(gender === 'м' || ['ж', 'с'].indexOf(gender) == -1) {
        return stringToInflect
    } else {
        genderIndex = gender === 'ж' ? 0 : 1
    }

    for (let item in morphemes) {
        if (!morphemes.hasOwnProperty(item)) {
            continue
        }

        let regex = new RegExp(item + '$')
        if (regex.test(stringToInflect)) {
            stringToInflect = stringToInflect
                .replace(regex, morphemes[item][genderIndex])

            break
        }
    }

    return stringToInflect
}
