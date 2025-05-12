chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.set({
		blurRemovalEnabled: true,
		adBlockEnabled: true,
		textReorderEnabled: true,
	});
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
	if (changeInfo.status === "complete") {
		chrome.storage.local.get(
			["blurRemovalEnabled", "adBlockEnabled", "textReorderEnabled"],
			(data) => {
				if (
					data.blurRemovalEnabled !== false ||
					data.adBlockEnabled !== false ||
					data.textReorderEnabled !== false
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
