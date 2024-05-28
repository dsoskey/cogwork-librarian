import syntax from './micromark-symbols';
import { fromMarkdown } from './mdast-symbols';
import { add } from '../utils';

// characters allowed inside a symbol definition by default
const DEFAULT_ALLOWED = 'wubrgcmtsqepxyz/-0123456789';

function symbols(options) {
  const data = this.data();
  const valid = options?.allowed || DEFAULT_ALLOWED;
  add(data, 'micromarkExtensions', syntax(valid));
  add(data, 'fromMarkdownExtensions', fromMarkdown);
}

export default symbols;
