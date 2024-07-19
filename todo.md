high level:
- agent bindings
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
function: string // e.g. "@all sum(SCALAR)"
selector: string // e.g. "@all"
valueType: string // e.g. "SCALAR"
```