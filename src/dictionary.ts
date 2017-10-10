/**
 * Добавляет словарь в список
 * @param {string}              name       Название нового словаря
 * @param {Dictionary|string[]} dictionary Словарь или массив со словами
 * @param {DictionariesStore}   store      Предыдущее хранилище
 */
export function addDictionary(
    name:       string,
    dictionary: (DictionaryItem | string)[],
    store:      DictionariesStore,
): DictionariesStore {
    const newDictionary: Dictionary = dictionary.map(item => {
        return typeof item === 'string'
            ? [item, {}] as DictionaryItem
            : item
    })

    // Создание нового состояния хранилища
    const newStore: DictionariesStore = {
        ...store,
        [name]: newDictionary,
    }

    return newStore
}

/**
 * Возвращает случайное слово из указанного словаря
 * @param  {string}            name Название словаря, из которого будет
 *   осуществляться поиск случайного слова
 * @param  {DictionariesStore} store Хранилище словарей
 * @return {DictionaryItem}
 */
export function getRandomItem(
    name:  string,
    store: DictionariesStore,
): DictionaryItem {
    if (!store.hasOwnProperty(name)) {
        throw new Error('Отсуствует запрашиваемый словарь')
    }

    const randomIndex: number = store[name].length * Math.random() | 0
    const randomItem: DictionaryItem = store[name][randomIndex]

    return randomItem
}
