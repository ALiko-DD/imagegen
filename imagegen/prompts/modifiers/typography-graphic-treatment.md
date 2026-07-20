# Typography and Graphic Treatment Modifiers

## Corpus-backed vocabulary

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `type.bold-comic-bars` | Bold comic title bars with uppercase lettering | manga header bars; promotional comic captions | `sequential-comic-storyboard`, `commercial-copy-layout` | high | `type.quiet-editorial` | explicit headline hierarchy | positive | `corpus:all-081` |
| `type.mono-plus-sans` | Monospace primary with sans-serif secondary | technical mono and neutral sans; dual-role typography | `brand-design-system`, `ui-page-mockup`, `technical-annotated-diagram` | medium | none | separate primary and secondary roles | positive | `corpus:all-091` |
| `type.leader-line-callouts` | Leader-line callouts | annotated pointers; component labels | `technical-annotated-diagram`, `infographic-chart-explainer` | high | none | named targets for every callout | positive | `corpus:featured-001` |
| `type.dashed-divider` | Dashed section dividers | technical dashed rules; segmented separators | `brand-design-system`, `print-document-form`, `ui-page-mockup` | low | none | clearly separated regions | positive | `corpus:all-091` |

## Professional supplements

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `type.quiet-editorial` | Quiet editorial typography | understated magazine type; restrained hierarchy | `commercial-copy-layout`, `brand-design-system`, `print-document-form` | medium | `type.bold-comic-bars` | limited text hierarchy | positive | `professional-supplement` |
| `type.condensed-display` | Condensed display headline | narrow uppercase title; poster condensed type | `commercial-copy-layout`, `sequential-comic-storyboard` | high | none | short headline text | positive | `professional-supplement` |
| `type.numbered-wayfinding` | Numbered wayfinding labels | indexed markers; route numbering | `map-spatial-guide`, `infographic-chart-explainer` | medium | none | unique IDs and legend mapping | positive | `professional-supplement` |

