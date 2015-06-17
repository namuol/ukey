import React, {PropTypes} from 'react';
import Style from './Style';
import theme from './theme';

import Immutable from 'immutable';

import gridShift from './gridShift';

import {DragDropContext, DragSource, DropTarget} from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

import DraggableItem from './DraggableItem';
import DropSpot from './DropSpot';

function isNumber (o) {
  return typeof o === 'number';
}

function getGridCoordFromClientOffset ({element, clientOffset, gridWidth, gridHeight}) {
  let {left, top, width, height} = element.getBoundingClientRect();
  let {scrollLeft, scrollTop} = document.documentElement;

  return {
    x: Math.floor(gridWidth * ((clientOffset.x - left - scrollLeft) / width)),
    y: Math.floor(gridHeight * ((clientOffset.y - top - scrollTop) / height)),
  };
}

let idxToGridPosition = ({gridWidth, idx}) => {
  return {
    x: idx % gridWidth,
    y: Math.floor(idx/gridWidth),
  };
};

const target = {
  hover (props, monitor, component) {
    let coord = getGridCoordFromClientOffset({
      element: React.findDOMNode(component.refs.container),
      clientOffset: monitor.getClientOffset(),
      gridWidth: component.props.gridWidth,
      gridHeight: getGridHeight(component.state.layout),
    });

    const item = monitor.getItem();
    
    let currentCoord = (component.state.tempLayout || component.state.layout).get(item.childKey);
    if (currentCoord.x === coord.x && currentCoord.y === coord.y) {
      return;
    }

    const layout = component.state.layout;
    const newLayout = component.moveItemToCoord({layout, item, coord});
    component.setState({
      tempLayout: newLayout,
    });
  },

  drop (props, monitor, component) {
    let coord = getGridCoordFromClientOffset({
      element: React.findDOMNode(component.refs.container),
      clientOffset: monitor.getClientOffset(),
      gridWidth: component.props.gridWidth,
      gridHeight: getGridHeight(component.state.layout),
    });

    const item = monitor.getItem();
    
    let currentCoord = (component.state.layout).get(item.childKey);
    if (currentCoord.x === coord.x && currentCoord.y === coord.y) {
      return;
    }

    const layout = component.state.layout;
    const newLayout = component.moveItemToCoord({layout, item, coord});
    if (typeof props.onLayoutChanged === 'function') {
      props.onLayoutChanged(newLayout);
    }
    component.setState({
      tempLayout: null,
      layout: newLayout,
    });
  },
};

let collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
};

function getGridHeight (layout) {
  return layout.reduce((result, item) => {
    return item.y > result ? item.y : result;
  }, 0) + 1;
}

function getDefaultLayout (props) {
  const {
    gridWidth,
    children,
  } = props;

  let keys = Immutable.List();
  React.Children.forEach(children, c => keys = keys.push(c.key));

  return keys.reduce((result, key, idx) => {
    return result.set(key, idxToGridPosition({gridWidth:gridWidth, idx:idx}));
  }, Immutable.Map());
}

@DragDropContext(HTML5Backend)
@DropTarget('DRAGGABLE_ITEM', target, collect)
export default class DraggableGrid extends React.Component {
  static defaultProps = {
    gridWidth: 6,
    rowHeight: 12,
    spacing: 2,
    unit: 'vmin'
  };

  state = (() => {
    return {
      layout: getDefaultLayout(this.props),
      dragging: false,
    }
  })();

  componentWillReceiveProps (newProps) {
    let layout;

    if (!newProps.layout) {
      layout = getDefaultLayout(newProps);
    } else {
      layout = newProps.layout;
    }

    this.setState({
      layout: layout,
    });
  }

  moveItemToCoord ({layout, item, coord}) {
    const currentCoord = layout.get(item.childKey);
    if (currentCoord.x === coord.x && currentCoord.y === coord.y) {
      return layout;
    }

    const gridHeight = getGridHeight(layout);

    const grid = layout.set(item.childKey, null).reduce((result, coord, key) => {
      if (!coord) {
        return result;
      }

      const row = result.get(coord.y);
      return result.set(coord.y, row.set(coord.x, key));
    }, Immutable.List(Immutable.Range(0, gridHeight).map(n => Immutable.List(new Array(this.props.gridWidth)))));

    // console.log('oldLayout', grid.toJS());
    
    let newLayout = gridShift({grid, coord});

    // console.log('newLayout', newLayout.toJS());

    return newLayout.reduce((result, row, y) => {
      return row.reduce((result, key, x) => {
        return result.set(key, {x, y});
      }, result);
    }, Immutable.Map({[item.childKey]: coord}));
  }

  render () {
    const {
      gridWidth,
      rowHeight,
      spacing,
      unit,
      connectDropTarget,
    } = this.props;

    const {
      dragging,
    } = this.state;

    const layout = this.state.tempLayout || this.state.layout;
    
    const itemWidth = ({space=spacing}) => {
      return `(${100/gridWidth}% - ${space + space/gridWidth}${unit})`;
    };

    // NOTE: x must be used inside calc(...),
    //  but y is just a raw number meant to be represented in the
    //  specified `unit`, i.e. 4 => 4vmin
    const gridToScreenPosition = ({x, y}, space=spacing) => {
      let height = rowHeight + 1.5*(spacing - space);
      return {
        x: `(${x} * ${itemWidth({space})} + (${space*(x+1)}${unit}))`,
        y: y*height + space*(y+1),
      };
    };

    const getStyleForPosition = ({x, y}, space=spacing) => {
      let height = rowHeight + 1.5*(spacing - space);
      return {
        width: `calc(${itemWidth({space})})`,
        height: `${height}${unit}`,
        position: 'absolute',
        left: `calc(${x})`,
        top: `${y}${unit}`,
        transition: 'left 250ms, top 250ms',
      };
    };

    const gridHeight = getGridHeight(layout);

    const totalHeight = gridToScreenPosition({x:0, y:gridHeight+1}).y;

    const children = this.props.children.reduce((result, child) => {
      return result.set(child.key, child);
    }, Immutable.Map());

    return connectDropTarget(
      <div className={this.props.className}
        style={Object.assign({}, this.props.style, {
          position: 'relative',
          height: `${totalHeight}${unit}`,
        })}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
          }}
          ref='container'
        >
          {React.Children.map(this.props.children, (child, idx) => {
            let grid = layout.get(child.key);
            let pos = gridToScreenPosition(grid);

            return (
              <DraggableItem
                key={child.key}
                childKey={child.key}
                style={Object.assign({}, getStyleForPosition(pos), {
                  zIndex: 1,
                })}
              >
                {child}
              </DraggableItem>
            );
          })}
        </div>
      </div>
    );
  }
};