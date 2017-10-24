"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
var dictionary_1 = require("./dictionary");
function createElement(type, props) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    var propsFallBack = props == null ? {} : props;
    if (type === 'word') {
        if (propsFallBack.type == null) {
            throw new Error('Элемент типа «word» должен иметь параметр «type»');
        }
        if (propsFallBack.store == null) {
            throw new Error('Элемент типа «word» должен иметь параметр «store»');
        }
        var dictionaryItem = dictionary_1.getRandomItem(propsFallBack.type, propsFallBack.props, propsFallBack.store);
        var store = propsFallBack.store, propsWithoutState = __rest(propsFallBack, ["store"]);
        var updatedItem = ramda_1.update(2, propsWithoutState, dictionaryItem);
        return updatedItem;
    }
    var filteredChildren = children.filter(function (child) {
        if (child == null || typeof child == 'boolean') {
            return false;
        }
        if (typeof child !== 'object' && typeof child !== 'string') {
            throw new Error('Невалидный элемент:' + child);
        }
        return true;
    });
    switch (type) {
        case 'sentence': {
            return {
                type: 'sentence',
                props: propsFallBack,
                children: filteredChildren,
            };
        }
        case 'fragment': {
            return {
                type: 'fragment',
                props: propsFallBack,
                children: filteredChildren,
            };
        }
        default: {
            throw new Error('Неизвестный тип элемента');
        }
    }
}
exports.createElement = createElement;
//# sourceMappingURL=elements.js.map