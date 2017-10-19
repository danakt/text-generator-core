/**
 * Создание элементов
 * @description Функционал реализован для JSX-шаблонизатора. Элементы могут быть только двух типов:
 * «sentence» и «fragment». Элементы должны следовать иерархии: sentence —> fragment
 */
import { DictionaryItem, RandomItemGetter } from './dictionary'

/** Типы элементов export */
export type TypeOfElement = 'sentence' | 'fragment'

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
export function createElement(type: 'sentence', props?: {}, ...children: FragmentElement[]): SentenceElement
export function createElement(type: 'fragment', props?: {}, ...children: FragmentChild[]): FragmentElement
export function createElement(type: TypeOfElement, props?: {}, ...children: ElementChild[]): Element {
  // Фоллбэк параметров
  const propsFallBack = props == null ? {} : props

  const filteredChildren = children.filter((child) => {
    if (child == null || typeof child == 'boolean') {
      return false
    }

    if (typeof child !== 'object' && typeof child !== 'string') {
      console.error('Невалидный элемент:', child)
      return false
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
