# Photographic Rendering

## Purpose

Reduce plastic, waxy, overprocessed, or generically cinematic rendering in photography and photoreal imagery by specifying plausible optics, lighting, color, material response, detail falloff, and capture-consistent grain.

## Apply when

- The final role should look captured by a camera.
- A person, product, environment, or composite must appear physically photoreal.
- Skin, hair, fabric, transparent materials, reflective surfaces, depth, or natural light behavior matters.

Apply by visual role rather than by structure-family name.

## Do not apply when

- The requested role is flat vector art, diagram linework, UI, typography, anime, painterly illustration, or another explicitly non-photographic medium.
- Camera terminology would be decorative rather than useful.
- The user explicitly requests synthetic 3D, airbrushed beauty, surreal optical behavior, or another incompatible treatment.

## Compatible controls

- Combine with image integrity for ordinary photography.
- Add clean rendering for studio products, catalog cutouts, pristine backdrops, or graphic regions.
- Add edit integrity when modifying a source image.
- Use existing camera, lighting, color, material, and atmosphere modifiers only when they remain physically compatible.

## Conflicts and exceptions

- Visible film or sensor grain conflicts with noise-free output only when both target the same role.
- Do not add grain by default when the user has not requested an analog or capture-specific character.
- Do not apply restrained photographic edge treatment to typography, icons, diagrams, or other intended graphic edges.
- Do not forbid actual plastic or polished products; describe credible roughness, reflections, translucency, and edge behavior.
- Do not invent a lens, sensor, film stock, or camera body unless it materially expresses the requested result.

## Atomic Prompt clauses

| ID | Select when | English clause |
| --- | --- | --- |
| `photo.clean-fidelity` | A clean high-fidelity photographic result is required | Render as clean, high-fidelity photoreal imagery with resolved subject detail, natural tonal transitions, and no synthetic microtexture or overprocessed sharpness. |
| `photo.studio-lighting` | A controlled studio or catalog setup is requested or entailed | Use controlled studio lighting with coherent highlights, reflections, contact shadows, and tonal separation appropriate to the named subject and materials. |
| `photo.plausible-lighting` | Lighting realism matters | Use one physically plausible lighting setup with consistent direction, softness, falloff, reflections, and contact shadows. |
| `photo.optical-depth` | Depth and focus matter | Use believable optical depth and focus transitions without synthetic blur edges or uniformly sharp depth. |
| `photo.material-response` | Skin or materials risk plastic rendering | Preserve material-specific roughness, translucency, reflections, and microtexture instead of applying one glossy or waxy surface treatment. |
| `photo.skin-variation` | Human skin is visible | Preserve subtle pores, fine variation, and natural tonal transitions at a believable scale without beauty-filter smoothing. |
| `photo.restrained-grading` | The image risks a processed look | Use grounded color, restrained saturation, and natural contrast without HDR-like compression, generic teal-orange grading, or artificial glow. |
| `photo.natural-imperfection` | The scene risks sterile perfection | Retain subtle physically plausible irregularities and asymmetry without adding dirt or defects that were not requested. |
| `photo.capture-consistent-grain` | Grain is explicitly requested | Keep grain subtle, irregular, subordinate, and consistent with the stated capture medium; do not introduce structured digital noise. |

## Native-format insertion

### JSON

Place photographic requirements in `visual_integrity.global` for a fully photographic image or in `visual_integrity.scoped` for named photographic roles.

### Prose

Add a short `Rendering integrity:` sentence after camera, lighting, color, and material treatment.

### Markdown

Add selected clauses under `## Visual Integrity` after photographic treatment. Do not add a separate photography section solely for these controls.

## Preflight checklist

- [ ] The target role is genuinely photographic or photoreal.
- [ ] Clean fidelity and studio lighting are selected only when compatible with the requested scene and role.
- [ ] Lighting, optics, materials, and color describe one compatible physical result.
- [ ] Grain is omitted unless requested or clearly required by the declared medium.
- [ ] Skin and materials retain plausible variation without invented dirt.
- [ ] Graphic edges are not weakened by photographic edge rules.
- [ ] No vague quality-booster stack has replaced observable rendering requirements.
