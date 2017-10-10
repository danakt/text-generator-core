/** Пункт словаря */
type DictionaryItem = [string, { [prop: string]: any }]

/** Словарь */
type Dictionary = DictionaryItem[]

/**
 * Список добавленных словарей
 */
const dictionaries: { [name: string]: Dictionary } = {}

/**
 * Добавляет словарь в список
 * @param {string}                   name       Название нового словаря
 * @param {Dictionary|Array<string>} dictionary Словарь или массив со словами
 */
export function addDictionary(name: string, dictionary: Dictionary | string[]) {
    let newDictionary: Dictionary = []

    for (let item of dictionary) {
        if (Array.isArray(item)) {
            newDictionary.push(item)
        } else {
            newDictionary.push([item, {}])
        }
    }

    dictionaries[name] = newDictionary
}

/**
 * Возвращает случайное слово из указанного словаря
 * @return {DictionaryItem}
 */
export function getRandomItem(name: string): DictionaryItem {
    if (!dictionaries.hasOwnProperty(name)) {
        throw new Error('Отсуствует запрашиваемый словарь')
    }

    const randomIndex: number = dictionaries[name].length * Math.random() | 0
    const randomItem: DictionaryItem = dictionaries[name][randomIndex]

    return randomItem
}
