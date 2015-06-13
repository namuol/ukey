import React, {PropTypes} from 'react';
import Style from './Style';
import theme from './theme';

import Immutable from 'immutable';

import gridShift from './gridShift';

import {DragDropContext, DragSource, DropTarget} from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

import DraggableItem from './DraggableItem';
import DropSpot from './DropSpot';

let idxToGridPosition = ({columns, idx}) => {
  return {
    x: idx % columns,
    y: Math.floor(idx/columns),
  };
};

@DragDropContext(HTML5Backend)
export default class DraggableGrid extends React.Component {
  static defaultProps = {
    columns: 6,
    rowHeight: 12,
    spacing: 2,
    unit: 'vmin'
  };

  state = (() => {
    const {
      columns,
    } = this.props;

    let keys = Immutable.List();
    React.Children.forEach(this.props.children, c => keys = keys.push(c.key));

    let layout = keys.reduce((result, key, idx) => {
      return result.set(key, idxToGridPosition({columns:columns, idx:idx}));
    }, Immutable.Map());

    return {
      layout: layout,
    };
  })();

  render () {
    const {
      columns,
      rowHeight,
      spacing,
      unit,
    } = this.props;

    const itemWidth = `(${100/columns}% - ${spacing + spacing/columns}${unit})`;

    // NOTE: x must be used inside calc(...),
    //  but y is just a raw number meant to be represented in the
    //  specified `unit`, i.e. 4 => 4vmin
    const gridToScreenPosition = ({x, y}) => {
      return {
        x: `(${x} * ${itemWidth} + (${spacing*(x+1)}${unit}))`,
        y: y*rowHeight + spacing*(y+1),
      };
    };

    const getStyleForPosition = ({x, y}) => {
      return {
        width: `calc(${itemWidth})`,
        height: `${rowHeight}${unit}`,
        position: 'absolute',
        left: `calc(${x})`,
        top: `${y}${unit}`,
      };
    };

    const gridHeight = this.state.layout.reduce((result, item) => {
      return item.y > result ? item.y : result;
    }, 0) + 1;

    const totalHeight = gridToScreenPosition({x:0, y:gridHeight+1}).y;

    return (
      <div className={this.props.className} style={Object.assign({}, this.props.style, {
        position: 'relative',
        height: `${totalHeight}${unit}`,
      })}>
        {Immutable.Range(0,gridHeight*columns).map((idx) => {
          let grid = idxToGridPosition({columns:columns, idx:idx});
          let pos = gridToScreenPosition(grid);

          return (
            <DropSpot
              key={'ds'+idx}
              style={getStyleForPosition(pos)}
              x={grid.x}
              y={grid.y}
            >
              {idx}
            </DropSpot>
          );
        }).toJS()}

        {React.Children.map(this.props.children, (child, idx) => {
          let grid = this.state.layout.get(child.key);
          let pos = gridToScreenPosition(grid);

          return (
            <DraggableItem key={idx} style={getStyleForPosition(pos)}>
              {child}
            </DraggableItem>
          );
        })}
      </div>
    );
  }
};