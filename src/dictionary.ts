import { curry, compose, map, mapObjIndexed } from 'ramda'

/** Хранилище словарей */
export type DictionariesStore = {
    [name: string]: DictionaryItem[]
}

/** Пункт словаря */
export type DictionaryItem = [string, { [prop: string]: any }]

/**
 * Добавляет словарь в список
 * @param  {Dictionary|string[]} dictionary Словарь или массив со словами
 * @param  {string}              name       Название нового словаря
 * @param  {DictionariesStore}   store      Предыдущее хранилище
 * @return {DictionariesStore}              Изменённое хранилище
 */
export function addDictionary(
    dictionary: (DictionaryItem | string)[],
    name:       string,
    store:      DictionariesStore,
): DictionariesStore {
    const newDictionary: DictionaryItem[] = dictionary.map(item =>
        typeof item === 'string'
            ? [item, {}] as DictionaryItem
            : item
    )

    // Создание нового состояния хранилища
    const newStore: DictionariesStore = {
        ...store,
        [name]: newDictionary,
    }

    return newStore
}

/**
 * Создаёт хранилище с указанными словарями
 * @param  {Object} mapOfDictionaries Объект со списком словарей для создания хранилища
 * @return {DictionariesStore}        Созданное хранилище
 */
export function createStore(mapOfDictionaries: {
    [name: string]: (string | { [prop: string]: any })[]
}): DictionariesStore {
    // Каррированная функция добавления словаря
    const addDictionaryCur = curry(addDictionary)

    // Подготовка массива функций для применения в композиции
    const adderForCompose = mapObjIndexed(
        (dictionary: (DictionaryItem | string)[], name: string) => {
            return addDictionaryCur(dictionary, name)
        },
        mapOfDictionaries
    )

    // Создание хранилища
    const store: DictionariesStore = compose.apply(null, adderForCompose)({})

    return store
}

/**
 * Возвращает случайное слово из указанного словаря
 * @param  {string}            name  Название словаря, из которого будет осуществляться поиск случайного слова
 * @param  {DictionariesStore} store Хранилище словарей
 * @return {DictionaryItem}
 */
export function getRandomItem(name: string, store: DictionariesStore): DictionaryItem {
    if (!store.hasOwnProperty(name)) {
        throw new Error('Отсуствует запрашиваемый словарь')
    }

    // Получение рандомной ячейки из словаря
    const randomIndex: number = store[name].length * Math.random() | 0
    const randomItem: DictionaryItem = store[name][randomIndex]

    return randomItem
}
