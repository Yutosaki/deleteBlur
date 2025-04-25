(async () => {
    document.querySelectorAll('div[style*="position:absolute"], div[style*="z-index"]').forEach(el => {
      if (el.innerText.includes("申し訳") || el.innerText.includes("メンバーシップ")) {
        el.remove();
      }
    });
  
    const answerBlocks = document.querySelectorAll('.ansbg');
  
    for (const block of answerBlocks) {
      const blurredElements = block.querySelectorAll('div[style*="filter:blur"], div[style*="opacity"]');
      
      if (blurredElements.length === 0) continue;

      const texts = [];
      blurredElements.forEach(el => {
        const text = el.innerText.trim();
        if (text) texts.push(text);
      });


      blurredElements.forEach((el) => {
        el.style.filter = 'none';
        el.style.opacity = '1';
        el.style.userSelect = 'text';
        el.style.pointerEvents = 'auto';
      });

      if (texts.length > 0) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          
          const response = await fetch('http://localhost:8080/reorder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ texts }),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
  
          if (response.ok) {
            const data = await response.json();
  
            if (data.texts && Array.isArray(data.texts)) {
              blurredElements.forEach((el, idx) => {
                if (data.texts[idx]) {
                  el.innerText = data.texts[idx];
                }
              });
            }
          } else {
            console.warn('レスポンスが不正:', response.statusText);
          }
        } catch (err) {
          console.error('バックエンド通信エラー:', err);
        }
      }
    }
})();
