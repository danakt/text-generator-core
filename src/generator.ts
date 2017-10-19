import { pathEq, pipe, curry, findLastIndex, insert, remove, reduce, replace, trim } from 'ramda'
import { DictionariesStore, RandomItemGetter, DictionaryItem } from './dictionary'
import { SentenceElement, FragmentElement, SentenceChild } from './elements'

/**
 * Тип функции-транформатора
 */
export type TransformFunction = (roleModel: DictionaryItem, target: DictionaryItem) => DictionaryItem

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

  const sentencePrepared: string = prepareSentence(sentence)

  return sentencePrepared
}

/**
 * Трансформирует фрагменты с параметром «for», в зависимости от фрагмента с
 * id, указанным в «for»
 * @param {TransformFunction} transform Функция трансформации
 * @param {SentenceElement}   sentence  Элемент предложения
 * @param {SentenceElement}
 */
function transformFragments(transform: TransformFunction, sentence: SentenceElement): SentenceElement {
  const mapperOfFragment = (fragment: SentenceChild, index: number, preparedFragments: FragmentElement[]) => {
    if (typeof fragment === 'string') {
      return fragment
    }

    // Если у фрагмента нет параметра «for», или если у фрагмента нет дочерних элементов,
    // ничего не делаем
    if (typeof fragment.props.for !== 'string' || fragment.children == null) {
      return fragment
    }

    // Поиск элемента с id
    const isPathEuqal = pathEq(['props', 'id'], fragment.props.for)
    const roleModelFragment: undefined | FragmentElement = preparedFragments.find(isPathEuqal)

    // Если не был найден фрагмент с таким id, ничего не делаем
    if (roleModelFragment == null || roleModelFragment.children == null) {
      return fragment
    }

    // Функция выбора последнего итема в списке результатов
    const findLastNonStringItemInChildren = findLastIndex((item: string | DictionaryItem): boolean => {
      if (typeof item === 'string') {
        return false
      }

      return true
    })

    // Выбор трансформируемого итема
    const itemTargetTransformIndex: number = findLastNonStringItemInChildren(fragment.children)
    const itemTargetTransform = fragment.children[itemTargetTransformIndex]
    if (itemTargetTransform == null || !Array.isArray(itemTargetTransform)) {
      return fragment
    }

    // Выбор итема, на основе которого будет происходить трансформация
    const itemRoleModelIndex: number = findLastNonStringItemInChildren(roleModelFragment.children)
    const itemRoleModel = roleModelFragment.children[itemTargetTransformIndex]
    if (itemRoleModel == null || !Array.isArray(itemRoleModel)) {
      return fragment
    }

    // Применение транформации
    const itemTransformed: DictionaryItem = transform(
      itemRoleModel,
      itemTargetTransform,
    )

    // Функция для замены дочернего элемента на новый
    const replaceChildren = (replacer: DictionaryItem, index: number, childrenArray: (string | DictionaryItem)[]) => {
      return pipe(
        remove(index, 1),
        insert(index, replacer),
      )(childrenArray)
    }

    return {
      ...fragment,
      children: replaceChildren(itemTransformed, itemTargetTransformIndex, fragment.children)
    }
  }

  const fragmentsTransformed: SentenceChild[] = sentence.children.map(mapperOfFragment)

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
    const foldResults = reduce((out: string, item: string | DictionaryItem) => {
      if (typeof item === 'string') {
        return out + ' ' + item
      }

      return out + ' ' + item[0]
    }, '')

    return out + foldResults(fragmentChildren)
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
    replace(/\s+,\s*|\s*,\s*,\s*/g, ', '),
    // Пробелы вокруг прочих знаков припинания
    replace(/\s+([,.!?])\s*/g, '$1 '),
    // Удаление повторяющихся знаков припинания
    // TODO: Обдумать правильность данного форматирования
    replace(/(([,.!?])\s*){2,}/g, '$1'),
    // Удаление множественныз пробелов
    replace(/\s\s+/g, ' '),
    // Удаление пробелов в начале и конце
    trim,
    // Капиталайз
    (str: string) => str[0].toUpperCase() + str.substr(1),
  )
}
