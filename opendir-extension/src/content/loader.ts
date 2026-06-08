(function openDirLoader() {
  const mainUrl = chrome.runtime.getURL('main.js');
  import(mainUrl).then((module) => {
    const execute = module.onExecute ?? module.default?.onExecute;
    if (typeof execute !== 'function') {
      throw new TypeError('OpenDir main bundle did not export onExecute');
    }
    execute({ perf: performance.now() });
  }).catch((error) => {
    console.error('[OpenDir] failed to load main bundle', error);
  });
})();
