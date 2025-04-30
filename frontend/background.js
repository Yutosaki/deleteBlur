chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.set({
		blurRemovalEnabled: true,
		adBlockEnabled: true,
	});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
	if (changeInfo.status === "complete") {
		chrome.storage.local.get(
			["blurRemovalEnabled", "adBlockEnabled"],
			(data) => {
				if (
					data.blurRemovalEnabled !== false ||
					data.adBlockEnabled !== false
				) {
					chrome.scripting.executeScript({
						target: { tabId: tabId },
						files: ["content.js"],
					});
				}
			},
		);
	}
});
