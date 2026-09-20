# Forge

Keyboard-first developer toolbox for the [Omarchy](https://omarchy.org) bar.

Type a query. **Enter copies.** Left-click the bar icon to open the panel; bind Super+. to the overlay.

## Install on your Omarchy machine

```bash
omarchy plugin add https://github.com/Esegnorelli/omarchy-forge.git --enable
```

Then place it:

```bash
omarchy bar move esegnorelli.forge
```

Optional overlay bind in `hyprland.conf`:

```
bind = SUPER, PERIOD, exec, omarchy-shell shell toggle esegnorelli.forge
```

## Commands

| Query | Result |
| --- | --- |
| `uuid` | UUID v4 |
| `pw` / `pw 24` | Password |
| `now` | Unix + ISO + local |
| `hash text` | SHA-256 |
| `json {a:1}` | Pretty JSON |
| `100 km to mi` | Units |
| `#c5cad3` | Color |
| `cpf` / `cnpj` | Test IDs |
| `snip name = value` | Save snippet |

## License

MIT
