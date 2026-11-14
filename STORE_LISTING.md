# Chrome Web Store listing: Tidy Tab Groups

Copy each section into the matching field in the Developer Dashboard.

## Name
Tidy Tab Groups

(Search the Web Store for this name before submitting. If it is taken, pick another and update `name` in manifest.json.)

## Summary (max 132 characters, comes from manifest.json `description`)
Groups a tab with the tab it was opened from, and disbands groups left with one tab, without touching groups made by AI agents.

That is 127 characters. Keep manifest.json `description` identical.

## Category
Productivity

## Description

Tidy Tab Groups keeps your tab groups tidy without you managing them.

When you open a link in a new tab, the new tab is grouped with the tab it came from. Open ten Amazon search results from one search page and they all land in one group with that page. Close the results and the group dissolves on its own, so you aren't left with empty one-tab groups.

It also plays well with tools that make their own groups. Tidy Tab Groups only disbands groups that it created itself. Groups made by AI browser agents such as Claude in Chrome, by other extensions, or by you by hand are never touched, so a one-tab group an agent is working in won't vanish under it.

FEATURES
- Groups a tab with the tab it was opened from (links, middle-click, Ctrl+click, window.open). Ordinary new tabs (Ctrl+T, the + button) are left alone.
- Disbands groups it created once they are down to one tab.
- Never changes groups it didn't create: it won't add tabs to them or disband them.
- Skips pinned tabs, and links opened from browser pages such as brave://settings or chrome://extensions.
- Names new groups after the site: "Gmail", "Sheets", "Messenger", "YouTube", "GitHub" and about 150 more. It matches on domain and on path, so docs.google.com/spreadsheets is "Sheets" and facebook.com/messages is "Messenger". Unknown sites get a tidied-up domain name.
- Your own name rules: add lines like "example.com/blog = My Blog".
- Colors each new group to match the dominant color of the site's favicon.
- Settings sync across your browsers through your browser account.

PRIVACY
Everything runs locally in your browser. The extension makes no network requests, has no analytics, and does not collect, store or transmit your browsing data. It saves only your settings and the names and colors of the groups it created.

HOW IT DECIDES WHAT TO DISBAND
Tidy Tab Groups remembers the groups it created, including their name and color so it still recognizes them after you restart the browser. Only those are ever disbanded or added to. Groups made by anything else are left alone. If you rename or recolor one of its groups, it stops treating that group as its own.

Works in Chrome and other Chromium browsers that support tab groups, such as Brave and Edge.

## Single purpose (Privacy practices tab)
Automatically organizes browser tabs into tab groups, and removes tab groups it created once they hold only one tab.

## Permission justifications (Privacy practices tab)

**tabs**
Needed to read the URL of the tab a link was opened from (to name the new group and pick its favicon color), to look up which tabs are in a group, and to ungroup a tab when its group is down to one tab. The URLs are used in memory only and are not stored or sent anywhere.

**tabGroups**
Needed to read, title and color tab groups and to find which groups exist, so the extension can name and color the groups it creates and identify groups that have only one tab left.

**webNavigation**
Needed to tell a tab opened from a link or window.open() apart from a plain new tab (Ctrl+T, the + button). Both kinds of tab report an opener, so only the navigation event can distinguish them. Without it, a plain new tab would wrongly be grouped with whatever tab was open.

**storage**
Needed to save the user's site-name rules (options page) and to remember which tab groups the extension created: their IDs for the current session, and their name and color (for example "Gmail", red) so they are still recognized after a browser restart. Stored on the device only; nothing is sent anywhere. No page URLs or page content are stored.

**favicon**
Needed to read the favicon of the tab a link was opened from, from the browser's own favicon cache, so a new group can be colored to match. No network request is made and no site access is needed.

**Host permissions:** none requested.

**Remote code:** no. All code is in the package.

## Data usage disclosures (Privacy practices tab)
Tick none of the data-collection categories. The extension does not collect or transmit any user data.

Then tick all three certifications:
- I do not sell or transfer user data to third parties outside of the approved use cases.
- I do not use or transfer user data for purposes unrelated to the item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

## Privacy policy URL
The dashboard asks for one. Use the public URL of PRIVACY.md in the GitHub repo: https://github.com/Jesse-Hufstetler/tidy-tab-groups/blob/main/PRIVACY.md (works once the repo is pushed).

## Assets still needed
- Store icon: 128x128 (`icons/128.png`, already in the zip, upload it again on the listing tab).
- At least 1 screenshot, 1280x800 or 640x400. Suggested: a window with a few grouped tabs named "Gmail" and "Sheets", plus the options page.
- Optional: small promo tile 440x280.
