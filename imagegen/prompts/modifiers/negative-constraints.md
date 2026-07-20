# Negative Constraint Modifiers

Use only constraints tied to a likely failure mode. Never add a generic negative list that erases required content.

## Corpus-backed vocabulary

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `negative.remove-source-annotations` | Remove source annotations | delete blueprint labels; remove original callouts | `reference-image-edit` | high | `type.leader-line-callouts` when callouts must remain | an input image containing annotations | negative | `corpus:all-101` |
| `negative.no-brand-drift` | No brand-token drift | preserve logo and palette; no identity substitution | `brand-design-system`, `reference-image-edit`, `commercial-copy-layout` | high | none | explicit brand tokens | negative | `corpus:all-091` |
| `negative.no-count-drift` | No count drift | no missing or extra items; exact quantity only | `nonsequential-collection-grid`, `sequential-comic-storyboard`, `infographic-chart-explainer`, `brand-design-system` | high | none | declared count and item list | negative | `corpus:all-089` |

## Professional supplements

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `negative.no-unrequested-text` | No unrequested text | no invented labels; no extra copy | `all` | high | any required exact text if applied globally | a complete exact-text inventory | negative | `professional-supplement` |
| `negative.no-crop-critical` | Do not crop critical elements | keep full product; preserve page edges | `single-frame-scene`, `print-document-form`, `technical-annotated-diagram`, `reference-image-edit` | high | none | named critical elements | negative | `professional-supplement` |
| `negative.no-transparent-background` | No transparent background | require opaque background; no alpha | `single-frame-scene`, `commercial-copy-layout`, `ui-page-mockup` | medium | `quality.transparent-edge` | explicit opaque-background requirement | negative | `professional-supplement` |
| `negative.no-identity-change` | No identity change | preserve face and silhouette; no subject substitution | `reference-image-edit`, `character-asset-reference` | high | none | explicit identity anchors | negative | `professional-supplement` |
| `negative.no-interface-invention` | No invented platform UI | no fake metrics; no extra controls | `ui-page-mockup`, `commercial-copy-layout` | high | none | complete component or copy list | negative | `professional-supplement` |

