import React, {PropTypes} from 'react';
import {DragSource} from 'react-dnd';
import isFunc from './isFunc';

function collect (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

const itemSource = {
  canDrag (props) {
    return !props.locked;
  },

  beginDrag (props) {
    if (isFunc(props.onBeginDrag)) {
      props.onBeginDrag(...arguments);
    }

    return props;
  },

  endDrag (props) {
    if (isFunc(props.onEndDrag)) {
      props.onEndDrag(...arguments);
    }
  }
};

@DragSource('DRAGGABLE_ITEM', itemSource, collect)
export default class DraggableItem extends React.Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
  };

  render () {
    const {
      connectDragSource,
      isDragging,
    } = this.props;

    return connectDragSource(
      <div
        style={Object.assign({}, {
          cursor: this.props.locked ? 'inherit' : 'move',
          overflow: 'visible',
          // opacity: isDragging ? 0.5 : 1,
          zIndex: isDragging ? 4 : 1,
          // display: isDragging ? 'none' : 'initial',
        }, this.props.style)}
      >
        {this.props.children}
      </div>
    );
  }
};