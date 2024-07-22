console.log("sw-omnibox.js");

// Save default API suggestions
chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === "install") {
        chrome.storage.local.set({
            apiSuggestions: ["tabs", "storage", "scripting"]
        });
    }
});
/**
 * Service Worker 无法直接访问窗口对象，因此无法使用 window.localStorage 存储值。
 * 此外，Service Worker 也是短期执行环境；
 * 它们会在用户的浏览器会话中反复终止，这使得它们与全局变量不兼容。请改用 chrome.storage.local，将数据存储在本地机器上。
 */

const URL_CHROME_EXTENSIONS_DOC = "https://developer.chrome.com/docs/extensions/reference/";
const NUMBER_OF_PREVIOUS_SEARCHES = 4;

// Display the suggestions after user starts typing
chrome.omnibox.onInputChanged.addListener(async (input, suggest) => {
    await chrome.omnibox.setDefaultSuggestion({
        description: "Enter a Chrome API or choose from past searches"
    });
    const { apiSuggestions } = await chrome.storage.local.get("apiSuggestions");
    const suggestions = apiSuggestions.map((api) => {
        return { content: api, description: `Open chrome.${api} API` };
    });
    suggest(suggestions);
});

// Open the reference page of the chosen API
chrome.omnibox.onInputEntered.addListener((input) => {
    chrome.tabs.create({ url: URL_CHROME_EXTENSIONS_DOC + input });
    // Save the latest keyword
    updateHistory(input);
});

async function updateHistory(input) {
    const { apiSuggestions } = await chrome.storage.local.get("apiSuggestions");
    apiSuggestions.unshift(input);
    apiSuggestions.splice(NUMBER_OF_PREVIOUS_SEARCHES);
    return chrome.storage.local.set({ apiSuggestions });
}
