/* eslint-env browser */
/* global setImmediate */

/**
 * Minimalistic polyfill for setImmediate() support in modern (as of 2017) browsers using MutationObserver.
 */
if (typeof setImmediate === 'undefined') {
  const tasks = [];
  const el = document.createElement('div');
  const tick = () => el.setAttribute('x', 'x');

  new MutationObserver(() => {
    const len = tasks.length;
    let i = 0;

    // Catch exceptions without actually catching them to leave stack traces nice and pristine
    try {
      for (; i < len; i++) {
        let {callback, args} = tasks[i];
        callback(...args);
      }
    } finally {
      // If we did not cleanly finish the iteration then move past the task that threw the exception and try again
      if (i < len && ++i < len) {
        tick();
      }

      // Remove tasks that were called in this tick
      tasks.splice(0, i);
    }
  }).observe(el, {attributes: true});

  window.setImmediate = (callback, ...args) => {
    tasks.push({callback, args});
    tick();
  };
}
