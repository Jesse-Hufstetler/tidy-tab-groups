const DEFAULTS = {
  // Lines of "address = Name". See parseKey() for how addresses match.
  nameOverrides: [],
};

const SECOND_LEVEL = new Set(["co", "com", "org", "net", "gov", "edu", "ac"]);

const DISBAND_DELAY_MS = 100;

// This extension only ever touches groups it created itself: it adds tabs to them and
// disbands them. Groups made by anything else (Claude in Chrome, other AI agents, other
// extensions, you) are never changed, whatever they are called.
//
// IDs of the groups it created. Session storage survives the service worker being
// stopped, and clears when the browser closes (group IDs aren't stable across restarts).
async function getOwned() {
  const { ownedGroups = [] } = await chrome.storage.session.get("ownedGroups");
  return ownedGroups;
}

async function markOwned(groupId) {
  const owned = await getOwned();
  if (!owned.includes(groupId)) await chrome.storage.session.set({ ownedGroups: [...owned, groupId] });
}

async function getSettings() {
  const stored = await chrome.storage.sync.get(DEFAULTS);
  return { ...DEFAULTS, ...stored };
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// Known sites. A domain also matches its subdomains, and the longest match wins, so
// "mail.google.com" beats "google.com". Sites not listed fall back to the cleaned-up domain.
const KNOWN_SITES = {
  // Google
  "google.com": "Google",
  "mail.google.com": "Gmail",
  "docs.google.com": "Docs",
  "drive.google.com": "Drive",
  "calendar.google.com": "Calendar",
  "maps.google.com": "Maps",
  "google.com/maps": "Maps",
  "photos.google.com": "Photos",
  "meet.google.com": "Meet",
  "chat.google.com": "Chat",
  "keep.google.com": "Keep",
  "translate.google.com": "Translate",
  "myaccount.google.com": "Google Account",
  "console.cloud.google.com": "Google Cloud",
  "play.google.com": "Google Play",
  "chromewebstore.google.com": "Web Store",
  // Microsoft
  "outlook.live.com": "Outlook",
  "outlook.office.com": "Outlook",
  "outlook.office365.com": "Outlook",
  "teams.microsoft.com": "Teams",
  "onedrive.live.com": "OneDrive",
  "portal.azure.com": "Azure",
  "dev.azure.com": "Azure DevOps",
  "learn.microsoft.com": "Microsoft Learn",
  "microsoft.com": "Microsoft",
  // Dev
  "github.com": "GitHub",
  "gist.github.com": "Gist",
  "gitlab.com": "GitLab",
  "bitbucket.org": "Bitbucket",
  "stackoverflow.com": "Stack Overflow",
  "stackexchange.com": "Stack Exchange",
  "npmjs.com": "npm",
  "developer.mozilla.org": "MDN",
  "claude.ai": "Claude.ai",
  "chatgpt.com": "ChatGPT",
  "openai.com": "OpenAI",
  "anthropic.com": "Anthropic",
  "atlassian.net": "Atlassian",
  "figma.com": "Figma",
  "notion.so": "Notion",
  // Social / media
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "reddit.com": "Reddit",
  "news.ycombinator.com": "Hacker News",
  "x.com": "X",
  "twitter.com": "Twitter",
  "facebook.com": "Facebook",
  "facebook.com/messages": "Messenger",
  "messenger.com": "Messenger",
  "instagram.com": "Instagram",
  "linkedin.com": "LinkedIn",
  "bsky.app": "Bluesky",
  "tiktok.com": "TikTok",
  "twitch.tv": "Twitch",
  "discord.com": "Discord",
  "slack.com": "Slack",
  "whatsapp.com": "WhatsApp",
  "pinterest.com": "Pinterest",
  "spotify.com": "Spotify",
  "netflix.com": "Netflix",
  "imdb.com": "IMDb",
  // Reference / shopping
  "wikipedia.org": "Wikipedia",
  "amazon.com": "Amazon",
  "ebay.com": "eBay",
  "paypal.com": "PayPal",
  "craigslist.org": "Craigslist",
  "zillow.com": "Zillow",

  // Google Workspace: all on docs.google.com, told apart by path
  "docs.google.com/document": "Docs",
  "docs.google.com/spreadsheets": "Sheets",
  "docs.google.com/presentation": "Slides",
  "docs.google.com/forms": "Forms",
  "docs.google.com/drawings": "Drawings",
  "forms.gle": "Forms",
  "sites.google.com": "Sites",
  "contacts.google.com": "Contacts",
  "news.google.com": "Google News",
  "scholar.google.com": "Scholar",
  "gemini.google.com": "Gemini",
  "notebooklm.google.com": "NotebookLM",
  "colab.research.google.com": "Colab",
  "analytics.google.com": "Analytics",
  "ads.google.com": "Google Ads",
  "business.google.com": "Business Profile",
  "accounts.google.com": "Google Account",
  "takeout.google.com": "Takeout",
  "lens.google.com": "Lens",
  "google.com/travel": "Google Travel",
  "google.com/finance": "Google Finance",
  "google.com/shopping": "Google Shopping",
  "music.youtube.com": "YouTube Music",
  "studio.youtube.com": "YouTube Studio",

  // Facebook / Meta
  "facebook.com/marketplace": "Marketplace",
  "facebook.com/groups": "FB Groups",
  "facebook.com/watch": "FB Watch",
  "threads.net": "Threads",
  "threads.com": "Threads",
  "meta.com": "Meta",

  // Microsoft / Office
  "office.com": "Office",
  "sharepoint.com": "SharePoint",
  "teams.live.com": "Teams",
  "live.com": "Microsoft",

  // Amazon
  "aws.amazon.com": "AWS",
  "console.aws.amazon.com": "AWS Console",
  "primevideo.com": "Prime Video",
  "amazon.com/gp/video": "Prime Video",
  "music.amazon.com": "Amazon Music",
  "sellercentral.amazon.com": "Seller Central",
  "audible.com": "Audible",

  // Apple
  "icloud.com": "iCloud",
  "music.apple.com": "Apple Music",
  "tv.apple.com": "Apple TV",
  "developer.apple.com": "Apple Developer",
  "support.apple.com": "Apple Support",

  // Messaging / mail / meetings
  "web.whatsapp.com": "WhatsApp",
  "web.telegram.org": "Telegram",
  "mail.yahoo.com": "Yahoo Mail",
  "mail.proton.me": "Proton Mail",
  "zoom.us": "Zoom",
  "instagram.com/direct": "Instagram DMs",
  "linkedin.com/messaging": "LinkedIn Messages",
  "x.com/messages": "X Messages",

  // Dev / work tools
  "hub.docker.com": "Docker Hub",
  "pypi.org": "PyPI",
  "huggingface.co": "Hugging Face",
  "arxiv.org": "arXiv",
  "w3schools.com": "W3Schools",
  "trello.com": "Trello",
  "airtable.com": "Airtable",
  "dropbox.com": "Dropbox",
  "canva.com": "Canva",

  // News / sports / reference
  "nytimes.com": "NY Times",
  "wsj.com": "WSJ",
  "cnn.com": "CNN",
  "bbc.co.uk": "BBC",
  "bbc.com": "BBC",
  "npr.org": "NPR",
  "espn.com": "ESPN",
  "ycombinator.com": "Y Combinator",
  "duckduckgo.com": "DuckDuckGo",
  "search.brave.com": "Brave Search",
  "wiktionary.org": "Wiktionary",

  // Shopping / services / entertainment
  "bestbuy.com": "Best Buy",
  "homedepot.com": "Home Depot",
  "ups.com": "UPS",
  "usps.com": "USPS",
  "fedex.com": "FedEx",
  "disneyplus.com": "Disney+",
  "max.com": "Max",
  "steampowered.com": "Steam",
  "steamcommunity.com": "Steam Community",
  "epicgames.com": "Epic Games",
};

// A key is a domain with an optional path prefix: "github.com" or "facebook.com/messages".
// The domain also matches its subdomains, and the path matches whole segments
// ("/messages" matches /messages/t/123 but not /messages-old). The most specific match
// wins: longer domain first, then longer path.
function parseKey(key) {
  const k = key.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "");
  const slash = k.indexOf("/");
  const host = slash < 0 ? k : k.slice(0, slash);
  const path = slash < 0 ? "" : "/" + k.slice(slash).replace(/^\/+|\/+$/g, "");
  return { host, path: path === "/" ? "" : path };
}

function groupName(url, settings) {
  const host = hostOf(url);
  if (!host) return "";
  let pathname = "/";
  try { pathname = new URL(url).pathname.toLowerCase(); } catch {}

  const entries = Object.entries(KNOWN_SITES);
  for (const line of settings.nameOverrides) {
    const i = line.indexOf("=");
    if (i > 0 && line.slice(i + 1).trim()) entries.push([line.slice(0, i), line.slice(i + 1).trim()]);
  }

  let best = null;
  for (const [key, name] of entries) {
    const k = parseKey(key);
    if (!k.host) continue;
    if (host !== k.host && !host.endsWith("." + k.host)) continue;
    if (k.path && pathname !== k.path && !pathname.startsWith(k.path + "/")) continue;
    // Later entries (your overrides) win ties.
    if (!best || k.host.length > best.hostLen || (k.host.length === best.hostLen && k.path.length >= best.pathLen)) {
      best = { name, hostLen: k.host.length, pathLen: k.path.length };
    }
  }
  if (best) return best.name;

  // Fallback: "amazon.com" -> "Amazon"; keep subdomains visible ("docs.foo.com" stays as is).
  const parts = host.split(".");
  if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) return host; // IP address
  const tldLen = parts.length > 2 && SECOND_LEVEL.has(parts[parts.length - 2]) ? 2 : 1;
  const rest = parts.slice(0, parts.length - tldLen);
  if (rest.length === 1) return rest[0].charAt(0).toUpperCase() + rest[0].slice(1);
  return host;
}

// Chrome's tab group colors, with the hue range (degrees) each one represents.
const HUE_BUCKETS = [
  ["red", 345, 15], ["orange", 15, 40], ["yellow", 40, 70], ["green", 70, 170],
  ["cyan", 170, 205], ["blue", 205, 260], ["purple", 260, 300], ["pink", 300, 345],
];

function bucketForHue(h) {
  for (const [name, from, to] of HUE_BUCKETS) {
    if (from < to ? h >= from && h < to : h >= from || h < to) return name;
  }
  return "grey";
}

// Dominant favicon color, mapped to the nearest tab group color. Uses the browser's own
// favicon cache via the "favicon" permission, so no site access is needed.
async function faviconGroupColor(pageUrl) {
  try {
    const src = chrome.runtime.getURL("/_favicon/") + "?pageUrl=" + encodeURIComponent(pageUrl) + "&size=32";
    const bmp = await createImageBitmap(await (await fetch(src)).blob());
    const ctx = new OffscreenCanvas(bmp.width, bmp.height).getContext("2d", { willReadFrequently: true });
    ctx.drawImage(bmp, 0, 0);
    const { data } = ctx.getImageData(0, 0, bmp.width, bmp.height);

    const weight = {};
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
      const s = max === 0 ? 0 : d / max;
      if (s < 0.3 || max < 0.25) continue; // skip white, grey and near-black pixels
      let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
      const w = s * max;
      const name = bucketForHue(h);
      weight[name] = (weight[name] || 0) + w;
      total += w;
    }
    if (total < 1) return "grey";
    return Object.entries(weight).sort((a, b) => b[1] - a[1])[0][0];
  } catch (e) {
    console.debug("favicon color failed:", e);
    return null;
  }
}

// --- Grouping: a tab opened from another tab joins/creates the opener's group ---

// onCreatedNavigationTarget fires only for tabs opened from a link or window.open().
// A plain new tab (Ctrl+T, the + button) also gets an openerTabId, so tabs.onCreated
// can't tell the two apart.
chrome.webNavigation.onCreatedNavigationTarget.addListener(async (details) => {
  try {
    const settings = await getSettings();

    const [tab, opener] = await Promise.all([
      chrome.tabs.get(details.tabId),
      chrome.tabs.get(details.sourceTabId),
    ]);
    if (tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) return;
    if (tab.pinned || opener.pinned || opener.windowId !== tab.windowId) return;
    if (!/^https?:/i.test(opener.url || "")) return; // skip brave://, chrome://, extension pages

    if (opener.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
      if (!(await getOwned()).includes(opener.groupId)) return; // not ours: leave it alone
      await chrome.tabs.group({ tabIds: tab.id, groupId: opener.groupId });
    } else {
      const groupId = await chrome.tabs.group({ tabIds: [opener.id, tab.id] });
      await markOwned(groupId);
      const update = {};
      const title = groupName(opener.url, settings);
      if (title) update.title = title;
      const color = await faviconGroupColor(opener.url);
      if (color) update.color = color;
      if (Object.keys(update).length) await chrome.tabGroups.update(groupId, update);
    }
  } catch (e) {
    console.debug("auto-group skipped:", e);
  }
});

// --- Disbanding: ungroup our groups once they are left with one tab ---

let scanTimer = null;
function scheduleScan() {
  clearTimeout(scanTimer);
  scanTimer = setTimeout(scan, DISBAND_DELAY_MS);
}

async function scan() {
  try {
    const existing = new Set((await chrome.tabGroups.query({})).map((g) => g.id));
    const owned = (await getOwned()).filter((id) => existing.has(id)); // forget vanished groups
    await chrome.storage.session.set({ ownedGroups: owned });
    for (const groupId of owned) {
      const tabs = await chrome.tabs.query({ groupId });
      if (tabs.length === 1) await chrome.tabs.ungroup(tabs[0].id);
    }
  } catch (e) {
    console.debug("scan failed:", e);
  }
}

// Only events that can shrink a group trigger a scan.
chrome.tabs.onRemoved.addListener(scheduleScan);
chrome.tabs.onDetached.addListener(scheduleScan);
chrome.tabs.onUpdated.addListener((_id, changeInfo) => {
  if ("groupId" in changeInfo) scheduleScan();
});
