# Quality and Technical Control Modifiers

Quality controls must be observable. Do not use a generic quality phrase when a concrete fidelity, readability, count, or edge requirement is available.

## Corpus-backed vocabulary

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `quality.high-res-commercial` | High-resolution commercial fidelity | advertising-grade detail; commercial render fidelity | `single-frame-scene`, `commercial-copy-layout`, `brand-design-system` | medium | none | target viewing size | positive | `corpus:all-119` |
| `quality.clean-studio-cutout` | Clean studio product cutouts | isolated commercial mockup objects; crisp product separation | `brand-design-system`, `commercial-copy-layout`, `nonsequential-collection-grid` | medium | none | controlled background and shadow | positive | `corpus:all-091` |
| `quality.text-legibility` | High text legibility | readable captions; clear promotional copy | `commercial-copy-layout`, `sequential-comic-storyboard`, `print-document-form`, `ui-page-mockup` | high | none | exact text and sufficient region size | positive | `corpus:all-081` |
| `quality.count-integrity` | Exact item-count integrity | list-to-visual count match; panel count accuracy | `nonsequential-collection-grid`, `sequential-comic-storyboard`, `brand-design-system`, `infographic-chart-explainer` | high | none | explicit lists and declared counts | positive | `corpus:all-089` |

## Professional supplements

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `quality.edge-critical` | Edge-critical silhouette fidelity | clean contour preservation; no clipped geometry | `reference-image-edit`, `single-frame-scene`, `character-asset-reference` | high | `effect.motion-blur-selective` on the same object | named silhouette or product geometry | positive | `professional-supplement` |
| `quality.small-size-readability` | Small-size readability | thumbnail legibility; reduced-scale clarity | `commercial-copy-layout`, `map-spatial-guide`, `infographic-chart-explainer`, `ui-page-mockup` | high | none | intended display size | positive | `professional-supplement` |
| `quality.transparent-edge` | Clean transparent-background edges | alpha-safe contour; no haloing | `character-asset-reference`, `nonsequential-collection-grid`, `brand-design-system` | high | `negative.no-transparent-background` | transparent output requirement | positive | `professional-supplement` |

