// noinspection ES6UnusedImports

import nearly, { Parser, Grammar } from 'nearley'
// @ts-ignore
import oracle from './oracle.ne'

const oracleGrammar = Grammar.fromCompiled(oracle)
export const queryParser = () => new Parser(oracleGrammar)
