const button = document.getElementById('open-extensions');
button?.addEventListener('click', () => {
  const url = `chrome://extensions/?id=${chrome.runtime.id}`;
  chrome.tabs.create({ url });
});
