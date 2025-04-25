function removeBlur() {
	for (const el of document.querySelectorAll(
		'div[style*="position:absolute"], div[style*="z-index"]',
	)) {
		if (
			el.innerText.includes("申し訳") ||
			el.innerText.includes("メンバーシップ")
		) {
			el.remove();
		}
	}

	const answerBlocks = document.querySelectorAll(".ansbg");

	for (const block of answerBlocks) {
		const blurredElements = block.querySelectorAll(
			'div[style*="filter:blur"], div[style*="opacity"]',
		);

		if (blurredElements.length === 0) continue;

		const texts = [];
		for (const el of blurredElements) {
			const text = el.innerText.trim();
			if (text) texts.push(text);
		}

		for (const el of blurredElements) {
			el.style.filter = "none";
			el.style.opacity = "1";
			el.style.userSelect = "text";
			el.style.pointerEvents = "auto";
		}

		if (texts.length > 0) {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 2000);

				fetch("http://localhost:8080/reorder", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ texts }),
					signal: controller.signal,
				})
					.then((response) => {
						clearTimeout(timeoutId);
						if (response.ok) {
							return response.json();
						}
						throw new Error(`Response not OK: ${response.statusText}`);
					})
					.then((data) => {
						if (data.texts && Array.isArray(data.texts)) {
							let idx = 0;
							for (const el of blurredElements) {
								if (data.texts[idx]) {
									el.innerText = data.texts[idx];
								}
								idx++;
							}
						}
					})
					.catch((err) => {
						console.error("バックエンド通信エラー:", err);
					});
			} catch (err) {
				console.error("通信処理エラー:", err);
			}
		}
	}
}

chrome.storage.local.get("blurRemovalEnabled", (data) => {
	const isEnabled = data.blurRemovalEnabled !== false;
	if (isEnabled) {
		removeBlur();
	}
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "toggleBlurRemoval") {
		if (request.enabled) {
			removeBlur();
		}
	}
	return true;
});
