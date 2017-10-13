import { DictionaryItem } from './dictionary'

/** Типы элементов export */
type TypeOfElement = 'sentence' | 'fragment' | 'template'

/** Элемента шаблона */
export interface Element {
    type:       TypeOfElement
    props:      { [prop: string]: any }
    children:   (string | Element | Function)[]
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
    children:   (string | Function)[]
}

/**
 * Создаёт элемент шаблона по типу
 * @param {string}           type       Тип элемента
 * @param {Object}           props      Параметры элемента
 * @param {...object|string} children   Дочерние элементы
 */
export function createElement(type: 'sentence', props?: {}, ...children: FragmentElement[]): SentenceElement
export function createElement(type: 'fragment', props?: {}, ...children: TemplateElement[]): FragmentElement
export function createElement(type: 'template', props?: {}, ...children: (string | Function)[]): TemplateElement
export function createElement(type: TypeOfElement, props?: {}, ...children: (string | Element | Function)[] ): Element {
    const propsFallBack = props == null
        ? {}
        : props

    // Проврека иерархии типов
    // sentence —> fragment —> template
    switch (type) {
        case 'sentence': {
            return createSentenceElement(propsFallBack, ...children as FragmentElement[])
        }

        case 'fragment': {
            return createFragmentElement(propsFallBack, ...children as TemplateElement[])
        }

        case 'template': {
            return createTemplateElement(propsFallBack, ...children as (string | Function)[])
        }

        default: {
            throw new Error('Неизвестный тип элемента')
        }
    }
}

/**
 * Создаёт элемент предложения
 * @param  {object}              props     Параметры элемента
 * @param  {...FragmentElement}  children  Дочерние элементы
 * @return {SentenceElement}
 */
export function createSentenceElement(props: object, ...children: FragmentElement[]): SentenceElement {
    children.forEach((child: Element) => {
        if (child.type !== 'fragment') {
            throw new Error('Элемент «sentence» может иметь только дочерние элементы с типом «fragment»')
        }
    })

    return {
        type: 'sentence',
        props,
        children,
    }
}

/**
 * Создаёт элемент фрагмента предложения
 * @param  {object}              props     Параметры элемента
 * @param  {...TemplateElement}  children  Дочерние элементы
 * @return {FragmentElement}
 */
export function createFragmentElement(props: object, ...children: TemplateElement[]): FragmentElement {
    children.forEach((child: Element) => {
        if (child.type !== 'template') {
            throw new Error('Элемент «fragment» может иметь только дочерние элементы с типом «template»')
        }
    })

    return {
        type: 'fragment',
        props,
        children,
    }
}

/**
 * Создаёт элемент шаблона фрагмента
 * @param  {object}               props     Параметры элемента
 * @param  {...(string|Function)} children  Дочерние элементы
 * @return {TemplateElement}
 */
export function createTemplateElement(props: object, ...children: (string | Function)[]): TemplateElement {
    children.forEach((child: string | Function) => {
        if (typeof child !== 'string' && typeof child !== 'function') {
            throw new Error(
                'Элемент «template» может иметь в качестве дочерних элементов только строки или функции, ' +
                'возвращаемые элементы словаря.'
            )
        }
    })

    return {
        type: 'template',
        props,
        children
    }
}
