import syntax from './micromark-centering';
import { fromMarkdown } from './mdast-centering';
import { add } from '../utils';

function centering() {
  const data = this.data();
  add(data, 'micromarkExtensions', syntax);
  add(data, 'fromMarkdownExtensions', fromMarkdown);
}

export default centering;
