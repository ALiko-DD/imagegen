# Era, Region, and Cultural Language Modifiers

Use culturally or historically specific language only when the request supplies or clearly requires it. Do not treat a culture as a decorative stereotype.

## Corpus-backed vocabulary

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `culture.traditional-chinese-dojo` | Traditional Chinese martial-arts interior language | wooden martial hall; temple training space | `single-frame-scene`, `sequential-comic-storyboard` | medium | none | user-requested regional context | positive | `corpus:featured-005` |
| `culture.japanese-digital-ad` | Japanese digital advertising language | Japanese banner system; Japanese copy-led ad | `commercial-copy-layout`, `nonsequential-collection-grid` | medium | none | exact Japanese copy or supplied localization | positive | `corpus:all-021` |
| `culture.japanese-kawaii-sticker` | Japanese kawaii sticker language | cute Japanese sticker set; character sticker culture | `nonsequential-collection-grid`, `brand-design-system` | medium | `culture.swiss-industrial` | explicit cute character direction | positive | `corpus:all-022` |
| `culture.swiss-industrial` | Swiss-style industrial technology language | International Typographic Style; industrial grid branding | `brand-design-system`, `commercial-copy-layout`, `ui-page-mockup` | high | `culture.japanese-kawaii-sticker` when one identity must be coherent | grid, typography, and restrained palette | positive | `corpus:all-091` |

## Professional supplements

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `culture.midcentury-modern` | Mid-century modern graphic language | 1950s–1960s modernism; atomic-age editorial | `commercial-copy-layout`, `brand-design-system`, `single-frame-scene` | medium | none | period-appropriate forms and palette | positive | `professional-supplement` |
| `culture.art-deco` | Art Deco visual language | geometric luxury deco; 1920s–1930s glamour | `commercial-copy-layout`, `brand-design-system` | high | `culture.swiss-industrial` when one identity must be coherent | geometric ornament and period intent | positive | `professional-supplement` |
| `culture.contemporary-global` | Contemporary global neutral language | culturally neutral modern; international contemporary | `ui-page-mockup`, `brand-design-system`, `commercial-copy-layout` | low | none | avoid unrequested regional motifs | positive | `professional-supplement` |

