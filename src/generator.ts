import { pathEq, pipe, curry, findLastIndex, insert, remove, reduce, replace, trim } from 'ramda'
import { DictionariesStore, RandomItemGetter, DictionaryItem } from './dictionary'
import { SentenceElement, FragmentElement, TemplateElement } from './elements'

/**
 * Тип функции-транформатора
 */
export type TransformFunction = (roleModel: DictionaryItem, target: DictionaryItem) => DictionaryItem

/**
 * Генерация предложения по шаблону и словарю
 * @param  {SentenceElement}   sentence  Элемент предложени, содержащий в себе шаблон
 * @param  {DictionariesStore} store     Хранилище словарей
 * @param  {TransformFunction} transform Функция трансформации элементов, например для
 *  изменения склонения или рода
 * @return {string}
 */
export function generateSentence(
  sentence:   SentenceElement,
  store:      DictionariesStore,
  transform:  TransformFunction
): string {
  // Создание композиции для подготовки предложения
  const prepareSentence: (s: SentenceElement) => SentenceElement = pipe(
    // Выбор одного шаблона во фрагментах
    filterTempaltesInFragments,
    // Получение случайных пунктов из библиотеки, сохранение результатов в фрагменты
    curry(makeResultsForFragments)(store),
    // Трансформация фрагментов с параметром «for»
    curry(transformFragments)(transform),
  )

  // Подготовка предложения
  const sentencePrepared: SentenceElement = prepareSentence(sentence)
  const striginfiedSentence: string = stringifySentence(sentencePrepared)

  return striginfiedSentence
}

/**
 * Оставляет один шаблон во фрагменте случайным образом
 * @description В каждом фрагменте может находиться несколько шаблонов. Функция
 *   оставляет один шаблон из списка случайным образом.
 * @param {SentenceElement} sentence Элемент предложения
 * @param {SentenceElement}
 */
function filterTempaltesInFragments(sentence: SentenceElement) {
  const preparedFragments: FragmentElement[] = sentence.children.map((fragment: FragmentElement) => {
    if (fragment.children.length === 0) {
      return fragment
    }

    // Выбирается случайный шаблон из списка дочерних элементов фрагмента
    const randomIndex: number = fragment.children.length * Math.random() | 0
    const randomChild: TemplateElement = fragment.children[randomIndex]

    return {
      ...fragment,
      children: [randomChild]
    }
  })

  return {
    ...sentence,
    children: preparedFragments
  }
}

/**
 * Генерирует результат для каждого фрагмента
 * @description Получает из шаблона внутри фрагмента дочерние элементы в виде функций,
 *   возвращающих случайных элемент из хранилища и строк, заранее внесённых в шаблон.
 *   Выполняет строки и сохраняет результат в виде массива в параметр «result» фрагмента
 * @param {DictionariesStore} store    Хранилище словарей, которые будут использоваться в преобразованиях
 * @param {SentenceElement}   sentence Элемент предложения
 */
function makeResultsForFragments(store: DictionariesStore, sentence: SentenceElement): SentenceElement {
  // Создание функции-маппера
  const createMapperForFragments = (store: DictionariesStore, fragment: FragmentElement): FragmentElement => {
    if (fragment.children.length === 0) {
      return {
        ...fragment,
        result: [],
      }
    } else if (fragment.children.length > 1) {
      // В момент когда элемент предложения попадает в эту функцию, в списке
      // дочерних элементов каждого фрагмента должно быть только по одному шаблону
      throw new Error('Во фрагменте должен быть один шаблон')
    }

    const template: TemplateElement = fragment.children[0]

    const createMapperTemplateCildren = (
      store: DictionariesStore,
      templateChildren: string | RandomItemGetter | DictionaryItem,
    ) => {
      if (typeof templateChildren === 'function') {
        return templateChildren(store)
      }

      return templateChildren
    }

    const result = template.children.map(curry(createMapperTemplateCildren)(store))

    return {
      ...fragment,
      result,
    }
  }

  const preparedFragments: FragmentElement[] = sentence.children.map(
    curry(createMapperForFragments)(store)
  )

  return {
    ...sentence,
    children: preparedFragments
  }
}

/**
 * Трансформирует фрагменты с параметром «for», в зависимости от фрагмента с
 * id, указанным в «for»
 * @param {TransformFunction} transform Функция трансформации
 * @param {SentenceElement}   sentence  Элемент предложения
 * @param {SentenceElement}
 */
function transformFragments(transform: TransformFunction, sentence: SentenceElement): SentenceElement {
  const transformFragment = (fragment: FragmentElement, index: number, preparedFragments: FragmentElement[]) => {
    // если у фрагмента нет параметра «for», ничего не делаем
    if (typeof fragment.props.for !== 'string') {
      return fragment
    }

    const isPathEuqal = pathEq(['props', 'id'], fragment.props.for)
    const roleModelFragment: undefined | FragmentElement = preparedFragments.find(isPathEuqal)

    // Если не был найден фрагмент с таким id, ничего не делаем
    if (roleModelFragment == null) {
      return fragment
    }

    // На этом этапе в каждом фрагменте должен быть получен результат шаблонов
    if (fragment.result == null || roleModelFragment.result == null) {
      throw new Error('Результат фрагментов должен быть получен')
    }

    // Функция выбора последнего итема в списке результатов
    // TODO: сделать нормальный выбор нужного итема с списке дочерних элементов
    // шаблона для трансформации. Пока выбирается последний из списка.
    const findLastNonStringItemInResult = findLastIndex((item: string | DictionaryItem): boolean => {
      if (typeof item === 'string') {
        return false
      }

      return true
    })

    // Выбор трансформируемого итема
    const itemTargetTransformIndex: number = findLastNonStringItemInResult(fragment.result)
    const itemTargetTransform = fragment.result[itemTargetTransformIndex]
    if (itemTargetTransform == null || !Array.isArray(itemTargetTransform)) {
      return fragment
    }

    // Выбор итема, на основе которого будет происходить трансформация
    const itemRoleModelIndex: number = findLastNonStringItemInResult(roleModelFragment.result)
    const itemRoleModel = roleModelFragment.result[itemTargetTransformIndex]
    if (itemRoleModel == null || !Array.isArray(itemRoleModel)) {
      return fragment
    }

    // Применение транформации
    const itemTransformed: DictionaryItem = transform(
      itemRoleModel,
      itemTargetTransform,
    )

    return {
      ...fragment,
      result: pipe(
        remove(itemTargetTransformIndex, 1),
        insert(itemTargetTransformIndex, itemTransformed),
      )(fragment.result)
    }
  }

  const fragmentsTransformed: FragmentElement[] = sentence.children.map(transformFragment)

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
  const foldFragments = reduce((out: string, fragment: FragmentElement) => {
    const fragmentResult: undefined | (string | DictionaryItem)[] = fragment.result
    if (fragmentResult == null) {
      return out
    }

    // Свёртка результатов фрагментов
    const foldResults = reduce((out: string, item: string | DictionaryItem) => {
      if (typeof item === 'string') {
        return out + ' ' + item
      }

      return out + ' ' + item[0]
    }, '')

    return out + foldResults(fragmentResult)
  }, '')

  // Получение строкового представления результатов фрагментов
  const stringifiedResults: string = foldFragments(sentence.children)

  // Форматирование предложения
  const formatSentence: (sentence: string) => string = pipe(
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

  // Добавление знака препинания, указанног ов параметре «stop»
  const formattedSentence: string = (
    formatSentence(stringifiedResults) + sentence.props.stop || '.'
  )

  return formattedSentence
}
