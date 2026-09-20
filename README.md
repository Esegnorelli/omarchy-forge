# Forge

Keyboard-first developer toolbox for the [Omarchy](https://omarchy.org) bar.

Type a query. **Enter copies.** Left-click the bar icon to open the panel; bind a key to the overlay for a Raycast-style palette.

```
uuid
pw 24
now
hash omarchy
json {a:1}
100 km to mi
#c5cad3
b64 hello
snake Hello World
lorem 2
cpf
snip email = you@localhost
/email
```

## Install

On your Omarchy machine:

```bash
omarchy plugin add https://github.com/Esegnorelli/omarchy-forge.git --enable
```

Place it:

```bash
omarchy bar move esegnorelli.forge
```

Summon the overlay (bind this in Hyprland):

```
bind = SUPER, PERIOD, exec, omarchy-shell shell toggle esegnorelli.forge
```

Then reload:

```bash
omarchy-shell restart
```

## Commands

| Query | Result |
| --- | --- |
| `uuid` | UUID v4 |
| `pw` / `pw 24` / `pw 32 nosym` | Password |
| `now` / `ts 1710000000` | Unix + ISO + local |
| `b64 text` / `b64d payload` | Base64 |
| `url text` / `urld text` | URL encode/decode |
| `hash text` | SHA-256 |
| `json {a:1}` / `minify …` | Pretty / compact JSON |
| `#c5cad3` / `rgb(12,12,14)` | Hex, RGB, HSL |
| `100 km to mi` | Length, mass, temp, data, time |
| `snake` `camel` `kebab` `title` | Case convert |
| `lorem 3` | Placeholder copy |
| `jwt eyJ…` | Decode payload (not verified) |
| `cpf` / `cnpj` | Synthetic test IDs (BR fixtures) |
| `snip name = value` | Save a snippet |
| `/name` | Recall a snippet |
| `12 * 1.1 + 4` | Calculator |

Left click toggles the panel. Right click recopies the last result. Middle click mints a UUID immediately.

## Files

| File | Role |
| --- | --- |
| `manifest.json` | Plugin id, bar-widget + overlay, settings schema |
| `BarWidget.qml` | Bar slot and panel host |
| `Panel.qml` | Dropdown from the bar |
| `Overlay.qml` | Centered command palette |
| `ForgeView.qml` | Shared search + result UI |
| `Model.js` | Pure query parser and formatters |

Snippets persist at `~/.local/share/esegnorelli.forge/snippets.json`.

## Validate

```bash
omarchy plugin validate .
```

## License

MIT
