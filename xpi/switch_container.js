
// #region Switch containers

async function changeContainer(event)
{
  event.preventDefault();

  const target = event.currentTarget;

  if (target.dataset.action !== 'change') { return; }

  try
  {
    const [tab] = await browser.tabs.query({ currentWindow: true, active: true });

    if (!tab || tab.status !== 'complete') { return; }

    const newTabOptions = { url: tab.url, index: tab.index + 1, pinned: tab.pinned, };

    if (target.dataset.identity !== '-1') { newTabOptions.cookieStoreId = target.dataset.identity; }

    await browser.tabs.create(newTabOptions);
    await browser.tabs.remove(tab.id);
  }
  catch (_) { /* Fail silently */ }
}

// #endregion

// #region Identity list

async function initializeIdentityList()
{
  const div = document.getElementById('identity-list');

  if (!browser.contextualIdentities)
  {
    div.textContent = 'Containers are disabled.';
    return;
  }

  try
  {
    const identities = await browser.contextualIdentities.query({});

    if (!identities.length)
    {
      div.textContent = 'No container identities available.';
      return;
    }

    // add container buttons
    for (const identity of identities)
      { div.appendChild( createButton({...identity}) ); }
    // add decontain button
    div.appendChild(createButton({ name: 'Decontain', cookieStoreId: -1 }));
  }
  catch (_)
    { div.textContent = 'Error loading container identities.'; }
}

// #endregion

// #region GUI

function createButton({ name, cookieStoreId, iconUrl, color, colorCode })
{
  const isDecontain = cookieStoreId === -1;
  const effectiveColor = colorCode || color;

  // set-up button
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'identity-button';
  if (isDecontain) { button.classList.add('decontain'); }
  button.dataset.action = 'change';
  button.dataset.identity = cookieStoreId;

  // set-up icon
  const icon = document.createElement('span');
  icon.className = 'icon';
  if (iconUrl)
  {
    icon.style.mask = `url(${iconUrl}) center / contain no-repeat`;
    icon.style.background = effectiveColor;
  }
  else
  {
    icon.textContent = isDecontain ? '\u274C' : '\u25CF';
    icon.style.color = isDecontain ? '#888' : effectiveColor;
  }

  // set-up label
  const label = document.createElement('span');
  label.className = 'identity';
  label.textContent = name ?? 'Unknown';

  // submit button
  button.append(icon, label);
  button.addEventListener('click', changeContainer);
  return button;
}

// #endregion

// #region Main

initializeIdentityList();

// #endregion
