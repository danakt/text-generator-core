import { expect } from 'chai'
import { map, toPairs, curry } from 'ramda'
import { DictionaryItem } from '../src/dictionary'
import { createElement } from '../src/elements'
import {
  generateSentence,
  createIdMap,
  formatSentence,
} from '../src/generator'

/**
 * Тип правил трансформации
 */
type TansformRule = [RegExp, { [value: string]: string }]
type TansformRules = { [prop: string]: TansformRule[] }

/**
 * Правила трансформации
 */
const mockTransformRules = {
  // Изменения по роду
  'род': [
    // Краткие прилагательные:
    [/([^л])ен$/, { 'м': '$1ен', 'ж': '$1на', 'с': '$1но' }],
    [/([л])ен$/, { 'м': '$1ен', 'ж': '$1ьна', 'с': '$1ьно' }],
    // Прилагательные
    [/вый$/, { 'м': 'вый', 'ж': 'вая', 'с': 'вое' }],
    [/ный$/, { 'м': 'ный', 'ж': 'ная', 'с': 'ное' }],
    [/щий$/, { 'м': 'щий', 'ж': 'щая', 'с': 'щее' }],
    [/кий$/, { 'м': 'кий', 'ж': 'кая', 'с': 'кое' }]
  ],
  // Изменения по падежу
  'падеж': [
    [/([бвгджзклмнпрстфхцчшщ])а$/, { 'дательный': '$1у' }],
    [/([а-я])я$/, { 'дательный': '$1ю' }]
  ]
} as TansformRules

/**
 * Трансформирует элементы
 */
const transformItem = curry(function transformItem(
  transformRules: TansformRules,
  props: { [prop: string]: string },
  target: DictionaryItem
): DictionaryItem {
  const propsArr: [string, any][] = toPairs(props)

  const propsReducer = function propsReducer(
    transformRules: TansformRules,
    accum: string,
    prop: [string, string]
  ): string {
    const propname: string = prop[0]
    const value: string = prop[1]

    return transformRules[propname].reduce((accum: string, rule: TansformRule): string => {
      const regExpr: RegExp = rule[0]
      const replacer: string = rule[1][value]

      return accum.replace(regExpr, replacer)
    }, accum)
  }

  const outString: string = propsArr.reduce(curry(propsReducer)(transformRules), target[0])
  return [outString, { ...target[1], ...props }, target[2]]
})(mockTransformRules)

/**
 * Мок-шаблон
 */
const mockSentenceTemplate = (
  <sentence>
    <fragment>{['трансцендентный', {}, { "for": "word1", "type": "прилагательное" }]}</fragment>
    <fragment>{['индукция', { 'род': 'ж' }, { 'id': 'word1', 'type': 'существительное' }]}</fragment>
    <fragment>, {['возводя', {}, { 'type': 'деепричастие' }]}, {['отделяет', {}, { 'type': 'глагол' }]}</fragment>
    <fragment>{['апперцепция', { 'род': 'ж', 'падеж': 'дательный' }, { 'type': 'существительное', 'props': { 'падеж': 'дательный' } }]}</fragment>
    .
  </sentence>
)

/**
 * Проверка генерации предложения
 * @function generateSentence
 */
describe('Генерация предложения', () => {
  it('Проверка композиции генератора', () => {
    const shouldBe = 'Трансцендентная индукция, возводя, отделяет апперцепцию.'
    expect(generateSentence(mockSentenceTemplate, transformItem)).to.eq(shouldBe)
  })
})

/**
 * Создание карты идентификаторов
 * @function createIdMap
 */
describe('Создание карты элементов словаря по идентификаторам', () => {
  it('Создание карты и проврека на эквивалентность', () => {
    const idMap: { [id: string]: DictionaryItem } = createIdMap(mockSentenceTemplate)

    expect(idMap).to.deep.eq({
      word1: ['индукция', { 'род': 'ж' }, { id: 'word1', type: 'существительное' }]
    })
  })
})
