// noinspection ES6UnusedImports

import { Grammar, Parser } from 'nearley'
// @ts-ignore
import mql from './mql.ne'

const mqlGrammar = Grammar.fromCompiled(mql)

export const MQLParser = () => new Parser(mqlGrammar)