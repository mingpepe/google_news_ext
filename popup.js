function keyword2googleNewsUrl(keyword) {
    return `https://news.google.com/search?q=${encodeURIComponent(keyword)}&hl=zh-TW&gl=TW&ceid=TW%3Azh-Hant`;
}

async function open() {
    // Need "tabs" permission in manifest to get url
    const tabs = await chrome.tabs.query({});
    chrome.storage.local.get(['keywords'], function (result) {
        const keywords = result.keywords || [];
        for (const keyword of keywords) {
            const url = keyword2googleNewsUrl(keyword);
            const exist = tabs.some(tab => tab.url === url);
            if (exist) {
                console.log(`${url} already exist`);
            } else {
                chrome.tabs.create({ url, active: false });
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const keywordInput = document.getElementById('keywordInput');
    const addKeywordButton = document.getElementById('addKeyword');
    const openUrlsButton = document.getElementById('openUrls');
    const autoOpenCheckbox = document.getElementById('autoOpen');
    const addedKeywordsContainer = document.getElementById('addedKeywords');

    chrome.storage.local.get(['keywords'], function (result) {
        const keywords = result.keywords || [];
        for (const keyword of keywords) {
            addKeywordToUI(keyword);
        }
    });

    chrome.storage.local.get(['autoOpen'], function (result) {
        autoOpenCheckbox.checked = result.autoOpen || false;
        if (autoOpenCheckbox.checked) {
            open();
        }
    });

    function addKeywordToUI(keyword) {
        const addedKeywordElement = document.createElement('div');
        addedKeywordElement.classList.add('added-keyword');

        const keywordLabel = document.createElement('span');
        keywordLabel.textContent = keyword;
        addedKeywordElement.appendChild(keywordLabel);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function () {
            chrome.storage.local.get(['keywords'], function (result) {
                const keywords = result.keywords || [];
                const index = keywords.indexOf(keyword);
                if (index !== -1) {
                    keywords.splice(index, 1);
                    chrome.storage.local.set({ keywords });
                    addedKeywordsContainer.removeChild(addedKeywordElement);
                }
            });
        });

        addedKeywordElement.appendChild(deleteButton);
        addedKeywordsContainer.appendChild(addedKeywordElement);
    }

    addKeywordButton.addEventListener('click', function () {
        const keyword = keywordInput.value.trim();
        if (keyword) {
            chrome.storage.local.get(['keywords'], function (result) {
                const keywords = result.keywords || [];
                keywords.push(keyword);
                chrome.storage.local.set({ keywords });
                keywordInput.value = '';

                addKeywordToUI(keyword);
            });
        }
    });

    openUrlsButton.addEventListener('click', function () {
        open();
    });

    autoOpenCheckbox.addEventListener('change', function () {
        chrome.storage.local.set({ autoOpen: autoOpenCheckbox.checked });
    });

    keywordInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            addKeywordButton.click();
        }
    });
});
