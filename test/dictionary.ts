import { expect } from 'chai'
import { addDictionary, getRandomItem, createStore } from '../src/dictionary'

/**
 * Загрузка словарей в хранилище словарей
 * @function addDictionary
 */
describe('Добавление словарей', () => {
  it('Добавление словаря из строкового массива', () => {
    const store = addDictionary([
      'раз',
      'два',
      'три'
    ], 'словарь', {})

    expect(store['словарь']).not.undefined
    expect(store['словарь'][0]).to.deep.eq(['раз', {}])
    expect(store['словарь'][1]).to.deep.eq(['два', {}])
    expect(store['словарь'][2]).to.deep.eq(['три', {}])
  })

  it('Добавление словаря из списка слов с параметрами', () => {
    const store = addDictionary([
      ['четыре', { 'р': 'м' }],
      ['пять', { 'р': 'м' }],
      ['шесть', { 'р': 'м' }],
    ], 'словарь', {})

    expect(store['словарь']).not.undefined
    expect(store['словарь'][0]).to.deep.eq(['четыре', { 'р': 'м' }])
    expect(store['словарь'][1]).to.deep.eq(['пять', { 'р': 'м' }])
    expect(store['словарь'][2]).to.deep.eq(['шесть', { 'р': 'м' }])
  })
})

/**
 * Создание хранилища словарей
 * @function createStore
 */
describe('Создание хранилища словарей', () => {
  it('Создание хранилища из карты словарей', () => {
    const store = createStore({
      'первый словарь': ['раз', 'два', 'три'],
      'второй словарь': [['раз', { prop: 'value' }], ['два', {}], 'три']
    })

    expect(store).to.deep.eq({
      'первый словарь': [
        ['раз', {}],
        ['два', {}],
        ['три', {}],
      ],
      'второй словарь': [
        ['раз', { 'prop': 'value' }],
        ['два', {}],
        ['три', {}],
      ],
    })
  })
})

/**
 * Получение случайного слова из хранилища словарей
 * @function getRandomItem
 */
describe('Получение случайного слова из словаря', () => {
  it('Наличие полученного слова в словаре', () => {
    const initDictArray = ['раз', 'два', 'три']

    const store = addDictionary(initDictArray, 'словарь', {})
    const randomItem = getRandomItem('словарь', {}, store)

    expect(initDictArray).to.include(randomItem[0])
  })
})
