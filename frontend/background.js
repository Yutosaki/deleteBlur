chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      for (const el of document.querySelectorAll("*")) {
        el.style.filter = "none";
        el.style.opacity = "1";
      }
    },
  });
});

