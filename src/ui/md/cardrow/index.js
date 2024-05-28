import syntax from './micromark-cardrow';
import { fromMarkdown } from './mdast-cardrow';
import { add } from '../utils';

function cardrow() {
  const data = this.data();
  add(data, 'micromarkExtensions', syntax);
  add(data, 'fromMarkdownExtensions', fromMarkdown);
}

export default cardrow;
