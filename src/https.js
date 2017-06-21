function https(/* hostOrPromise*/) {
  // TODO:
  // if (typeof hostOrPromise === 'string') {
  //   const url = `https://${hostOrPromise}/api/1/`;
  //   this.promise = fetch(`https://${this.host}/api/1/gatekeeper/init`)
  // } else if (hostOrPromise instanceof Promise) {
  //   this.promise = hostOrPromise;
  // } else {
  //   throw new Error('Hostname or Promise of native gatekeeper data argument required');
  // }
  return (call, next) => {
    next();
    return new Promise(
      (resolve) => setTimeout(() => {
        resolve({TODO: 'Actually make a request'});
      }, 123)
    );
  };
}

export default https;
