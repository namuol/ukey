import React from 'react';
import Style from './Style';
import theme from './theme';

let STYLE = Style.registerStyle({
  display: 'flex',
});

class ChordSection extends React.Component {
  render () {
    return (
      <div className={STYLE.className} style={this.props.style}>
      </div>
    );
  }
}

export default Style.component(ChordSection);