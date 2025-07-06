// Minimal Vue 3-like API stub used for the demo
const Vue = {
  ref: v => ({ value: v }),
  onMounted: fn => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  },
  createApp: opts => ({
    mount: selector => {
      if (opts && typeof opts.setup === 'function') {
        opts.setup();
      }
    }
  })
};
