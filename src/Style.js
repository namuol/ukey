import FreeStyle from 'react-free-style';

let Style = FreeStyle.create();

// Disabling component injection to help perf testing -- it clogs the tree.
// Style.component = (a) => {return a;};
// Style.Element = 'style';

export default Style;