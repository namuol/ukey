import {EventEmitter} from 'events';
import Immutable from 'immutable';

class UserData extends EventEmitter {
  set (key, value) {
    localStorage.setItem(key, JSON.stringify(value.toJS()));
    this.emit('change');
    this.emit(`change:${key}`);
  }

  get (key) {
    const json = localStorage.getItem(key);
    
    if (!json) {
      return;
    }

    return Immutable.fromJS(JSON.parse(json));
  }
}

export default new UserData();