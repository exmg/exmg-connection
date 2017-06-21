import Observable from 'observable';

class Connection extends Observable {
  constructor(middlewares = []) {
    super();
    this.middlewares = middlewares;
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  // Note: falsy next call arguments and middleware return values will be considered as undefined and ignored
  rpc(name, params) {
    // Pass call name and params through all middlewares allowing them to change those
    // and add other call properties by calling next() with the next call object.
    //
    // ?? Also pass a promise of this asynchronous middleware call pre-processing,
    // ?? thus allowing the request making middleware at the head of the chain
    // ?? to wait for the final call object to be assembled.
    //
    // Also pass the result of the previous middleware() call on to the next one,
    // thus allowing for not only monitoring but also manipulation of the request response.
    /*
    const promise = this.middlewares.reduce(
      ..
      // Note: promise will be available after Promise.resolve().then() tick
      Promise.resolve().then(
        () => ({
          call: {name, params},
          promise,
        })
      )
    );
    return promise.then(({result}) => result);
    */
    return this.middlewares.reduce(
      (prevPromise, middleware) => prevPromise.then(
        ({call, result}) => new Promise((resolve) => {
          const next = {};
          next.result = middleware(call, (nextCall) => {
            next.call = nextCall || call;
            setTimeout(() => resolve(next), 0);
            return result;
          }) || result;
        })
      ),
      Promise.resolve({
        call: {name, params},
      })
    ).then(
      ({result}) => result
    );
  }
}

export default Connection;
