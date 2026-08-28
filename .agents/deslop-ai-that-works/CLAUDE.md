# deslop-cli

## BAML

- Edit prompts/functions only in `baml_src/`. Never hand-edit anything in `src/baml_client/` — it is regenerated.
- After changing `baml_src/`, regenerate the client with `uv run baml-cli generate`.
