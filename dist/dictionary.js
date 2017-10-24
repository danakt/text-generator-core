"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
function addDictionaryPlane(dictionary, name, store) {
    var newDictionary = dictionary.map(function (item) {
        return typeof item === 'string'
            ? [item, {}]
            : item;
    });
    var newStore = __assign({}, store, (_a = {}, _a[name] = newDictionary, _a));
    return newStore;
    var _a;
}
exports.addDictionary = ramda_1.curry(addDictionaryPlane);
function createStore(mapOfDictionaries) {
    var adderForCompose = ramda_1.mapObjIndexed(function (dictionary, name) {
        return exports.addDictionary(dictionary, name);
    }, mapOfDictionaries);
    var store = ramda_1.pipe.apply(null, ramda_1.values(adderForCompose))({});
    return store;
}
exports.createStore = createStore;
function getRandomItemPlane(name, props, store) {
    if (!store.hasOwnProperty(name)) {
        throw new Error('Отсуствует запрашиваемый словарь');
    }
    var randomIndex = store[name].length * Math.random() | 0;
    var randomItem = store[name][randomIndex];
    var itemWithMergedProps = [
        randomItem[0],
        __assign({}, randomItem[1], props),
        {}
    ];
    return itemWithMergedProps;
}
exports.getRandomItem = ramda_1.curry(getRandomItemPlane);
