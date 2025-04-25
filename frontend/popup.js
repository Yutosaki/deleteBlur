document.addEventListener("DOMContentLoaded", function () {
	const onButton = document.getElementById("onButton");
	const offButton = document.getElementById("offButton");
	const statusContainer = document.getElementById("statusContainer");
	const statusText = document.getElementById("statusText");

	chrome.storage.local.get("blurRemovalEnabled", function (data) {
		const isEnabled = data.blurRemovalEnabled !== false;
		updateUI(isEnabled);
	});

	onButton.addEventListener("click", function () {
		setEnabled(true);
	});

	offButton.addEventListener("click", function () {
		setEnabled(false);
	});

	function setEnabled(isEnabled) {
		chrome.storage.local.set({ blurRemovalEnabled: isEnabled });
		updateUI(isEnabled);

		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
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
		} else {
			offButton.classList.add("active");
			onButton.classList.remove("active");
		}

		if (isEnabled) {
			statusContainer.className = "status-container status-on";
			statusText.textContent = "現在の状態: 有効";
		} else {
			statusContainer.className = "status-container status-off";
			statusText.textContent = "現在の状態: 無効";
		}
	}
});
