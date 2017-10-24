export = TextGeneratorCore
export as namespace TextGeneratorCore

declare namespace TextGeneratorCore {
  /**
   * Элемент словаря. В первой ячейке находится слово, во второй — его свойства,
   * в третей — параметры шаблонизации
   */
  type DictionaryItem = [
    string,
    { [prop: string]: any },
    { [prop: string]: any }
  ]

  /**
   * Хранилище словарей
   */
  interface DictionariesStore {
    [name: string]: DictionaryItem[]
  }

  /**
   * Добавляет словарь в хранилище
   * @param  {Dictionary|string[]} dictionary Словарь или массив со словами
   * @param  {string}              name       Название нового словаря
   * @param  {DictionariesStore}   store      Предыдущее хранилище
   * @return {DictionariesStore}              Изменённое хранилище
   */
  function addDictionary(dictionary: (DictionaryItem | string)[], name: string, store: DictionariesStore): DictionariesStore
  function addDictionary(dictionary: (DictionaryItem | string)[], name: string): (store: DictionariesStore) => DictionariesStore
  function addDictionary(dictionary: (DictionaryItem | string)[]): (name: string, store: DictionariesStore) => DictionariesStore
  function addDictionary(dictionary: (DictionaryItem | string)[]): (name: string) => (store: DictionariesStore) => DictionariesStore


  /**
   * Создаёт хранилище с указанными словарями
   * @param  {Object} mapOfDictionaries Объект со списком словарей для создания хранилища
   * @return {DictionariesStore}        Созданное хранилище
   */
  function createStore(mapOfDictionaries: { [name: string]: (string | { [prop: string]: any })[] }): DictionariesStore

  /**
   * Возвращает случайное слово из указанного словаря
   * @param  {string}            name  Название словаря, в котором будет осуществляться поиск случайного слова
   * @param  {object}            props Свойства, которые будут добавляться к полученному из словаря слову
   * @param  {DictionariesStore} store Хранилище, содержащее словарь
   * @return {DictionaryItem}
   */
  function getRandomItemPlane(name: string, props: { [prop: string]: any }, store: DictionariesStore): DictionaryItem
  function getRandomItemPlane(name: string, props: { [prop: string]: any }): (store: DictionariesStore) => DictionaryItem
  function getRandomItemPlane(name: string): (props: { [prop: string]: any }, store: DictionariesStore) => DictionaryItem
  function getRandomItemPlane(name: string): (props: { [prop: string]: any }) => (store: DictionariesStore) => DictionaryItem

  /** Типы элементов */
  type TypeOfElement = 'sentence' | 'fragment' | 'word'

  /** Дочерний элемент фрагмента */
  type FragmentChild = DictionaryItem | string

  /** Дочерний элемент элемента предложения */
  type SentenceChild = FragmentElement | string

  /** Дочерние элементы любого элемента */
  type ElementChild = FragmentChild | SentenceChild

  /** Элемента шаблона */
  interface Element {
    type:     TypeOfElement
    props:    { [prop: string]: any }
    children: ElementChild[]
  }

  /** Элемент предложения */
  interface SentenceElement extends Element {
    type:     'sentence'
    children: SentenceChild[]
  }

  /** Элемент фрагмента */
  interface FragmentElement extends Element {
    type:     'fragment'
    children: FragmentChild[]
  }

  /**
   * Создаёт элемент шаблона по типу
   * @param {string}           type     Тип элемента
   * @param {Object}           props    Параметры элемента
   * @param {...object|string} children Дочерние элементы
   */
  function createElement(type: 'word', props?: null | {}): DictionaryItem
  function createElement(type: 'sentence', props?: null |{}, ...children: FragmentElement[]): SentenceElement
  function createElement(type: 'fragment', props?: null | {}, ...children: FragmentChild[]): FragmentElement
  function createElement(type: TypeOfElement, props?: {}, ...children: ElementChild[]): Element | DictionaryItem


  /**
   * Тип функции-транформатора
   */
  type TransformFunction = (props: { [prop: string]: any }, target: DictionaryItem) => DictionaryItem

  /**
   * Генерирует предложение по шаблону
   * @param  {SentenceElement}   sentence  Элемент предложени, содержащий в себе шаблон
   * @param  {TransformFunction} transform Функция трансформации элементов, например для
   *  изменения склонения или рода
   * @return {string}
   */
  function generateSentence(sentence: SentenceElement, transform?: TransformFunction): string
}
