function procedures(procedures = {}) {
  return (call, next) => {
    const {name, params} = call;
    const procedure = name.split('.').reduce((procedures, key) => {
      const procedure = procedures[key];
      if (!procedure) {
        throw new Error(`Procedure not found: ${name}`);
      }
      return procedure;
    }, procedures);

    // TODO: Move all https specific code into https middleware?
    // Or leave it here/somewhere and also enable manually specifying url etc?
    const {method='GET', query=[]} = procedure;

    // Add standard prefix and suffix to url
    // TODO: Add host based on gatekeeper data
    let url = `/api/1/${procedure.url}?nocache=${Date.now()}`;

    // Default to passing params as request body
    const body = Object.assign({}, params);
    // TODO: Be strict about body params? (e.g: only allow certain keys with certain types)

    // Path params
    url = url.replace(/{(\w+)}/g, (m, key) => {
      const value = params[key];

      // TODO: Be strict about path params?
      // if (value === undefined) {
      //   throw new Error(`Missing required path param: ${key}`);
      // }
      // if (typeof value !== 'string') {
      //   throw new Error(`Path param ${key} value should be string not ${typeof value}`);
      // }

      delete body[key];

      return encodeURIComponent(value);
    });

    // Query params
    url = query.reduce((url, key) => {
      const value = params[key];

      if (value === undefined) {
        return url;
      }

      // TODO: Be strict about query params?
      // if (typeof value !== 'string') {
      //   throw new Error(`Query param ${key} value should be string not ${typeof value}`);
      // }

      delete body[key];

      // Note: ?nocache was added above already, so always use & separator
      return url.replace(/((#.*)?$)/, `&${encodeURIComponent(key)}=${encodeURIComponent(value)}$1`);
    }, url);

    Object.assign(call, {method, url, body});

    next(call);
  };
}

export default procedures;
