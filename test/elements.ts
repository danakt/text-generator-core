import { expect } from 'chai'
import { createElement } from '../src/elements'

/**
 * Создание элемента шаблона
 * @function createElement
 */
describe('Создание элемента шаблона', () => {
    it('Проврека структуры получившегося объекта', () => {
        const sentenceTempalte = (
            createElement('sentence', { someprop: 'somevalue' },
                createElement('fragment', null,
                    createElement('template', {}, 'Lorem ipsum'),
                    createElement('template', null, 'Dolor sit amet'),
                )
            )
        )

        expect(sentenceTempalte).to.deep.eq({
            type:  'sentence',
            props: { someprop: 'somevalue' },
            children: [
                {
                    type:'fragment',
                    props: {},
                    children: [
                        {
                            type: 'template',
                            props: {},
                            children: [
                                'Lorem ipsum'
                            ]
                        }, {
                            type: 'template',
                            props: {},
                            children: [
                                'Dolor sit amet'
                            ]
                        }
                    ]
                }
            ]
        })

    })
})
