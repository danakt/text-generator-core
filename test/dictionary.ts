import * as fs from 'fs'
import { expect } from 'chai'
import { addDictionary, getRandomItem } from '../src/dictionary'

/**
 * Загрузка словарей в хранилище словарей
 * @function addDictionary
 */
describe('Загрузка словарей', () => {
    it('Загрузка словаря из строкового массива', () => {
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

    it('Словарь из списка слов с параметрами', () => {
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
 * Получение случайного слова из хранилища словарей
 * @function getRandomItem
 */
describe('Получение случайного слова из словаря', () => {
    it('Наличие полученного слова в словаре', () => {
        const initDictArray = ['раз', 'два', 'три']

        const store = addDictionary(initDictArray, 'словарь', {})
        const randomItem = getRandomItem('словарь', store)

        expect(initDictArray).to.include(randomItem[0])
    })
})
