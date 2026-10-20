# Muse Allow-Button Alerter (alert-only)

A Firefox userscript that makes sure you never miss a Muse approval request. When an approval card appears on [muse.ai](https://muse.ai), the script grabs your attention — flashing tab title, a soft repeating ping, a pulsing outline around the **Allow** button, and a small corner badge — so you can review and decide right away.

**It never clicks anything.** The script only watches the page and alerts. Every approval decision stays with you, exactly as the approval system intends: this tool removes the "I didn't notice the card" delay, not the human judgment.

## Why

Muse asks for approval before consequential actions (merging a pull request, sending something, making a purchase). That's a safeguard worth keeping — but a card you don't notice stalls your work. This script makes the card impossible to miss while leaving the decision untouched.

## What it does

When a visible button whose label starts with "Allow" (including "Allow always" / "Always allow") appears on muse.ai:

- **Flashes the tab title** with "🔔 Approval needed — Muse"
- **Plays a soft ping** every 6 seconds
- **Outlines the Allow button** with a pulsing orange border
- **Shows a badge** in the bottom-right corner: "🔔 Approval waiting in Muse"

When the card disappears (you approve, deny, or dismiss it), all alerts stop and the page returns to normal.

## Install

1. Install a userscript manager in Firefox:
   - [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/), or
   - [Violentmonkey](https://addons.mozilla.org/firefox/addon/violentmonkey/)
2. In the manager dashboard, choose **Create a new script** (Tampermonkey: the **+** tab; Violentmonkey: **+ → New userscript**).
3. Delete the template, paste in the full contents of [`muse-allow-alerter.user.js`](muse-allow-alerter.user.js), and save.

The script is matched to `muse.ai` only and runs automatically whenever you're on the site.

## Settings

Edit the constants at the top of the script:

| Setting | Default | Meaning |
| --- | --- | --- |
| `ENABLE_SOUND` | `true` | Soft ping while an approval is waiting |
| `PING_EVERY_MS` | `6000` | How often the ping repeats (milliseconds) |
| `FLASH_TITLE` | `true` | Alternate the tab title |
| `SHOW_BADGE` | `true` | Corner badge |
| `OUTLINE_BUTTON` | `true` | Pulsing outline around the button |

## Limitations

- **Sound needs one interaction first.** Browsers block audio until you've clicked or typed on the page at least once. Visual alerts work regardless.
- **Label-based detection.** The script looks for a visible button whose text starts with "Allow". If Muse's approval UI changes its labels, detection may need an update.
- **Approval cards only.** It watches for Allow buttons on muse.ai; it doesn't monitor other sites or other kinds of prompts.

## Privacy

The script collects nothing, phones nowhere, and requests no special permissions (`@grant none`). It runs entirely in your browser tab.

## License

[MIT](LICENSE) © 2026 Sean Shaffer
