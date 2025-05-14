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
}

let isTextReorderingInProgress = false;

function fixJumbledText() {
	if (isTextReorderingInProgress) {
        console.log("文章修正はすでに実行中です - 重複呼び出しをスキップします");
        return;
    }

	chrome.storage.local.get(["textReorderEnabled"], (data) => {
		if (data.textReorderEnabled === false) {
			console.log("文章修正は無効に設定されています");
			return;
		}

	    isTextReorderingInProgress = true;
		console.log("文章修正を実行中...");

		const textNodesInfo = collectAllTextNodes();

		if (textNodesInfo.length === 0) return;

		const textsToProcess = textNodesInfo.map((item) => item.text);

		console.log(
			"%c文章修正API送受信データ",
			"background:blue;color:white;padding:2px 5px;",
		);
		console.log(
			"送信データ:",
			JSON.stringify({ texts: textsToProcess }, null, 2),
		);

		fetch("http://localhost:8080/reorder", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ texts: textsToProcess }),
		})
			.then((response) => response.json())
			.then((data) => {
				console.log("受信データ:", JSON.stringify(data, null, 2));

				if (!data.texts || data.texts.length === 0) return;

				for (
					let i = 0;
					i < data.texts.length && i < textNodesInfo.length;
					i++
				) {
					textNodesInfo[i].node.textContent = data.texts[i];
				}
			})
			.catch((error) => {
				console.error("Error reordering text:", error);
			});
	});
}

function collectAllTextNodes() {
	const allNodesInfo = [];

	const answerBlocks = document.querySelectorAll(".ansbg");
	for (const block of answerBlocks) {
		const textElements = block.querySelectorAll(
			'div[style*="opacity"], div[style*="filter"]',
		);

		for (const el of textElements) {
			const textNodeWalker = document.createTreeWalker(
				el,
				NodeFilter.SHOW_TEXT,
				null,
				false,
			);

			let node = textNodeWalker.nextNode();
			while (node) {
				const text = node.textContent.trim();
				if (text) {
					allNodesInfo.push({
						node: node,
						text: text,
						type: "answer",
					});
				}
				node = textNodeWalker.nextNode();
			}
		}
	}

	const listItems = document.querySelectorAll("li.lia, li.lii, li.liu, li.lie");
	for (const li of listItems) {
		const citeElement = li.querySelector(".cite");
		if (!citeElement) continue;

		let brElement = null;
		let node = citeElement.nextSibling;

		while (node) {
			if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "BR") {
				brElement = node;
				break;
			}
			node = node.nextSibling;
		}

		if (!brElement) continue;

		collectTextNodesAfterBr(brElement, allNodesInfo, "list");
	}

	const definitionLists = document.querySelectorAll("dl");
	for (const dl of definitionLists) {
		for (const dt of dl.querySelectorAll("dt")) {
			collectElementTextNodes(dt, allNodesInfo, "definition");
		}
		for (const dd of dl.querySelectorAll("dd")) {
			collectElementTextNodes(dd, allNodesInfo, "definition");
		}
	}

	return allNodesInfo;
}

function collectTextNodesAfterBr(brElement, allNodesInfo, type) {
	let currentNode = brElement.nextSibling;

	while (currentNode) {
		if (currentNode.nodeType === Node.ELEMENT_NODE) {
			if (
				currentNode.tagName === "BR" ||
				currentNode.tagName === "IMG" ||
				(currentNode.classList &&
					(currentNode.classList.contains("img_margin") ||
						currentNode.classList.contains("code")))
			) {
				break;
			}

			if (currentNode.tagName === "DIV" || currentNode.tagName === "SPAN") {
				collectElementTextNodes(currentNode, allNodesInfo, type);
				currentNode = currentNode.nextSibling;
				continue;
			}
		}

		if (currentNode.nodeType === Node.TEXT_NODE) {
			const text = currentNode.textContent.trim();
			if (text) {
				allNodesInfo.push({
					node: currentNode,
					text: text,
					type: type,
				});
			}
		}

		currentNode = currentNode.nextSibling;
	}
}

function collectElementTextNodes(element, allNodesInfo, type) {
	const textNodeWalker = document.createTreeWalker(
		element,
		NodeFilter.SHOW_TEXT,
		null,
		false,
	);

	let node = textNodeWalker.nextNode();
	while (node) {
		const text = node.textContent.trim();
		if (text) {
			allNodesInfo.push({
				node: node,
				text: text,
				type: type,
			});
		}
		node = textNodeWalker.nextNode();
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

function initializeExtension() {
	chrome.storage.local.get(
		["blurRemovalEnabled", "textReorderEnabled", "adBlockEnabled"],
		(data) => {
			if (data.adBlockEnabled !== false) {
				hideAds();
			}

			if (data.blurRemovalEnabled !== false) {
				removeBlur();
			}

			if (data.textReorderEnabled !== false) {
				fixJumbledText();
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

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.action === "toggleAdBlock") {
			if (request.enabled) {
				window.adsAlreadyHidden = false;
				hideAds();
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

	initializeExtension();

	let lastUrl = location.href;
	const observer = new MutationObserver(() => {
		if (location.href !== lastUrl) {
			lastUrl = location.href;
			setTimeout(initializeExtension, 500);
		}
	});

	observer.observe(document, { subtree: true, childList: true });
})();
