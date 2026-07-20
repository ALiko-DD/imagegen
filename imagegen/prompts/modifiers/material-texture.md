# Material and Texture Modifiers

## Corpus-backed vocabulary

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `material.rustic-wood` | Rustic wood grain | aged timber; natural wooden interior | `single-frame-scene`, `reference-image-edit` | medium | `material.polished-chrome` | visible wooden surfaces | positive | `corpus:featured-005` |
| `material.glossy-food-detail` | Glossy food texture with slight melt | moist gloss; soft melting texture | `single-frame-scene`, `commercial-copy-layout` | medium | none | edible subject and close detail | positive | `corpus:all-012` |
| `material.warm-paper` | Warm off-white paper | cream paper stock; warm paper substrate | `brand-design-system`, `print-document-form`, `commercial-copy-layout` | low | `material.polished-chrome` | printed or laid-out artifact | positive | `corpus:all-091` |
| `material.enamel-merch` | Hard enamel merchandise finish | enamel pin finish; glossy badge material | `brand-design-system`, `nonsequential-collection-grid` | medium | none | small manufactured merchandise | positive | `corpus:all-091` |

## Professional supplements

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `material.polished-chrome` | Polished chrome | mirror metal; reflective chrome | `single-frame-scene`, `commercial-copy-layout`, `technical-annotated-diagram` | high | `material.rustic-wood`, `material.warm-paper` when one surface is intended | controlled reflections | positive | `professional-supplement` |
| `material.frosted-glass` | Frosted translucent glass | etched glass; diffuse translucent glass | `single-frame-scene`, `ui-page-mockup`, `commercial-copy-layout` | medium | none | backlight or visible edge thickness | positive | `professional-supplement` |
| `material.matte-polymer` | Matte molded polymer | soft-touch plastic; non-gloss polymer | `technical-annotated-diagram`, `single-frame-scene`, `brand-design-system` | medium | `material.polished-chrome` when applied to the same part | a named product component | positive | `professional-supplement` |

