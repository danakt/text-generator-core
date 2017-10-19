import { curry, pipe, mapObjIndexed, values } from 'ramda'

/** Хранилище словарей */
export interface DictionariesStore {
  [name: string]: DictionaryItem[]
}

/**
 * Пункт словаря
 * @description В первой ячейке находится слово, во второй — его параметры
 */
export type DictionaryItem = [
  string,
  { [prop: string]: any }
]

/**
 * Функция, полученная в результате вызова каррированного getRandomItem с
 * указанием библиотеки
 */
export type RandomItemGetter = (store: DictionariesStore) => DictionaryItem

/**
 * Добавляет словарь в хранилище
 * @param  {Dictionary|string[]} dictionary Словарь или массив со словами
 * @param  {string}              name       Название нового словаря
 * @param  {DictionariesStore}   store      Предыдущее хранилище
 * @return {DictionariesStore}              Изменённое хранилище
 */
function addDictionaryPlane(
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
 * Каррированная функция добавления словаря в хранилище
 * {@link addDictionaryPlane}
 */
export const addDictionary = curry(addDictionaryPlane)

/**
 * Создаёт хранилище с указанными словарями
 * @param  {Object} mapOfDictionaries Объект со списком словарей для создания хранилища
 * @return {DictionariesStore}        Созданное хранилище
 */
export function createStore(mapOfDictionaries: {
  [name: string]: (string | { [prop: string]: any })[]
}): DictionariesStore {
  // Подготовка массива функций для применения в композиции
  const adderForCompose = mapObjIndexed((dictionary: (DictionaryItem | string)[], name) => {
    return addDictionary(dictionary, name)
  }, mapOfDictionaries)

  // Создание хранилища
  const store: DictionariesStore = pipe.apply(null, values(adderForCompose))({})

  return store
}

/**
 * Возвращает случайное слово из указанного словаря
 * @param  {string}            name  Название словаря, в котором будет осуществляться поиск случайного слова
 * @param  {DictionariesStore} store Хранилище, содержащее словарь
 * @return {DictionaryItem}
 */
function getRandomItemPlane(name: string, store: DictionariesStore): DictionaryItem {
  if (!store.hasOwnProperty(name)) {
    throw new Error('Отсуствует запрашиваемый словарь')
  }

  // Получение рандомной ячейки из словаря
  const randomIndex: number = store[name].length * Math.random() | 0
  const randomItem: DictionaryItem = store[name][randomIndex]

  return randomItem
}

/**
 * Каррированная функция для получения случайного пункта из указанного словаря
 * {@link getRandomItemPlane}
 * @param  {string} dictionaryName Название словаря, в котором будет осуществляться поиск случайного слова
 * @return {ItemGetter} Функция,созданная в результате карринга. Возвращает слово из указанной библиотеки словарей
 */
export const getRandomItem = curry(getRandomItemPlane)
