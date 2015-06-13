import React, {PropTypes} from 'react';
import {DropTarget} from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

const target = {
  drop (props) {
    console.log('drop', props);
    return {};
  }
};

let collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
};

@DropTarget('DRAGGABLE_ITEM', target, collect)
export default class DropSpot extends React.Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  };

  render () {
    const {
      x, y,
      connectDropTarget,
      isOver
    } = this.props;

    return connectDropTarget(
      <div style={Object.assign({
        opacity: 0.1,
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '2vmin',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }, this.props.style)}>
        {isOver &&
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            zIndex: 1,
            opacity: 0.5,
            backgroundColor: 'red',
          }} />
        }
        {this.props.children}
      </div>
    );
  }
};
