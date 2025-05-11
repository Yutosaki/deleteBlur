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
	}

	chrome.storage.local.get(["textReorderEnabled"], (data) => {
		if (data.textReorderEnabled !== false) {
			fixJumbledText();
		}
	});
}

function fixJumbledText() {
	const answerBlocks = document.querySelectorAll(".ansbg");

	for (const block of answerBlocks) {
		const textElements = block.querySelectorAll(
			'div[style*="opacity"], div[style*="filter"]',
		);

		if (textElements.length === 0) continue;

		const texts = [];
		for (const el of textElements) {
			const text = el.innerText.trim();
			if (text) texts.push(text);
		}

		if (texts.length === 0) continue;

		fetch("http://localhost:8080/reorder", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ texts: texts }),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.texts && data.texts.length > 0) {
					// 結果を元のテキスト要素に挿入
					let index = 0;
					for (const el of textElements) {
						if (index < data.texts.length) {
							el.innerText = data.texts[index];
							index++;
						}
					}
				}
			})
			.catch((error) => {
				console.error("Error reordering text:", error);
			});
	}

	const definitionLists = document.querySelectorAll("dl");

	for (const dl of definitionLists) {
		const dtElements = dl.querySelectorAll("dt");
		const ddElements = dl.querySelectorAll("dd");

		const dtTexts = [];
		const ddTexts = [];

		for (const dt of dtElements) {
			dtTexts.push(dt.innerText.trim());
		}

		for (const dd of ddElements) {
			ddTexts.push(dd.innerText.trim());
		}

		if (dtTexts.length > 0) {
			fetch("http://localhost:8080/reorder", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ texts: dtTexts }),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.texts && data.texts.length > 0) {
						// 結果をdt要素に挿入
						let index = 0;
						for (const dt of dtElements) {
							if (index < data.texts.length) {
								dt.innerText = data.texts[index];
								index++;
							}
						}
					}
				})
				.catch((error) => {
					console.error("Error reordering dt texts:", error);
				});
		}

		if (ddTexts.length > 0) {
			fetch("http://localhost:8080/reorder", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ texts: ddTexts }),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.texts && data.texts.length > 0) {
						// 結果をdd要素に挿入
						let index = 0;
						for (const dd of ddElements) {
							if (index < data.texts.length) {
								dd.innerText = data.texts[index];
								index++;
							}
						}
					}
				})
				.catch((error) => {
					console.error("Error reordering dd texts:", error);
				});
		}
	}
}

function hideAds() {
	chrome.storage.local.get(["adBlockEnabled"], (data) => {
		if (data.adBlockEnabled === false) {
			return;
		}

		if (window.adsAlreadyHidden) return;

		const selectors = [
			'iframe[src*="ads"], iframe[src*="doubleclick"]',
			'div[class*="ad"]:not(div[class*="応用情報"]):not(header *)',
			'div[id*="ad"]:not(div[id*="応用情報"]):not(header *)',
			'div[class*="banner"], div[class*="sponsor"]:not(header *)',
			"ins.adsbygoogle, [data-ad-client]",
			'div[aria-label*="広告"], img[src*="ads"], a[href*="doubleclick"]',
		];

		const header = document.querySelector("header");
		const headerElements = header
			? Array.from(header.querySelectorAll("*"))
			: [];
		const logoImages = document.querySelectorAll(
			'img[alt*="応用情報"], img[src*="logo"], img[src*="title"]',
		);

		for (const selector of selectors) {
			const elements = document.querySelectorAll(selector);
			for (const el of elements) {
				if (el.dataset.adProcessed) continue;

				if (
					headerElements.includes(el) ||
					Array.from(logoImages).includes(el) ||
					el.textContent?.includes("応用情報")
				) {
					continue;
				}

				let isProtected = false;
				let parent = el.parentElement;
				while (parent) {
					if (headerElements.includes(parent) || parent.tagName === "HEADER") {
						isProtected = true;
						break;
					}
					parent = parent.parentElement;
				}

				if (isProtected) continue;

				el.dataset.adProcessed = "true";

				el.style.visibility = "hidden";
				el.style.opacity = "0";

				if (el.tagName === "IFRAME" && el.src) {
					el.src = "about:blank";
				} else if (el.tagName === "IMG" && el.src) {
					el.src =
						"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
				}
			}
		}

		window.adsAlreadyHidden = true;
	});
}

function showAds() {
	const adBlockStyles = document.querySelector("#ad-block-style");
	if (adBlockStyles) {
		adBlockStyles.remove();
	}

	const processedAds = document.querySelectorAll('[data-ad-processed="true"]');
	for (const el of processedAds) {
		el.style.visibility = "";
		el.style.opacity = "";
	}

	window.adsAlreadyHidden = false;
}

function initializeExtension() {
	chrome.storage.local.get(["adBlockEnabled"], (data) => {
		if (data.adBlockEnabled !== false) {
			hideAds();
		} else {
			showAds();
		}
	});

	chrome.storage.local.get(
		["blurRemovalEnabled", "textReorderEnabled"],
		(data) => {
			if (data.blurRemovalEnabled !== false) {
				removeBlur();
				setTimeout(removeBlur, 1000);
			}

			if (
				data.textReorderEnabled !== false &&
				data.blurRemovalEnabled === false
			) {
				fixJumbledText();
				setTimeout(fixJumbledText, 1000);
			}
		},
	);
}

(() => {
	chrome.storage.local.get(["adBlockEnabled"], (data) => {
		if (data.adBlockEnabled !== false) {
			const style = document.createElement("style");
			style.id = "ad-block-style";
			style.textContent = `
                                                    iframe[src*="ads"], iframe[src*="doubleclick"],
                                                    div[class*="ad"]:not([class*="応用情報"]):not(header *),
                                                    div[id*="ad"]:not([id*="応用情報"]):not(header *),
                                                    div[class*="banner"], div[class*="sponsor"]:not(header *),
                                                    ins.adsbygoogle, [data-ad-client],
                                                    div[aria-label*="広告"], img[src*="ads"], a[href*="doubleclick"] {
                                                                    opacity: 0 !important;
                                                    }
                                    `;
			(document.head || document.documentElement).appendChild(style);
		}
	});
})();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "toggleAdBlock") {
		if (request.enabled) {
			window.adsAlreadyHidden = false;
			hideAds();
		} else {
			showAds();
		}
	} else if (request.action === "toggleBlurRemoval") {
		if (request.enabled) {
			removeBlur();
		}
	} else if (request.action === "toggleTextReorder") {
		if (request.enabled) {
			fixJumbledText();
		}
	}
	return true;
});

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initializeExtension);
} else {
	initializeExtension();
}

let lastUrl = location.href;
const observer = new MutationObserver(() => {
	if (location.href !== lastUrl) {
		lastUrl = location.href;
		setTimeout(initializeExtension, 500);
	}
});

observer.observe(document, { subtree: true, childList: true });
