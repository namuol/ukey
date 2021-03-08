import React, {PropTypes} from 'react';

import textFit from 'textfit';

class FitText extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    compressor: PropTypes.number,
    minFontSize: PropTypes.number,
    maxFontSize: PropTypes.number,
  };

  static defaultProps = {
    compressor: 1.0,
    minFontSize: Number.NEGATIVE_INFINITY,
    maxFontSize: Number.POSITIVE_INFINITY,
  };

  _fitTheText = () => {
    // eslint-disable-next-line react/no-deprecated
    textFit(React.findDOMNode(this), {reprocess: false});
  };
  
  componentDidMount () {
    window.addEventListener("resize", this._fitTheText);
    this._fitTheText();
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this._fitTheText);
  }

  componentDidUpdate () {
    this._fitTheText();
  }

  render () {
    return (
      this.props.children
    );
  }
}

export default FitText;