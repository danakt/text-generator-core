/**
 * Создание элементов
 * @description Функционал реализован для JSX-шаблонизатора. Элементы могут быть только двух типов:
 * «sentence» и «fragment». Элементы должны следовать иерархии: sentence —> fragment
 */
import { update } from 'ramda'
import { getRandomItem, DictionaryItem, RandomItemGetter, DictionariesStore } from './dictionary'

/** Типы элементов export */
export type TypeOfElement = 'sentence' | 'fragment' | 'word'

/** Дочерний элемент фрагмента */
export type FragmentChild = DictionaryItem | string

/** Дочерний элемент элемента предложения */
export type SentenceChild = FragmentElement | string

/** Дочерние элементы любого элемента */
export type ElementChild = FragmentChild | SentenceChild

/** Элемента шаблона */
export interface Element {
  type:     TypeOfElement
  props:    { [prop: string]: any }
  children: ElementChild[]
}

/** Элемент предложения */
export interface SentenceElement extends Element {
  type:     'sentence'
  children: SentenceChild[]
}

/** Элемент фрагмента */
export interface FragmentElement extends Element {
  type:     'fragment'
  children: FragmentChild[]
}

/**
 * Создаёт элемент шаблона по типу
 * @param {string}           type     Тип элемента
 * @param {Object}           props    Параметры элемента
 * @param {...object|string} children Дочерние элементы
 */
export function createElement(type: 'word', props?: null | {}): DictionaryItem
export function createElement(type: 'sentence', props?: null |{}, ...children: FragmentElement[]): SentenceElement
export function createElement(type: 'fragment', props?: null | {}, ...children: FragmentChild[]): FragmentElement
export function createElement(type: TypeOfElement, props?: {}, ...children: ElementChild[]): Element | DictionaryItem {
  // Фоллбэк параметров
  const propsFallBack: { [prop: string]: any } = props == null ? {} : props

  // Получение случайного слова из указанного хранилища
  if (type === 'word') {
    if (propsFallBack.type == null) {
      throw new Error('Элемент типа «word» должен иметь параметр «type»')
    }

    if (propsFallBack.store == null) {
      throw new Error('Элемент типа «word» должен иметь параметр «store»')
    }

    const dictionaryItem: DictionaryItem = getRandomItem(propsFallBack.type, propsFallBack.props, propsFallBack.store)
    const updatedItem = update(2, propsFallBack, dictionaryItem) as DictionaryItem

    return updatedItem
  }

  // Создание элементов «sentence» и «fragment»
  const filteredChildren = children.filter((child) => {
    if (child == null || typeof child == 'boolean') {
      return false
    }

    if (typeof child !== 'object' && typeof child !== 'string') {
      throw new Error('Невалидный элемент:' + child)
    }

    return true
  })

  switch (type) {
    case 'sentence': {
      return {
        type:     'sentence',
        props:    propsFallBack,
        children: filteredChildren,
      } as SentenceElement
    }

    case 'fragment': {
      return {
        type:     'fragment',
        props:    propsFallBack,
        children: filteredChildren,
      } as FragmentElement
    }

    default: {
      throw new Error('Неизвестный тип элемента')
    }
  }
}
