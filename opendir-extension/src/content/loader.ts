(function openDirLoader() {
  const mainUrl = chrome.runtime.getURL('main.js');
  import(mainUrl).then((module) => {
    const perf = performance.now();
    module.onExecute({ perf });
  }).catch((error) => {
    console.error('[OpenDir] failed to load main bundle', error);
  });
})();
