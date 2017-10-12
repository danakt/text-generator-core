/** Типы элементов export */
type ElemenType = 'sentence' | 'fragment' | 'template'

/**
 * Интерфейс элемента шаблона
 * @interface
 */
export interface Element {
    type:       ElemenType
    props:      { [prop: string]: any }
    children:   string | Element[]
}

/**
 * Элемент предложения
 */
export interface SentenceElement extends Element {
    type:       'sentence'
    children:   FragmentElement[]
}

/**
 * Элемент фрагмента
 */
export interface FragmentElement extends Element {
    type:       'fragment'
    children:   TemplateElement[]
}

/**
 * Элемент шаблона
 */
export interface TemplateElement extends Element {
    type:       'template'
    children:   string
}

/**
 * Создаёт элемент шаблона
 * @param {string}           type       Тип элемента
 * @param {Object}           props      Параметры элемента
 * @param {...object|string} children   Дочерние элементы
 */
export function createElement(type: 'sentence', props: null | {}, ...children: FragmentElement[]): SentenceElement
export function createElement(type: 'fragment', props: null | {}, ...children: TemplateElement[]): FragmentElement
export function createElement(type: 'template', props: null | {}, children: string): TemplateElement
export function createElement(type: ElemenType, props: null | {}, ...children: (string | Element)[] ): Element {
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
            if (typeof children[0] !== 'string') {
                throw new Error('Элемент «template» может иметь только строки в качестве дочерних элементов')
            }

            return {
                type,
                props: propsFallBack,
                children: children[0] as string,
            }
        }

        default: {
            throw new Error('Неизвестный тип элемента')
        }
    }
}
