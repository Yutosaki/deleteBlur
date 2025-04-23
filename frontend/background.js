chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      document.querySelectorAll('*').forEach(el => {
        el.style.filter = 'none';
        el.style.opacity = '1';
      });
    }
  });
});

