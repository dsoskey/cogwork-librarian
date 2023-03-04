import nearly, { Parser, Grammar } from 'nearley'
// @ts-ignore
import oracle from './oracle.ne'
// @ts-ignore
import print from './print.ne'

export const queryParser = () => new Parser(Grammar.fromCompiled(oracle))

export const printingParser = () => new Parser(Grammar.fromCompiled(print))
