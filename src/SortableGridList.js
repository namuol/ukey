import React, {PropTypes} from 'react';
import {compose} from 'ramda';

import theme from './theme';

import Immutable from 'immutable';

import {DragDropContext, DropTarget} from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

import DraggableItem from './DraggableItem';

import Color from 'color';
import clamp from './clamp';
import isFunc from './isFunc';

const PHI = 1.61803398875;

function gridCoordToIdx ({x, y, gridWidth}) {
  return y * gridWidth + clamp(0,x,gridWidth-1);
}

function getLayoutPositionFromClientOffset ({element, clientOffset, gridWidth, component}) {
  const {left, top, width} = element.getBoundingClientRect();
  const {scrollLeft, scrollTop} = document.documentElement;
  const layout = component.getLayout();

  const sectionDisplayHeights = getMaxSectionDisplayHeights(component.props, layout);

  const sectionTops = getSectionTops({sectionDisplayHeights, ...component.props});

  // TODO HACK: I'm assuming we're using VMIN and that VMIN is width, not height:
  const mouseY = clamp(((clientOffset.y - top - scrollTop) / width) * 100, 0, sectionTops.last());

  // First determine the current section:
  const findResult = sectionTops.slice(0,sectionTops.size-1).reduce((result, sectionTop, sectionNumber) => {
    if (!!result) {
      return result;
    }

    const sectionDisplayHeight = sectionDisplayHeights.get(sectionNumber);

    if (mouseY >= sectionTop && mouseY <= (sectionTop + sectionDisplayHeight)) {
      return [sectionNumber, sectionTop, sectionDisplayHeight];
    }

    return undefined;
  }, false);

  const [section, sectionTop, sectionDisplayHeight] = findResult;

  const sectionHeight = getSectionHeight({
    section: layout.get(section),
    gridWidth,
  });

  // Determine coordinate within the section:
  const coord = {
    x: Math.floor(gridWidth * ((clientOffset.x - left - scrollLeft) / width)),
    y: Math.min(sectionHeight-1, Math.floor((mouseY - sectionTop) / (sectionDisplayHeight/sectionHeight))),
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

    return undefined;
  }, false);

  const {sectionNumber, idx} = getLayoutPositionFromClientOffset({
    component: component,
    // eslint-disable-next-line react/no-deprecated
    element: React.findDOMNode(component.refs.container),
    clientOffset: monitor.getClientOffset(),
    gridWidth: component.props.gridWidth,
    gridHeight: getTotalHeight({
      layout: component.getLayout(),
      gridWidth: component.props.gridWidth,
    }),
  });

  if (sectionNumber === oldSectionNumber && idx === oldIdx) {
    return;
  }

  // console.log('childKey', item.childKey);
  // console.log({sectionNumber, idx});

  const layout = oldLayout.toJS();
  const oldSection = layout[oldSectionNumber];
  let newSection = layout[sectionNumber];
  // console.log('oldSection before', oldSection.join(''));
  // console.log('newSection before', newSection.join(''));
  oldSection.splice(oldIdx, 1);
  newSection.splice(idx, 0, item.childKey);
  // console.log('oldSection after', oldSection.join(''));
  // console.log('newSection after', newSection.join(''));
  return Immutable.fromJS(layout);
}

const target = {
  hover (props, monitor, component) {
    const oldLayout = component.getLayout();
    const newLayout = handleDragEvent(...arguments, oldLayout);

    if (newLayout && !Immutable.is(oldLayout, newLayout)) {
      // console.log('HOVER:');
      // console.log('oldLayout', oldLayout.toJS());
      // console.log('newLayout', newLayout.toJS());
      component.setState({
        layout: newLayout,
      });
    }
  },

  // drop (props, monitor, component) {
  //   console.log('DROP:');
  //   const oldLayout = component.getLayout();
  //   const newLayout = handleDragEvent(...arguments, oldLayout) || oldLayout;

  //   console.log('oldLayout', oldLayout.toJS());
  //   console.log('newLayout', newLayout.toJS());

  //   component.props.onLayoutChanged(newLayout);
  //   component.setState({
  //     layout: null,
  //   });
  // }
};

let collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
};

function getSectionDisplayHeight ({section, gridWidth, rowHeight, spacing, vSpacing}) {
  const sectionHeight = getSectionHeight({section, gridWidth});
  return sectionHeight*rowHeight + (sectionHeight + 1)*spacing + vSpacing;
}

function getSectionDisplayHeights ({layout, gridWidth, rowHeight, spacing, vSpacing}) {
  return layout.map((section) => {
    return getSectionDisplayHeight({section, gridWidth, rowHeight, spacing, vSpacing});
  });
}

function getSectionTops ({sectionDisplayHeights, gridWidth, rowHeight, spacing, vSpacing}) {
  return sectionDisplayHeights.reduce((tops, sectionDisplayHeight) => {
    return tops.push(tops.last() + sectionDisplayHeight);
  }, Immutable.List([0]));
}

function getLayoutPosition ({layout, child}) {
  let idx;
  const section = layout.findIndex(s => (idx = s.indexOf(child.key)) >= 0);
  return {section, idx};
}

function checkProps (props) {
  // FIXME: Find a replacement for invariant from react:
  // const childCount = props.children.size;
  // const layoutCount = props.layout.reduce((sum, section) => {
  //   return sum + section.size;
  // }, 0);

  // invariant(
  //   childCount === layoutCount,
  //   `Received a list of ${childCount} children, but the \`layout\` prop has ${layoutCount} items.`
  // );
}

function getMaxSectionDisplayHeights (props, layout) {
  const {gridWidth, rowHeight, spacing, vSpacing} = props;

  const sectionDisplayHeights_props = getSectionDisplayHeights({layout: props.layout, gridWidth, rowHeight, spacing, vSpacing});
  const sectionDisplayHeights_state = getSectionDisplayHeights({layout, gridWidth, rowHeight, spacing, vSpacing});

  return sectionDisplayHeights_props.reduce((result, sectionDisplayHeight_props, sectionNumber) => {
    return result.push(Math.max(sectionDisplayHeight_props, sectionDisplayHeights_state.get(sectionNumber) || 0));
  }, Immutable.List());
}

class SortableGridList extends React.Component {
  static propTypes = {
    layout: PropTypes.object.isRequired,
    onLayoutChanged: PropTypes.func.isRequired,
  };

  static defaultProps = {
    gridWidth: 6,
    rowHeight: 12,
    spacing: 2,
    vSpacing: 0,
    unit: 'vmin'
  };

  state = (() => {
    checkProps(this.props);
    return {};
  })();

  componentWillReceiveProps (newProps) {
    checkProps(newProps);
  }

  shouldComponentUpdate (newProps, newState) {
    return !Immutable.is(newState, this.state) || !Immutable.is(newProps, this.props);
  }

  getLayout () {
    return this.state.layout || this.props.layout;
  }

  render () {
    const {
      gridWidth,
      rowHeight,
      spacing,
      unit,
      connectDropTarget,
    } = this.props;

    const layout = this.getLayout();

    // console.log('renderLayout', layout.toJS(), this.props.layout.toJS());

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

    const sectionDisplayHeights = getMaxSectionDisplayHeights(this.props, layout);
    const sectionTops = getSectionTops({sectionDisplayHeights, ...this.props});
    const totalHeight = sectionDisplayHeights.reduce((r, s) => {return r + s}, 0);
    return (
      <div className={this.props.className}
        style={Object.assign({}, this.props.style, {
          position: 'relative',
        })}
      >
        {
          connectDropTarget(<div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: this.state.dragging ? 'block' : 'none',
            opacity: 0,
            background: 'red',
            zIndex: 3,
          }} />)
        }

        <div
          style={{
            width: '100%',
            transition: 'height 250ms',
            height: `${totalHeight}${unit}`,
            backgroundColor: 'rgba(0,0,0,0.1)',
          }}
          ref='container'
        >
          {sectionDisplayHeights.map((sectionDisplayHeight, sectionNumber) => {
            return <div key={sectionNumber}
              style={{
                position: 'absolute',
                left: 0,
                top: `${sectionTops.get(sectionNumber)}${unit}`,
                width: '100%',
                transition: 'height 250ms, top 250ms',
                height: `${sectionDisplayHeight}${unit}`,
                background: Color(theme.bgColor).rotate(180 - 60*PHI*sectionNumber).darken(0.1+sectionNumber%2*0.1).desaturate(0.3).rgbString(),
                cursor: isFunc(this.props.onClickSection) ? 'pointer' : 'initial',
                borderBottom: `0.3vmin solid ${Color(theme.dark).clearer(0.8).rgbString()}`,
              }}
              onClick={() => {
                if (isFunc(this.props.onClickSection)) {
                  this.props.onClickSection(sectionNumber);
                }
              }}
            />
          })}

          {React.Children.map(this.props.children, (child) => {
            // console.log(layout.toJS(), child.key);
            let layoutPos = getLayoutPosition({layout, child});
            let pos = idxToScreenPosition(layoutPos.idx);
            pos.y += sectionTops.get(layoutPos.section);
            return (
              <DraggableItem
                key={child.key}
                locked={!!child.props.locked}
                childKey={child.key}
                onBeginDrag={() => {
                  this.setState({
                    dragging: true,
                    draggingChildKey: child.key,
                  });
                }}
                onEndDrag={() => {
                  this.props.onLayoutChanged(this.state.layout || this.props.layout);
                  this.setState({
                    layout: null,
                    dragging: false,
                    draggingChildKey: null,
                  });
                }}
                style={Object.assign({}, getStyleForPosition(pos), {
                  zIndex: this.state.draggingChildKey === child.key ? 4 : 1,
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

export default compose(
  DragDropContext(HTML5Backend),
  DropTarget('DRAGGABLE_ITEM', target, collect)
)(SortableGridList);
