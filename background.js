chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({ exceptions: [] }, data => {
    chrome.storage.sync.set({ exceptions: data.exceptions });
  });
});
