# Tidy Tab Groups

A Chrome/Brave/Edge extension (Manifest V3) that keeps tab groups tidy:

- A tab opened from a link is grouped with the tab it came from.
- When one of those groups is down to a single tab, it is disbanded.
- Groups are named after the site ("Gmail", "Sheets", "Messenger") and colored to match the site's icon.
- It only ever adds tabs to, or disbands, groups it created itself. Groups made by Claude in Chrome, other AI agents, other extensions, or by hand are left alone.

Ordinary new tabs (Ctrl+T, the + button), pinned tabs, and links opened from browser pages like `chrome://extensions` are never grouped.

## Naming rules

A group is named after the site you opened the link from, in this order:

1. Your rules in the options popup, one per line as `address = Name`.
2. The built-in list of well-known sites (`KNOWN_SITES` in `background.js`).
3. The plain domain (`amazon.com` becomes "Amazon").

An address also covers its subdomains, and it can include a path (`facebook.com/messages = Messenger`). If several rules fit a page, the most specific one wins: the longer domain first, then the longer path. If two are equally specific, the later one wins.

## Install from source

1. Open `chrome://extensions` (or `brave://extensions`) and turn on Developer mode.
2. Click **Load unpacked** and choose this folder.

Turn off any other tab-grouping extension first, or they will fight.

## Files

- `manifest.json`: permissions and metadata
- `background.js`: grouping, naming, coloring and disbanding
- `options.html`, `options.js`: the options popup
- `icons/`: toolbar and store icons
- `PRIVACY.md`: privacy policy
- `STORE_LISTING.md`: text for the Chrome Web Store listing

## Permissions

`tabs`, `tabGroups`, `webNavigation`, `storage` and `favicon`. No host permissions, no network requests. See `PRIVACY.md`.

## License

[MIT](LICENSE)
