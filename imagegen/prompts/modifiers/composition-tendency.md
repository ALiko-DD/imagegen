# Composition Tendency Modifiers

## Corpus-backed vocabulary

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `composition.centered-hero` | Centered hero composition | central subject; symmetrical hero | `single-frame-scene`, `commercial-copy-layout` | medium | `composition.off-center-diagonal` | one dominant subject | positive | `corpus:all-012` |
| `composition.two-by-two-grid` | Balanced 2×2 grid | four-slot matrix; quadrant grid | `nonsequential-collection-grid`, `ui-page-mockup` | high | `composition.off-center-diagonal` | exactly four comparable slots | positive | `corpus:all-021` |
| `composition.dense-three-by-six` | Dense 3×6 system board | eighteen-panel grid; high-density identity board | `brand-design-system` | high | `composition.minimal-whitespace` | exactly eighteen sections | positive | `corpus:all-089` |
| `composition.exploded-callout` | Central exploded object with side callouts | exploded hero and annotations; bilateral callout layout | `technical-annotated-diagram` | high | none | component hierarchy and callout mapping | positive | `corpus:featured-001` |

## Professional supplements

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `composition.off-center-diagonal` | Off-center diagonal flow | dynamic diagonal; asymmetrical motion | `single-frame-scene`, `commercial-copy-layout`, `sequential-comic-storyboard` | high | `composition.centered-hero`, `composition.two-by-two-grid` | a clear directional subject or action | positive | `professional-supplement` |
| `composition.minimal-whitespace` | Minimal composition with generous whitespace | sparse layout; restrained negative space | `commercial-copy-layout`, `brand-design-system`, `print-document-form` | medium | `composition.dense-three-by-six` | few primary elements | positive | `professional-supplement` |
| `composition.z-pattern` | Z-pattern reading flow | diagonal copy flow; top-left to bottom-right hierarchy | `commercial-copy-layout`, `ui-page-mockup` | medium | none | at least three ordered regions | positive | `professional-supplement` |

