# Medium and Style Modifiers

## Corpus-backed vocabulary

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `medium.photoreal-commercial` | Photoreal commercial photography | advertising photography; studio realism | `single-frame-scene`, `commercial-copy-layout`, `reference-image-edit` | high | `medium.flat-vector` | physically plausible subject and lighting | positive | `corpus:all-119` |
| `medium.anime-action` | Dynamic anime illustration | anime key art; action anime | `single-frame-scene`, `sequential-comic-storyboard`, `character-asset-reference` | high | `medium.photoreal-commercial` | explicit character anchors | positive | `corpus:featured-005` |
| `medium.manga-monochrome` | Monochrome digital manga | grayscale manga; screentone comic | `sequential-comic-storyboard`, `commercial-copy-layout` | high | `color.full-spectrum-vivid` | panel or copy hierarchy | positive | `corpus:all-081` |
| `medium.hand-drawn-map` | Hand-drawn illustrated map | pictorial map; illustrated guide map | `map-spatial-guide` | medium | `medium.photoreal-commercial` | explicit topology and legend | positive | `corpus:featured-002` |

## Professional supplements

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `medium.flat-vector` | Flat vector illustration | geometric vector; flat icon style | `commercial-copy-layout`, `infographic-chart-explainer`, `brand-design-system` | medium | `medium.photoreal-commercial` | shape and color hierarchy | positive | `professional-supplement` |
| `medium.editorial-collage` | Editorial collage | cut-paper collage; mixed-media editorial | `single-frame-scene`, `commercial-copy-layout`, `infographic-chart-explainer` | medium | none | clear subject hierarchy | positive | `professional-supplement` |
| `medium.clay-render` | Stylized clay render | claymation look; soft 3D clay | `single-frame-scene`, `character-asset-reference`, `brand-design-system` | medium | `medium.photoreal-commercial` | simplified geometry | positive | `professional-supplement` |

