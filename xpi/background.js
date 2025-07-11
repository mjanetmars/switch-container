
// #region Enable/disable container button

// only enable it on http(s) urls
const APPLICABLE_PROTOCOLS = ["http:", "https:"];

// checks if the url is a http(s)
function protocolIsApplicable( url )
{
  try
  {
    const anchor = document.createElement('a');
    anchor.href = url;
    return APPLICABLE_PROTOCOLS.includes(anchor.protocol);
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
