import nearly, { Parser, Grammar } from 'nearley'
// @ts-ignore
import grammar from './grammar.ne'

export const queryParser = () => new Parser(Grammar.fromCompiled(grammar));