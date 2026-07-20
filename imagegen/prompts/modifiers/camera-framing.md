# Camera and Framing Modifiers

## Corpus-backed vocabulary

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `camera.low-angle-dynamic` | Dramatic low-angle view | heroic low angle; upward camera | `single-frame-scene`, `commercial-copy-layout` | high | `camera.orthographic-front` | a subject with readable vertical form | positive | `corpus:featured-005` |
| `camera.centered-half-body` | Centered half-body portrait | waist-up portrait; centered beauty shot | `single-frame-scene`, `reference-image-edit` | medium | `composition.off-center-diagonal` | one primary portrait subject | positive | `corpus:all-012` |
| `camera.orthographic-front` | Front-facing orthographic presentation | straight-on projection; elevation view | `technical-annotated-diagram`, `brand-design-system`, `character-asset-reference` | high | `camera.low-angle-dynamic` | geometry or asset comparison | positive | `corpus:all-091` |
| `camera.flat-lay` | Top-down flat lay | overhead arrangement; bird's-eye product layout | `brand-design-system`, `nonsequential-collection-grid`, `print-document-form` | medium | `camera.low-angle-dynamic` | objects arranged on one plane | positive | `corpus:all-091` |

## Professional supplements

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `camera.macro-detail` | Macro detail framing | close macro; extreme close-up | `single-frame-scene`, `character-asset-reference`, `reference-image-edit` | high | `camera.establishing-wide` | a named detail target | positive | `professional-supplement` |
| `camera.establishing-wide` | Wide establishing view | environmental wide shot; scene overview | `single-frame-scene`, `map-spatial-guide` | medium | `camera.macro-detail` | a meaningful environment | positive | `professional-supplement` |
| `camera.isometric` | Isometric view | three-quarter axonometric; isometric projection | `technical-annotated-diagram`, `map-spatial-guide`, `ui-page-mockup` | medium | `camera.orthographic-front` when one view must be exact | stable geometry | positive | `professional-supplement` |

