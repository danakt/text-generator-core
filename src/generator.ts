import { pipe, curry, reduce, replace, trim } from 'ramda'
import { DictionariesStore, RandomItemGetter, DictionaryItem } from './dictionary'
import { SentenceElement, FragmentElement, SentenceChild, FragmentChild, Element } from './elements'

/**
 * Тип функции-транформатора
 */
export type TransformFunction = (props: { [prop: string]: any }, target: DictionaryItem) => DictionaryItem

/**
 * Генерация предложения по шаблону и словарю
 * @param  {SentenceElement}   sentence  Элемент предложени, содержащий в себе шаблон
 * @param  {TransformFunction} transform Функция трансформации элементов, например для
 *  изменения склонения или рода
 * @return {string}
 */
export function generateSentence(sentence: SentenceElement, transform: TransformFunction): string {
  // Создание композиции для подготовки предложения
  const prepareSentence: (sentence: SentenceElement) => string = pipe(
    // Трансформация фрагментов с параметром «for»
    curry(transformFragments)(transform),
    // Превращение результатов фрагментов в строковое предложение
    stringifySentence,
    // Форматирование строкового предложения
    formatSentence,
  )

  // Подготовка предложения
  const sentencePrepared: string = prepareSentence(sentence)
  return sentencePrepared
}

/**
 * Трансформирует фрагменты с параметром «for», в зависимости от  параметров
 * фрагмента с id, указанным в «for»
 * @param {TransformFunction} transform Функция трансформации
 * @param {SentenceElement}   sentence  Элемент предложения
 * @param {SentenceElement}
 */
function transformFragments(transform: TransformFunction, sentence: SentenceElement): SentenceElement {
  // Функция маппинга элементов предложения
  const mapperOfFragment = function mapperOfFragment(
    idMap: { [id: string]: DictionaryItem },
    element: SentenceChild | FragmentChild,
    index: number,
  ): SentenceChild | FragmentChild {
    if (!Array.isArray(element) || element[2] == null) {
      // Рекурсионный маппинг дочерних элементов
      if (typeof element === 'object' && !Array.isArray(element) && element.children != null) {
        const children = element.children.map(curry(mapperOfFragment)(idMap))
        return {
          ...element,
          children
        } as SentenceChild
      }

      return element
    }

    // Трансформируем, если у элемента есть собственные свойства, которые
    // нужно применить в трансформации
    const selfTransformed: DictionaryItem = element[2].props != null
      ? transform(element[2].props, element)
      : element

    // Проверяем наличие прааметра «for»
    if (typeof element[2].for !== 'string') {
      return selfTransformed
    }

    // Искомый id
    const searchId: string = element[2].for

    // Получение параметров найденного по id элемента, для использования в трансформации
    if (idMap[searchId] == null) {
      return selfTransformed
    }
    const roleModelProps: { [prop: string]: any } = idMap[searchId][1]

    // Применение транформации
    const itemTransformed: DictionaryItem = transform(
      roleModelProps,
      selfTransformed,
    )

    return itemTransformed
  }

  // Создание карты айдишников
  const idMap: { [id: string]: DictionaryItem } = createIdMap(sentence)
  // Маппинг элементов предложения
  const fragmentsTransformed = sentence.children.map(curry(mapperOfFragment)(idMap)) as SentenceChild[]

  return {
    ...sentence,
    children: fragmentsTransformed,
  }
}

/**
 * Превращает результаты фагментов в строковое представление
 * @param  {SentenceElement} sentence Элемент предложения
 * @return {string}
 */
function stringifySentence(sentence: SentenceElement): string {
  // Свёртка фрагментов
  const foldFragments = reduce((out: string, fragment: string | FragmentElement) => {
    if (typeof fragment === 'string') {
      return out + ' ' + fragment
    }

    const fragmentChildren: undefined | (string | DictionaryItem)[] = fragment.children
    if (fragmentChildren == null) {
      return out
    }

    // Свёртка результатов фрагментов
    const foldedChildren: string = reduce((out: string, item: string | DictionaryItem) => {
      return typeof item === 'string'
        ? out + ' ' + item
        : out + ' ' + item[0]
    }, '', fragmentChildren)


    return out + foldedChildren
  }, '')

  // Получение строкового представления результатов фрагментов
  const stringifiedResults: string = foldFragments(sentence.children)

  return stringifiedResults
}

/**
 * Форматирует предложение
 * @param  {string} sentence Строковое предложение
 * @return {string}
 */
function formatSentence(sentence: string): string {
  return pipe(
    // Удаление повторяющихся запятых и пробелов вокруг запятых
    replace(/\s*,+\s*,+\s*/g, ', '),
    // Пробелы вокруг прочих знаков припинания
    replace(/\s+([,.!?])\s*/g, '$1 '),
    // Удаление множественных пробелов
    replace(/\s\s+/g, ' '),
    // Удаление пробелов в начале и конце
    trim,
    // Капиталайз
    (str: string) => str[0].toUpperCase() + str.substr(1),
  )(sentence)
}

/**
 * Создаёт карту элементов по id
 * @param  {SentenceElement} sentence Элемент предложения
 * @return {object}
 */
function createIdMap(sentence: SentenceElement): { [id: string]: DictionaryItem } {
  const idMapReducer = (map: { [id: string]: DictionaryItem }, child: SentenceChild | FragmentChild) => {
    if (Array.isArray(child) && typeof child[0] === 'string' && typeof child[2].id === 'string') {
      return {
        ...map,
        [child[2].id]: child
      }
    }

    const childElement = child as void | string | Element

    if (typeof childElement === 'object' && childElement.type === 'fragment') {
      const fragment = childElement as FragmentElement
      return reduce(idMapReducer, map, fragment.children)
    }

    return map
  }

  // Создание карты идентификаторов
  const idMap: { [id: string]: DictionaryItem } = reduce(idMapReducer, {}, sentence.children)

  return idMap
}
