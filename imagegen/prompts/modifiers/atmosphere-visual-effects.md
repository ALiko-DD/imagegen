# Atmosphere and Visual Effects Modifiers

## Corpus-backed vocabulary

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `effect.explosive-particles` | Explosive action particles and debris | flying dust; glowing particles; impact debris | `single-frame-scene`, `sequential-comic-storyboard` | high | `effect.calm-minimal` | an action or impact event | positive | `corpus:featured-005` |
| `effect.energy-trails` | Sweeping energy trails | motion energy arcs; colored action trails | `single-frame-scene`, `sequential-comic-storyboard` | high | `effect.calm-minimal` | a defined moving subject | positive | `corpus:featured-005` |
| `effect.chic-playful` | Playful yet chic mood | fashion-playful; subtly sensual editorial mood | `single-frame-scene`, `commercial-copy-layout` | medium | `effect.industrial-futurist` | portrait or lifestyle context | positive | `corpus:all-012` |
| `effect.industrial-futurist` | Professional industrial-futurist mood | premium infrastructure mood; restrained future-tech | `brand-design-system`, `ui-page-mockup`, `commercial-copy-layout` | medium | `effect.chic-playful` when one identity must be coherent | technical subject or brand positioning | positive | `corpus:all-091` |

## Professional supplements

| ID | Name | Aliases | Applies to | Intensity | Conflicts | Dependencies | Polarity | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `effect.calm-minimal` | Calm minimal atmosphere | quiet stillness; restrained mood | `single-frame-scene`, `commercial-copy-layout`, `brand-design-system` | low | `effect.explosive-particles`, `effect.energy-trails` | low visual noise | positive | `professional-supplement` |
| `effect.volumetric-haze` | Controlled volumetric haze | light fog; atmospheric light volume | `single-frame-scene`, `commercial-copy-layout` | medium | none | visible depth and directional light | positive | `professional-supplement` |
| `effect.motion-blur-selective` | Selective motion blur | directional motion smear; subject-speed blur | `single-frame-scene`, `sequential-comic-storyboard` | medium | `quality.edge-critical` on the same object | a named moving region | positive | `professional-supplement` |

