import React, {PropTypes} from 'react';
import {DropTarget} from 'react-dnd';

import isFunc from './isFunc';

const target = {
  drop (props, monitor, component) {
    if (isFunc(props.onDrop)) {
      props.onDrop(...arguments);
    }

    return props;
  },

  hover (props, monitor, component) {
    if (isFunc(props.onHover)) {
      props.onHover(...arguments);
    }
  },
};

let collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
};

class DropSpot extends React.Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  };

  render () {
    const {
      connectDropTarget,
    } = this.props;

    return connectDropTarget(
      <div style={Object.assign({
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }, this.props.style, {
        background: 'rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.1)',
      })}>
        {this.props.children}
      </div>
    );
  }
};

export default DropTarget('DRAGGABLE_ITEM', target, collect)(DropSpot);
