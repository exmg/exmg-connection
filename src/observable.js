/* global setImmediate */
import 'set-immediate';

// TODO: Store in separate module? escape-regex.js or util.js (along with other util functions)?
function escapeRegex(str) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// TODO: extends Disposable to help prevent leaks?
class Observable {
  constructor() {
    this.observers = [];
  }

  on(filter, callback) {
    if (typeof filter === 'string') {
      if (filter.indexOf('*') >= 0) {
        filter = new RegExp('^' + escapeRegex(filter).replace(/\\\*/g, '(.*)') + '$');
      } else {
        const value = filter;
        filter = (event) => event && event.type === value;
      }
    }

    if (filter instanceof RegExp) {
      const re = filter;
      filter = (event) => event && re.exec(event.type);
    }

    const observer = [filter, callback];
    this.observers.push(observer);
    return observer;
  }

  once(filter) {
    return new Promise((resolve) => {
      const observer = this.on(filter, (value) => {
        resolve(value);
        this.off(observer);
      });
    });
  }

  off(observer) {
    const index = this.observers.indexOf(observer);
    if (index < 0) {
      throw new Error('Observer not found');
    }
    this.observers.splice(index, 1);
  }

  notify(event) {
    this.observers.forEach(([filter, callback]) => {
      // Call via setImmediate to provide consistent async callback behavior
      // and to prevent callback exceptions from breaking subsequent callbacks and the calling context
      if (filter) {
        const matches = filter(event);
        if (matches) {
          setImmediate(callback, event, matches);
        }
      } else {
        setImmediate(callback, event);
      }
    });
  }

  // TODO: Add support for key path, e.g: ('a.b', 1) => {a: {b: 1}}
  setValue(key, value, notify = (this[key] !== value)) {
    this[key] = value;
    if (notify) {
      this.notify({type: key, value});
    }
  }

  // TODO: Add support for key path
  // TODO: Also resolve ('a.b', 1) when you setValue('a', {b:1})
  onceValue(key, onceValue) {
    return this[key] === onceValue ? Promise.resolve(onceValue) :
      this.once(({type, value}) => type === key && value === onceValue).then(({value}) => value);
  }
}

export default Observable;
