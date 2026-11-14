# Privacy Policy: Tidy Tab Groups

Last updated: 2026-11-14

Tidy Tab Groups is a browser extension that organizes tabs into tab groups.

## What the extension accesses

To do its job, the extension reads, locally in your browser:
- the URL of a tab that a link was opened from, to choose a name and color for the new group
- the favicon of that tab, from your browser's own cache, to choose a group color
- which tabs belong to which tab groups, and the titles of those groups, to decide whether a group has only one tab left and whether it is one the extension created

This information is used in memory at the moment it is needed. It is not saved, logged, or sent anywhere.

## What the extension stores

- **Your settings** (the site-name rules you enter in the options page). These are saved with the browser's extension storage, which your browser may sync between your devices through your browser account (for example your Google or Brave account). That syncing is done by the browser, not by this extension.
- **Group IDs for the current browser session.** The extension remembers which groups it created, as numbers, so it only disbands those. This is held in session storage and is erased when the browser closes.

## What the extension does not do

- It does not collect, transmit, sell or share any data.
- It does not make network requests.
- It does not use analytics, advertising, or tracking of any kind.
- It does not read page content.
- It does not use remote code.

## Permissions

The extension requests the `tabs`, `tabGroups`, `webNavigation`, `storage` and `favicon` permissions. Each is used only for the purpose described above. It requests no access to website data.

## Changes

If this policy changes, the new version will be published at the same location with an updated date.

## Contact

Questions about this policy can be raised as an issue at https://github.com/Jesse-Hufstetler/tidy-tab-groups/issues.
