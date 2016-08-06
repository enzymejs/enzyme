import cheerio from 'cheerio';
import { renderToStaticMarkup } from './react-compat';

/**
 * Renders a react component into static HTML and provides a cheerio wrapper around it. This is
 * somewhat asymmetric with `mount` and `shallow`, which don't use any external libraries, but
 * Cheerio's API is pretty close to what we actually want and has a significant amount of utility
 * that would be recreating the wheel if we didn't use it.
 *
 * I think there are a lot of good use cases to use `render` instead of `shallow` or `mount`, and
 * thus I'd like to keep this API in here even though it's not really "ours".
 *
 * @param node
 * @returns {Cheerio}
 */
export default function render(node) {
  const html = renderToStaticMarkup(node);
  return cheerio.load(html).root();
}
