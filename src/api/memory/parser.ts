import nearly, { Parser, Grammar } from 'nearley'
// @ts-ignore
import oracle from './oracle.ne'
// @ts-ignore
import print from './print.ne'

// TODO: combine these before extracting?
const oracleGrammar = Grammar.fromCompiled(oracle)
export const queryParser = () => new Parser(oracleGrammar)

const printGrammar = Grammar.fromCompiled(print)
export const printingParser = () => new Parser(printGrammar)
