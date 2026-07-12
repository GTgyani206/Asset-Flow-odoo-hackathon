# src/features

Feature slices for each business module. One sub-directory per module, e.g.:

```
features/
├── asset-registry/
├── allocation/
├── resource-booking/
└── ...
```

Each feature slice owns its own:
- Server actions or API client calls (`api.ts`)
- React components specific to that feature
- Local state / hooks

Features import from `@assetflow/contracts` for type safety. They do not import from `apps/api` directly.
