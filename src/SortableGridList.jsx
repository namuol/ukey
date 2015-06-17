import React, {PropTypes} from 'react';

import invariant from 'react/lib/invariant';

import Style from './Style';
import theme from './theme';

import Immutable from 'immutable';

import gridShift from './gridShift';

import {DragDropContext, DragSource, DropTarget} from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

import DraggableItem from './DraggableItem';
import DropSpot from './DropSpot';

import clamp from './clamp';

function isNumber (o) {
  return typeof o === 'number';
}

function gridCoordToIdx ({x, y, gridWidth}) {
  return y * gridWidth + clamp(x, 0, gridWidth);
}

function getIdxFromClientOffset ({element, clientOffset, gridWidth, gridHeight}) {
  const {left, top, width, height} = element.getBoundingClientRect();
  const {scrollLeft, scrollTop} = document.documentElement;

  const coord = {
    x: Math.floor(gridWidth * ((clientOffset.x - left - scrollLeft) / width)),
    y: Math.floor(gridHeight * ((clientOffset.y - top - scrollTop) / height)),
  };

  return gridCoordToIdx({
    gridWidth,
    ...coord,
  });
}

function getLayoutPositionFromClientOffset ({element, clientOffset, gridWidth, gridHeight, component}) {
  const {left, top, width, height} = element.getBoundingClientRect();
  const {scrollLeft, scrollTop} = document.documentElement;

  const sectionDisplayHeights = getSectionDisplayHeights({
    layout: component.state.layout,
    ...component.props,
  });

  const vSpacing = component.props.vSpacing;

  const sectionTops = getSectionTops({sectionDisplayHeights, ...component.props});

  // TODO HACK: I'm assuming we're using VMIN and that VMIN is width, not height:
  const mouseY = ((clientOffset.y - top - scrollTop) / width) * 100;

  // First determine the current section:
  const findResult = sectionTops.reduce((result, sectionTop, sectionNumber) => {
    if (!!result) {
      return result;
    }

    const sectionDisplayHeight = sectionDisplayHeights.get(sectionNumber);

    if (mouseY > sectionTop && mouseY < (sectionTop + sectionDisplayHeight + vSpacing*(sectionNumber+1))) {
      return [sectionNumber, sectionTop, sectionDisplayHeight];
    }
  }, false);

  const [section, sectionTop, sectionDisplayHeight] = findResult;

  const sectionHeight = getSectionHeight({
    section: component.state.layout.get(section),
    gridWidth,
  });

  // Determine coordinate within the section:
  const coord = {
    x: Math.floor(gridWidth * ((clientOffset.x - left - scrollLeft) / width)),
    y: Math.floor((mouseY - sectionTop) / (sectionDisplayHeight/sectionHeight)),
  };

  return {
    sectionNumber: section,
    idx: gridCoordToIdx({
      gridWidth,
      ...coord,
    }),
  }
}

function idxToGridPosition ({gridWidth, idx}) {
  return {
    x: idx % gridWidth,
    y: Math.floor(idx/gridWidth),
  };
}

function getSectionHeight ({section, gridWidth}) {
  return Math.max(1, Math.ceil(section.size / gridWidth));
}

function getTotalHeight ({layout, gridWidth}) {
  return layout.reduce((result, section) => {
    return result + getSectionHeight({section, gridWidth});
  }, 0);
}

function handleDragEvent (props, monitor, component, oldLayout) {
  const item = monitor.getItem();

  const [oldSectionNumber, oldIdx] = oldLayout.reduce((result, section, sectionNumber) => {
    if (!!result) {
      return result;
    }

    const idx = section.indexOf(item.childKey);
    if (idx >= 0) {
      return [sectionNumber, idx];
    }
  }, false);

  const {sectionNumber, idx} = getLayoutPositionFromClientOffset({
    component: component,
    element: React.findDOMNode(component.refs.container),
    clientOffset: monitor.getClientOffset(),
    gridWidth: component.props.gridWidth,
    gridHeight: getTotalHeight({
      layout: component.state.layout,
      gridWidth: component.props.gridWidth,
    }),
  });

  if (sectionNumber === oldSectionNumber && idx === oldIdx) {
    return;
  }

  const layout = oldLayout.toJS();
  const oldSection = layout[oldSectionNumber];
  const newSection = layout[sectionNumber];
  oldSection.splice(oldIdx, 1);
  newSection.splice(idx, 0, item.childKey);
  return Immutable.fromJS(layout);
}

const target = {
  hover (props, monitor, component) {
    let newLayout = handleDragEvent(...arguments, component.state.layout);
    
    if (newLayout) {
      component.setState({
        layout: newLayout,
      });
    }
  },

  drop (props, monitor, component) {
    let newLayout = handleDragEvent(...arguments, component.props.layout);
    
    if (newLayout) {
      component.setState({
        layout: newLayout,
      });
      component.props.onLayoutChanged(newLayout);
    }
  }
};

let collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
};

function getSectionDisplayHeight ({section, gridWidth, rowHeight, spacing}) {
  return getSectionHeight({section, gridWidth}) * (rowHeight + spacing);
}

function getSectionDisplayHeights ({layout, gridWidth, rowHeight, spacing}) {
  return layout.map((section) => {
    return getSectionDisplayHeight({section, gridWidth, rowHeight, spacing});
  });
}

function getSectionTops ({sectionDisplayHeights, gridWidth, rowHeight, spacing, vSpacing}) {
  return sectionDisplayHeights.reduce((tops, sectionDisplayHeight) => {
    return tops.push(tops.last() + vSpacing + sectionDisplayHeight);
  }, Immutable.List([0]));
}

function getLayoutPosition ({layout, child}) {
  let idx;
  const section = layout.findIndex(s => (idx = s.indexOf(child.key)) >= 0);
  return {section, idx};
}

function checkProps (props) {
  const childCount = props.children.size;
  const layoutCount = props.layout.reduce((sum, section) => {
    return sum + section.size;
  }, 0);

  invariant(
    childCount === layoutCount,
    `Received a list of ${childCount} children, but the \`layout\` prop has ${layoutCount} items.`
  );
}

@DragDropContext(HTML5Backend)
@DropTarget('DRAGGABLE_ITEM', target, collect)
export default class SortableGridList extends React.Component {
  static propTypes = {
    layout: PropTypes.object.isRequired,
    onLayoutChanged: PropTypes.func.isRequired,
  };

  static defaultProps = {
    gridWidth: 6,
    rowHeight: 12,
    spacing: 2,
    vSpacing: 2,
    unit: 'vmin'
  };

  state = (() => {
    checkProps(this.props);
    return {
      layout: this.props.layout,
    };
  })();

  componentWillReceiveProps (newProps) {
    checkProps(newProps);
    this.setState({
      layout: newProps.layout,
    });
  }

  render () {
    const {
      gridWidth,
      rowHeight,
      spacing,
      unit,
      connectDropTarget,
      vSpacing,
    } = this.props;

    const {
      layout,
    } = this.state;
    
    const itemWidth = ({space=spacing}) => {
      return `(${100/gridWidth}% - ${space + space/gridWidth}${unit})`;
    };

    // NOTE: x must be used inside calc(...),
    //  but y is just a raw number meant to be represented in the
    //  specified `unit`, i.e. 4 => 4vmin
    const idxToScreenPosition = (idx, space=spacing) => {
      let {x, y} = idxToGridPosition({gridWidth, idx});
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
        // transform: `translate3d(calc(${x}), ${y}${unit}, 0)`,
        transition: 'left 250ms, top 250ms',
      };
    };

    const gridHeight = getTotalHeight({layout, gridWidth});

    const totalHeight = gridHeight * rowHeight + (gridHeight + 1)*spacing;

    const children = this.props.children.reduce((result, child) => {
      return result.set(child.key, child);
    }, Immutable.Map());

    const sectionDisplayHeights = getSectionDisplayHeights({layout, ...this.props});
    const sectionTops = getSectionTops({sectionDisplayHeights, ...this.props});

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
          {React.Children.map(this.props.children, (child) => {
            let layoutPos = getLayoutPosition({layout, child});
            let pos = idxToScreenPosition(layoutPos.idx);
            pos.y += sectionTops.get(layoutPos.section);
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