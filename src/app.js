import Native from 'Native';
import MockNative from 'MockNative';
import MockConnection from 'MockConnection';
import Connection from 'Connection';

// TODO: Remove this module; just have apps do this themselves (e.g: copy-paste and adapt) ?
// In that case move this into a test?
// Or move this out of here and into a separate project (e.g: exmg-app)?
class App {
  constructor(options) {
    // Default options
    options = Object.assign({
      wrapper: false,
      server: 'mock',
    }, options);

    // URL search param option overrides
    const usp = new URLSearchParams(location.search);
    if (usp.has('wrapper')) {
      options.wrapper = usp.get('wrapper') === '1';
    }
    if (usp.has('server')) {
      options.server = usp.get('server');
    }

    this.options = options;

    const {wrapper, server} = options;

    this.native = wrapper ? new Native() : new MockNative({server});
    this.connection = server === 'mock' ? new MockConnection() : new Connection();
  }
}

export default App;
