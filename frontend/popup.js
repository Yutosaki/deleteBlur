document.addEventListener("DOMContentLoaded", () => {
	const onButton = document.getElementById("onButton");
	const offButton = document.getElementById("offButton");
	const statusContainer = document.getElementById("statusContainer");
	const statusText = document.getElementById("statusText");

	chrome.storage.local.get("blurRemovalEnabled", (data) => {
		const isEnabled = data.blurRemovalEnabled !== false;
		updateUI(isEnabled);
	});

	onButton.addEventListener("click", () => {
		setEnabled(true);
	});

	offButton.addEventListener("click", () => {
		setEnabled(false);
	});

	function setEnabled(isEnabled) {
		chrome.storage.local.set({ blurRemovalEnabled: isEnabled });
		updateUI(isEnabled);

		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]) {
				chrome.tabs.sendMessage(tabs[0].id, {
					action: "toggleBlurRemoval",
					enabled: isEnabled,
				});
			}
		});
	}

	function updateUI(isEnabled) {
		if (isEnabled) {
			onButton.classList.add("active");
			offButton.classList.remove("active");

			statusContainer.classList.add("status-on");
			statusContainer.classList.remove("status-off");
			statusText.textContent = "現在の状態: 有効";
		} else {
			offButton.classList.add("active");
			onButton.classList.remove("active");

			statusContainer.classList.add("status-off");
			statusContainer.classList.remove("status-on");
			statusText.textContent = "現在の状態: 無効";
		}
	}
});
