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
function generateSentence(sentence, transform) {
    var transformFallback = typeof transform === 'function'
        ? ramda_1.curry(transformFragments)(transform)
        : function (s) { return s; };
    var prepareSentence = ramda_1.pipe(transformFallback, stringifySentence, formatSentence);
    var sentencePrepared = prepareSentence(sentence);
    return sentencePrepared;
}
exports.generateSentence = generateSentence;
function transformFragments(transform, sentence) {
    var mapperOfFragment = function mapperOfFragment(idMap, element, index) {
        if (!Array.isArray(element) || element[2] == null) {
            if (typeof element === 'object' && !Array.isArray(element) && element.children != null) {
                var children = element.children.map(ramda_1.curry(mapperOfFragment)(idMap));
                return __assign({}, element, { children: children });
            }
            return element;
        }
        var selfTransformed = element[2].props != null
            ? transform(element[2].props, element)
            : element;
        if (typeof element[2].for !== 'string') {
            return selfTransformed;
        }
        var searchId = element[2].for;
        if (idMap[searchId] == null) {
            return selfTransformed;
        }
        var roleModelProps = idMap[searchId][1];
        var itemTransformed = transform(roleModelProps, selfTransformed);
        return itemTransformed;
    };
    var idMap = createIdMap(sentence);
    var fragmentsTransformed = sentence.children.map(ramda_1.curry(mapperOfFragment)(idMap));
    return __assign({}, sentence, { children: fragmentsTransformed });
}
exports.transformFragments = transformFragments;
function stringifySentence(sentence) {
    var foldFragments = ramda_1.reduce(function (out, fragment) {
        if (typeof fragment === 'string') {
            return out + ' ' + fragment;
        }
        var fragmentChildren = fragment.children;
        if (fragmentChildren == null) {
            return out;
        }
        var foldedChildren = ramda_1.reduce(function (out, item) {
            return typeof item === 'string'
                ? out + ' ' + item
                : out + ' ' + item[0];
        }, '', fragmentChildren);
        return out + foldedChildren;
    }, '');
    var stringifiedResults = foldFragments(sentence.children);
    return stringifiedResults;
}
exports.stringifySentence = stringifySentence;
function formatSentence(sentence) {
    return ramda_1.pipe(ramda_1.replace(/(\s*,+\s*)+/g, ', '), ramda_1.replace(/\s*([\.?!])+\s*/g, '$1'), ramda_1.replace(/\s\s+/g, ' '), ramda_1.trim, function (str) { return str[0].toUpperCase() + str.substr(1); })(sentence);
}
exports.formatSentence = formatSentence;
function createIdMap(sentence) {
    var idMapReducer = function (map, child) {
        if (Array.isArray(child) && typeof child[0] === 'string' && typeof child[2].id === 'string') {
            return __assign({}, map, (_a = {}, _a[child[2].id] = child, _a));
        }
        var childElement = child;
        if (typeof childElement === 'object' && childElement.type === 'fragment') {
            var fragment = childElement;
            return ramda_1.reduce(idMapReducer, map, fragment.children);
        }
        return map;
        var _a;
    };
    var idMap = ramda_1.reduce(idMapReducer, {}, sentence.children);
    return idMap;
}
exports.createIdMap = createIdMap;
//# sourceMappingURL=generator.js.map