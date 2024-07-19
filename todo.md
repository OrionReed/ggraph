high level:
- agent bindings
  - create UI
  - sync user prefs with bindings
  - sync in doc meta
- agent selectors
- basic "social" shape
- graph projections
- delegated execution

agent bindings on document meta:
- names, unique IDs, client IDs ?
```json
agents: {
  name: clientId[]
}
```

social shape props:
```json
text: string // e.g. "@all sum(SCALAR)"
selector: string // e.g. "@all"
valueType: string // e.g. "SCALAR"
values: Record<string, any>
```