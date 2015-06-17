import React from 'react';
import Style from './Style';
import theme from './theme';

import SortableGridList from './SortableGridList';

import Immutable from 'immutable';

const WRAPPER = Style.registerStyle({
  width: '100vmin',
  minHeight: '100vh',
  backgroundColor: theme.bgColor,
});

const STYLE = Style.registerStyle({
  width: '100%',
  height: '100%',
});

const GRID = Style.registerStyle({
  width: '100%',
});

const ITEM = Style.registerStyle({
  width: '100%',
  height: '100%',
  textAlign: 'center',
  borderRadius: '2vmin',
  backgroundColor: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '4vmin',
});

class TestGrid2 extends React.Component {
  static defaultProps = {
    // letters: Immutable.Range(0,8).map(n => String.fromCharCode(65+n)).toList(),
    letters: Immutable.OrderedSet('ABCDEFGHIJKLMN'.split('')),
  };

  state = (() => {
    return {
      layout: this.processLayout(Immutable.fromJS([this.props.letters.toJS()])),
    }
  })();

  processLayout (layout) {
    // Filter empty sections:
    return layout.filter(section => section.size > 0).push(Immutable.List());
  }

  render () {
    const items = this.props.letters.map((letter) => {
      return <div className={ITEM.className} key={letter}>
        {letter}
      </div>;
    });

    return (
      <div className={WRAPPER.className} style={this.props.style}>
        <div className={STYLE.className}>
          <SortableGridList className={GRID.className}
            rowHeight={(100 - 5 * 2)/4}
            gridWidth={6}
            vSpacing={0}
            layout={this.state.layout}
            onLayoutChanged={(newLayout) => {
              this.setState({
                layout: this.processLayout(newLayout),
              });
            }}
          >
            {items}
          </SortableGridList>

          <Style.Element />
        </div>
      </div>
    );
  }
};

export default Style.component(TestGrid2);