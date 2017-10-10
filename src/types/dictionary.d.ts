/**
 * Пункт словаря
 */
declare type DictionaryItem = [string, { [prop: string]: any }]

/**
 * Хранилище
 */
declare type Dictionary = DictionaryItem[]

/**
 * Хранилище словарей
 */
declare type DictionariesStore = {
    [name: string]: Dictionary
}
