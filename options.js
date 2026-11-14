const $ = (id) => document.getElementById(id);
let statusTimer;

function flash(msg) {
  $("status").textContent = msg;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => ($("status").textContent = ""), 1200);
}

async function load() {
  const { nameOverrides = [] } = await chrome.storage.sync.get({ nameOverrides: [] });
  $("nameOverrides").value = nameOverrides.join("\n");
}

async function save() {
  const nameOverrides = $("nameOverrides").value.split("\n").map((l) => l.trim()).filter(Boolean);
  await chrome.storage.sync.set({ nameOverrides });
  flash("Saved");
}

$("nameOverrides").addEventListener("change", save);
load();
