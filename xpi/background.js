// #region Icon switcher

// add add-on context menu for icon select
browser.runtime.onInstalled.addListener(function()
{
  browser.contextMenus.create({
    id: "toggle-icon-style",
    title: "Toggle Icon Theming",
    contexts: ["browser_action"]
  });
});

// icon defs
const ICONS =
{
  0: "switch_container.svg",
  1: "switch_dullgray.svg"
};

// sets the icon
function setIcon(style)
{
  const path = ICONS[style] || ICONS[0];
  return browser.browserAction.setIcon({ path });
}

// set-up icon on init
async function initIcon()
{
  const result = await browser.storage.local.get("iconStyle");
  const iconStyle = result.iconStyle === undefined ? 0 : result.iconStyle;
  await setIcon(iconStyle);
}

initIcon();

// change the icon based on user interaction
browser.contextMenus.onClicked.addListener(async function(info, tab)
{
  if (info.menuItemId !== "toggle-icon-style") return;

  const result = await browser.storage.local.get("iconStyle");
  const iconStyle = result.iconStyle === undefined ? 0 : result.iconStyle;
  const newStyle = iconStyle === 0 ? 1 : 0;
  
  await browser.storage.local.set({ iconStyle: newStyle });
  await setIcon(newStyle);
});

// change the icon even if it's changed elsewhere
browser.storage.onChanged.addListener(function(changes)
{
  if (changes.iconStyle) { setIcon(changes.iconStyle.newValue); }
});

// #endregion

// #region Enable/disable container button

// only enable it on http(s) urls
const APPLICABLE_PROTOCOLS = ["http:", "https:"];

// checks if the url is a http(s)
function protocolIsApplicable( url )
{
  try
  {
    const urlObj = new URL(url);
    return APPLICABLE_PROTOCOLS.includes(urlObj.protocol);
  }
  catch
  {
    return false; // malformed URLs, etc.
  }
}

// enable/disable button
function initializePageAction(tab)
{
  // disable on incognito windows
  if (tab.incognito)
  {
    browser.browserAction.disable(tab.id);
    return;
  }

  // enable on http(s) url only
  if (protocolIsApplicable(tab.url))
    { browser.browserAction.enable(tab.id); }
  else
    { browser.browserAction.disable(tab.id); }
}

// #endregion

// #region Update on tab update/change/activation

// listen for tab updates (navigation, new tab load, etc.)
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>
{
  // check when url changes, or tab fully loaded
  if (changeInfo.url || changeInfo.status === "complete")
    { initializePageAction(tab); }
});

// also listen for tab activation (switching tabs)
browser.tabs.onActivated.addListener(async ({ tabId }) =>
{
  const tab = await browser.tabs.get(tabId);
  initializePageAction(tab);
});


// #endregion

// #region Init on all active tabs

/* init by checking all tabs */
browser.tabs.query({}).then((tabs) =>
{
  for (let tab of tabs) { initializePageAction(tab); }
});

// #endregion
