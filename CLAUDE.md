@AGENTS.md
# CLAUDE.md

## Risparmio di contesto

- `reference/atlante-dei-commerci-offline.html` pesa 31 MB: mai `Read` né `cat`. Come aprirlo: `docs/porting.md`.
- Output dei comandi: se le prove passano stampano poco; se falliscono, riporta solo le righe dell'errore.

## Superpowers spento

Per risparmiare token il plugin superpowers è spento in questo progetto. Il metodo è quello del kit (blocco in `AGENTS.md`), con le skill `planning-and-task-breakdown`, `tdd`, `diagnosing-bugs`, `code-review-and-quality` e `grilling`.

Si riaccende in un minuto: in `.claude/settings.json` metti a `true` `superpowers@claude-plugins-official` e `superpowers@synced`, poi apri una sessione nuova. Serve quando un piano chiede «REQUIRED SUB-SKILL: Use superpowers:…» o manca una skill `brainstorming`, `writing-plans`, `subagent-driven-development` o `executing-plans`.
