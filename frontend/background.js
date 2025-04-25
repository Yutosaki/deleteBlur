chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.set({ blurRemovalEnabled: true });
});

chrome.action.onClicked.addListener((tab) => {});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete") {
		chrome.storage.local.get("blurRemovalEnabled", function (data) {
			if (data.blurRemovalEnabled !== false) {
				chrome.scripting.executeScript({
					target: { tabId: tabId },
					files: ["content.js"],
				});
			}
		});
	}
});
