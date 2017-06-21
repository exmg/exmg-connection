/* eslint-env jest */
import Observable from 'observable';

describe('Observable', () => {
  let obs;

  jest.useFakeTimers();

  beforeEach(() => {
    obs = new Observable();
  });

  describe('on()', () => {
    it('adds an observer to the observers', () => {
      const observer = obs.on(null, () => {});
      expect(obs.observers).toEqual([observer]);
    });

    it('fires callback for each event when filter argument is falsy', () => {
      const cb = jest.fn();

      obs.on(null, cb);
      obs.notify();

      jest.runAllImmediates();
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('filter argument can be a function', () => {
      const cb = jest.fn();
      const event = {};

      obs.on((e) => e === event, cb);
      obs.notify(event);
      obs.notify({});
      obs.notify();

      jest.runAllImmediates();
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledWith(event, true);
    });


    it('filter argument can be a string to be matched with the event type', () => {
      const cb = jest.fn();
      const type = 'type1';
      const event = {type};

      obs.on(type, cb);
      obs.notify(event);
      obs.notify({type: 'type2'});
      obs.notify();

      jest.runAllImmediates();
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenCalledWith(event, true);
    });

    it('filter argument can be a RegExp to be matched with the event type', () => {
      const cb = jest.fn();
      const re = /^type(.*)$/;
      const event1 = {type: 'type1'};
      const event2 = {type: 'type2'};

      obs.on(re, cb);
      obs.notify(event1);
      obs.notify(event2);
      obs.notify();

      jest.runAllImmediates();
      expect(cb).toHaveBeenCalledTimes(2);

      // Note: RegExp matches are passed to callback enabling use of matched parts
      expect(cb).toHaveBeenCalledWith(event1, re.exec(event1.type));
      expect(cb).toHaveBeenLastCalledWith(event2, re.exec(event2.type));
    });

    it('filter argument can be a glob string to be matched with the event type', () => {
      const cb = jest.fn();
      const event1 = {type: 'type1'};
      const event2 = {type: 'type2'};

      obs.on('type*', cb);
      obs.notify(event1);
      obs.notify(event2);
      obs.notify();

      jest.runAllImmediates();
      expect(cb).toHaveBeenCalledTimes(2);

      // Note: '*1' glob is equal to /^(.*)1$/ RegExp
      const re = /^type(.*)$/;
      expect(cb).toHaveBeenCalledWith(event1, re.exec(event1.type));
      expect(cb).toHaveBeenLastCalledWith(event2, re.exec(event2.type));
    });
  });

  describe('off()', () => {
    it('removes an observer from the observers', () => {
      const observer = obs.on(null, () => {});
      obs.off(observer);
      expect(obs.observers).toEqual([]);
    });
  });

  describe('notify()', () => {
    it('passes event object as callback argument', () => {
      const cb = jest.fn();
      const event = {};

      obs.on(null, cb);
      obs.notify(event);

      jest.runAllImmediates();
      expect(cb).toHaveBeenCalledWith(event);
    });

    it('passes filter return value as second callback argument', () => {
      const cb = jest.fn();
      const event = {};
      const filterValue = {};

      obs.on(() => filterValue, cb);
      obs.notify(event);

      jest.runAllImmediates();
      expect(cb).toHaveBeenCalledWith(event, filterValue);
    });

    it('fires callbacks in order', () => {
      const cb = jest.fn();
      const event1 = {};
      const event2 = {};

      obs.on(null, cb);
      obs.notify(event1);
      obs.notify(event2);

      jest.runAllImmediates();
      expect(cb).toHaveBeenCalledTimes(2);
      expect(cb).toHaveBeenCalledWith(event1);
      expect(cb).toHaveBeenLastCalledWith(event2);
    });
  });

  describe('once()', () => {
    // TODO
  });

  describe('setValue()', () => {
    // TODO
  });

  describe('onceValue()', () => {
    // TODO
  });
});
