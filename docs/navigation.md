# Navigation flow

```text
Home
  ├─ Escolher foto ─┐
  └─ Tirar foto ────┴─ Editor
                       ├─ Desfocar / Pixelar
                       ├─ Pincel e intensidade
                       ├─ Antes/depois
                       ├─ Presets
                       └─ Exportar → Compartilhar / Salvar
```

The editor is the only screen that owns an active editing session. Leaving it
with changes asks for confirmation. Permission errors and export failures are
recoverable inline states and never discard the current session.
