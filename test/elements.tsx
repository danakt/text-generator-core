import { expect } from 'chai'
import { createElement } from '../src/elements'

/**
 * Создание элемента шаблона
 * @function createElement
 */
describe('Создание элемента шаблона', () => {
  it('Проврека структуры получившегося объекта', () => {
    const store = {
      'словарь': [
        ['Элемент словаря', {}]
      ]
    }

    const sentenceTempalte = (
      createElement('sentence', { someprop: 'somevalue' },
        createElement('fragment', null,
          ['Элемент словаря', { someprop: 'somevalue' }],
          'Обычный текст',
          createElement('word', { type: 'словарь', store: store })
        )
      )
    )

    expect(sentenceTempalte).to.deep.eq({
      type: 'sentence',
      props: { someprop: 'somevalue' },
      children: [{
        type: 'fragment',
        props: {},
        children: [
          ['Элемент словаря', {
            'someprop': 'somevalue'
          }],
          'Обычный текст',
          ['Элемент словаря', {}]
        ]
      }]
    })
  })

  it('Проврека создания шаблона при помощи JSX', () => {
    const store = {
      'словарь': [
        ['Элемент словаря', {}]
      ]
    }

    const sentenceTempalte = (
      <sentence someprop="somevalue">
        <fragment>
          {['Элемент словаря', { someprop: 'somevalue' }]}
          Обычный текст
          <word type="словарь" store={store}/>
        </fragment>
      </sentence>
    )

    expect(sentenceTempalte).to.deep.eq({
      type: 'sentence',
      props: { someprop: 'somevalue' },
      children: [{
        type: 'fragment',
        props: {},
        children: [
          ['Элемент словаря', {
            'someprop': 'somevalue'
          }],
          'Обычный текст',
          ['Элемент словаря', {}]
        ]
      }]
    })
  })
})
