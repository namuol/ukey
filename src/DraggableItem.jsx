import React, {PropTypes} from 'react';
import {DragSource} from 'react-dnd';

function collect (connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

const itemSource = {
  beginDrag (props) {
    console.log('beginDrag', props);
    return {};
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
          cursor: 'move',
          overflow: 'visible',
          display: isDragging ? 'none' : 'initial',
        }, this.props.style)}
      >
        {this.props.children}
      </div>
    );
  }
};