# Lighting and Shadow Modifiers

## Corpus-backed vocabulary

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `light.dramatic-directional` | Dramatic directional lighting | hard dramatic light; directional key | `single-frame-scene`, `commercial-copy-layout`, `sequential-comic-storyboard` | high | `light.soft-even-studio` | defined light direction | positive | `corpus:featured-005` |
| `light.warm-beauty-soft` | Warm beauty light with soft shadows | flattering warm key; soft beauty lighting | `single-frame-scene`, `reference-image-edit` | medium | `light.low-key-hard` | portrait or skin-focused subject | positive | `corpus:all-012` |
| `light.soft-even-studio` | Soft even studio lighting | diffuse product light; uniform studio light | `single-frame-scene`, `brand-design-system`, `nonsequential-collection-grid` | medium | `light.dramatic-directional` | controlled presentation | positive | `corpus:all-091` |
| `light.soft-contact-shadow` | Soft contact shadows | subtle grounding shadows; gentle product shadow | `brand-design-system`, `commercial-copy-layout`, `ui-page-mockup` | low | none | objects on a visible surface | positive | `corpus:all-091` |

## Professional supplements

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `light.low-key-hard` | Low-key hard lighting | noir lighting; hard rim and deep shadow | `single-frame-scene`, `commercial-copy-layout` | high | `light.warm-beauty-soft`, `light.soft-even-studio` | intentional dark value range | positive | `professional-supplement` |
| `light.overcast-diffuse` | Overcast diffuse daylight | cloud-soft daylight; shadowless exterior light | `single-frame-scene`, `reference-image-edit` | low | `light.dramatic-directional` | exterior or window-lit context | positive | `professional-supplement` |
| `light.translucent-backlight` | Translucent backlighting | glowing transmitted light; rim-lit translucency | `single-frame-scene`, `commercial-copy-layout` | medium | none | translucent material or atmospheric subject | positive | `professional-supplement` |

