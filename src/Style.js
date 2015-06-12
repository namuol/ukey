import FreeStyle from 'react-free-style';
import autoPrefix from './util/autoPrefix';

let Style = FreeStyle.create();

let register = Style.registerStyle.bind(Style);

Style.registerStyle = function registerStyle_prefix (...args) {
  return register(autoPrefix(...args));
}

if (process.env.DEBUG_STYLE_PERF_WORKAROUND) {
  // Disabling component injection to help perf testing -- it clogs the tree.
  Style.component = (a) => {return a;};
  Style.Element = 'style';
} else {
  Style.inject = () => {};
}

export default Style;