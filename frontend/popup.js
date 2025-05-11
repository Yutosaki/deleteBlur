function setBlurEnabled(isEnabled) {
	chrome.storage.local.set({ blurRemovalEnabled: isEnabled });
	updateBlurUI(isEnabled);

	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs[0]) {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: "toggleBlurRemoval",
				enabled: isEnabled,
			});
		}
	});
}

function setAdBlockEnabled(isEnabled) {
	chrome.storage.local.set({ adBlockEnabled: isEnabled });
	updateAdBlockUI(isEnabled);

	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs[0]) {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: "toggleAdBlock",
				enabled: isEnabled,
			});
		}
	});
}

function setTextReorderEnabled(isEnabled) {
	chrome.storage.local.set({ textReorderEnabled: isEnabled });
	updateTextReorderUI(isEnabled);

	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs[0]) {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: "toggleTextReorder",
				enabled: isEnabled,
			});
		}
	});
}

function updateBlurUI(isEnabled) {
	if (!document.getElementById("blurOnButton")) return;

	const blurOnButton = document.getElementById("blurOnButton");
	const blurOffButton = document.getElementById("blurOffButton");
	const blurStatusContainer = document.getElementById("blurStatusContainer");
	const blurStatusText = document.getElementById("blurStatusText");

	if (isEnabled) {
		blurOnButton.classList.add("active");
		blurOffButton.classList.remove("active");
		blurStatusContainer.classList.add("status-on");
		blurStatusContainer.classList.remove("status-off");
		blurStatusText.textContent = "ぼかし除去: 有効";
	} else {
		blurOffButton.classList.add("active");
		blurOnButton.classList.remove("active");
		blurStatusContainer.classList.add("status-off");
		blurStatusContainer.classList.remove("status-on");
		blurStatusText.textContent = "ぼかし除去: 無効";
	}
}

function updateAdBlockUI(isEnabled) {
	if (!document.getElementById("adBlockOnButton")) return;

	const adBlockOnButton = document.getElementById("adBlockOnButton");
	const adBlockOffButton = document.getElementById("adBlockOffButton");
	const adBlockStatusContainer = document.getElementById(
		"adBlockStatusContainer",
	);
	const adBlockStatusText = document.getElementById("adBlockStatusText");

	if (isEnabled) {
		adBlockOnButton.classList.add("active");
		adBlockOffButton.classList.remove("active");
		adBlockStatusContainer.classList.add("status-on");
		adBlockStatusContainer.classList.remove("status-off");
		adBlockStatusText.textContent = "広告ブロック: 有効";
	} else {
		adBlockOffButton.classList.add("active");
		adBlockOnButton.classList.remove("active");
		adBlockStatusContainer.classList.add("status-off");
		adBlockStatusContainer.classList.remove("status-on");
		adBlockStatusText.textContent = "広告ブロック: 無効";
	}
}

function updateTextReorderUI(isEnabled) {
	if (!document.getElementById("textReorderOnButton")) return;

	const textReorderOnButton = document.getElementById("textReorderOnButton");
	const textReorderOffButton = document.getElementById("textReorderOffButton");
	const textReorderStatusContainer = document.getElementById(
		"textReorderStatusContainer",
	);
	const textReorderStatusText = document.getElementById(
		"textReorderStatusText",
	);

	if (isEnabled) {
		textReorderOnButton.classList.add("active");
		textReorderOffButton.classList.remove("active");
		textReorderStatusContainer.classList.add("status-on");
		textReorderStatusContainer.classList.remove("status-off");
		textReorderStatusText.textContent = "文章修正: 有効";
	} else {
		textReorderOffButton.classList.add("active");
		textReorderOnButton.classList.remove("active");
		textReorderStatusContainer.classList.add("status-off");
		textReorderStatusContainer.classList.remove("status-on");
		textReorderStatusText.textContent = "文章修正: 無効";
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const blurOnButton = document.getElementById("blurOnButton");
	const blurOffButton = document.getElementById("blurOffButton");
	const adBlockOnButton = document.getElementById("adBlockOnButton");
	const adBlockOffButton = document.getElementById("adBlockOffButton");
	const textReorderOnButton = document.getElementById("textReorderOnButton");
	const textReorderOffButton = document.getElementById("textReorderOffButton");

	chrome.storage.local.get(
		["blurRemovalEnabled", "adBlockEnabled", "textReorderEnabled"],
		(data) => {
			const isBlurRemovalEnabled = data.blurRemovalEnabled !== false;
			const isAdBlockEnabled = data.adBlockEnabled !== false;
			const isTextReorderEnabled = data.textReorderEnabled !== false;

			updateBlurUI(isBlurRemovalEnabled);
			updateAdBlockUI(isAdBlockEnabled);
			updateTextReorderUI(isTextReorderEnabled);
		},
	);

	blurOnButton.addEventListener("click", () => {
		setBlurEnabled(true);
	});

	blurOffButton.addEventListener("click", () => {
		setBlurEnabled(false);
	});

	adBlockOnButton.addEventListener("click", () => {
		setAdBlockEnabled(true);
	});

	adBlockOffButton.addEventListener("click", () => {
		setAdBlockEnabled(false);
	});

	textReorderOnButton.addEventListener("click", () => {
		setTextReorderEnabled(true);
	});

	textReorderOffButton.addEventListener("click", () => {
		setTextReorderEnabled(false);
	});
});
