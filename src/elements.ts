import { DictionaryItem } from './dictionary'

/** Типы элементов export */
type ElemenType = 'sentence' | 'fragment' | 'template'

/** Элемента шаблона */
export interface Element {
    type:       ElemenType
    props:      { [prop: string]: any }
    children:   (string | Element | DictionaryItem)[]
}

/** Элемент предложения */
export interface SentenceElement extends Element {
    type:       'sentence'
    children:   FragmentElement[]
}

/** Элемент фрагмента */
export interface FragmentElement extends Element {
    type:       'fragment'
    children:   TemplateElement[]
}

/** Элемент шаблона */
export interface TemplateElement extends Element {
    type:       'template'
    children:   (string | DictionaryItem)[]
}

/**
 * Создаёт элемент шаблона
 * @param {string}           type       Тип элемента
 * @param {Object}           props      Параметры элемента
 * @param {...object|string} children   Дочерние элементы
 */
export function createElement(type: 'sentence', props: null | {}, ...children: FragmentElement[]): SentenceElement
export function createElement(type: 'fragment', props: null | {}, ...children: TemplateElement[]): FragmentElement
export function createElement(type: 'template', props: null | {}, ...children: (string | DictionaryItem)[]): TemplateElement
export function createElement(type: ElemenType, props: null | {}, ...children: (string | Element | DictionaryItem)[] ): Element {
    const propsFallBack = props == null ? {} : props

    // Проврека иерархии типов
    // sentence —> fragment —> template
    switch (type) {
        case 'sentence': {
            children.forEach((child: Element) => {
                if (child.type !== 'fragment') {
                    throw new Error('Элемент «sentence» может иметь только дочерние элементы с типом «fragment»')
                }
            })

            return {
                type,
                props: propsFallBack,
                children: children as FragmentElement[],
            }
        }

        case 'fragment': {
            children.forEach((child: Element) => {
                if (child.type !== 'template') {
                    throw new Error('Элемент «template» может иметь только дочерние элементы с типом «template»')
                }
            })

            return {
                type,
                props: propsFallBack,
                children: children as TemplateElement[],
            }
        }

        case 'template': {
            children.forEach((child: Element) => {
                if (typeof child !== 'string' && typeof child !== 'function') {
                    throw new Error(
                        'Элемент «template» может иметь в качестве дочерних элементов только строки или функции, ' +
                        'возвращаемые элементы словаря.'
                    )
                }
            })

            return {
                type,
                props: propsFallBack,
                children
            }
        }

        default: {
            throw new Error('Неизвестный тип элемента')
        }
    }
}
