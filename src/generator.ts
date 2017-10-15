import { pathEq, pipe, curry }                                  from 'ramda'
import { DictionariesStore, RandomItemGetter, DictionaryItem }  from './dictionary'
import { SentenceElement, FragmentElement, TemplateElement }    from './elements'

export function generateSentence(sentence: SentenceElement, store: DictionariesStore) {
  // Создание композиции для подготовки предложения
  const prepareSentence: (s: SentenceElement) => SentenceElement = pipe(
    // Отсеивает фрагменты с «chnace»
    filterFragments,
    // Выбор одного шаблона во фрагментах
    filterTempaltesInFragments,
    // Сохранение результатов фрагментов
    curry(makeResultsForFragments)(store),
  )

  // Подготовка предложения
  const sentencePrepared: SentenceElement = prepareSentence(sentence)
}

/**
 * Отсеивает вариации во фрагментах в зависимости от параметра «chance»
 * @description У фрагментов может быть установлен параметр «chance», который
 *   устанавливает шант появления данного фрагмента в предложении.
 *   Функция случайным образом отсеивает такие фрагменты.
 * @param {SentenceElement} sentence Элемент предложения
 * @param {SentenceElement}
 */
function filterFragments(sentence: SentenceElement): SentenceElement {
  const preparedFragments: FragmentElement[] = sentence.children.filter((fragment: FragmentElement) => {
      const chance: void | number = fragment.props.chance

      if (typeof chance !== 'number') {
        return true
      }

      if (chance <= Math.random()) {
        return false
      }

      return true
    })

  return {
    ...sentence,
    children: preparedFragments
  }
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
      return fragment
    } else if (fragment.children.length > 1) {
      // В момент когда элемент предложения попадает в эту функцию, в списке
      // дочерних элементов каждого фрагмента должно быть только по одному шаблону
      throw new Error('Во фрагменте должен быть один шаблон')
    }

    const template: TemplateElement = fragment.children[0]

    const createMapperTemplateCildren = (store: DictionariesStore, templateChildren: string | RandomItemGetter) => {
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
