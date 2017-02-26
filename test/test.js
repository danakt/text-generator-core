const readFile = filename => require('fs').readFileSync(filename, 'utf-8')
const getText  = require('../getText.js')

const templates    = require('./templates')
const flections    = require('./patterns')


// Списки слов -----------------------------------------------------------------
let links = {
    НАЧ_ВВОД:   [ readFile('./links/нач_ввод.yml') ],
    ВВОД:       [ readFile('./links/ввод.yml') ],
    СУЩ:        [ readFile('./links/сущ.yml') ],
    ГЛАГ:       [ readFile('./links/глаг.yml') ],
    ПРИЛ:       [ readFile('./links/прил.yml') ],
    ДЕЕПРИЧ:    [ readFile('./links/дееприч.yml') ],
    КРАТК_ПРИЛ: [ readFile('./links/кратк_прил.yml') ],
    УТВЕРЖД:    [ readFile('./links/утвержд.yml') ],
}

let options = { links, templates, flections }
console.log(getText(100, options))
