# Clean Rendering

## Purpose

Keep designated graphic and presentation regions free from incidental grain, grime, random texture, dirty gradients, block artifacts, and decorative micro-detail while preserving physically credible materials.

## Apply when

- UI, forms, diagrams, maps, charts, typography, icons, logos, or vector-like graphics need intentional crispness.
- Backgrounds, negative space, color fields, or gradients must remain clean.
- Catalog cutouts, studio backdrops, or designated product surfaces require pristine presentation.
- A mixed layout contains clean graphic regions around photographic content.

## Do not apply when

- The named role intentionally uses paper texture, canvas tooth, grain, patina, dust, distressed printing, grunge, halftone, screentone, or weathering.
- The entire commercial artifact is intentionally editorial, gritty, documentary, handmade, or analog.
- Clean rendering would erase legitimate material texture or soften required graphic edges.

## Compatible controls

- Combine with image integrity for UI, documents, diagrams, and flat graphics.
- Combine with photographic rendering for clean studio or catalog photography.
- Combine with edit integrity for cleaning or preserving designated graphic regions.
- Scope the control to graphic roles when photography and graphics share one canvas.

## Conflicts and exceptions

- `Commercial` is not sufficient evidence for clean rendering.
- Noise-free output applies only to named clean roles when other roles intentionally contain grain or texture.
- Do not prohibit actual plastic, resin, enamel, glass, metal, or polished materials. Require credible material behavior without dirty contamination.
- Text, logos, icons, diagrams, and UI controls may remain intentionally crisp even when photographic regions use restrained sharpening.
- High-contrast printing on a smooth photographic surface requires both stroke control and immediate-surface control; `clean.crisp-graphics` alone is insufficient.

## Atomic Prompt clauses

| ID | Select when | English clause |
| --- | --- | --- |
| `clean.pristine-surfaces` | Named backgrounds or manufactured surfaces should appear smooth and pristine | Keep only the named smooth surfaces pristine and visually clean, with controlled material-appropriate texture rather than blanket smoothing. |
| `clean.no-film-grain` | A grain-free finish is requested and compatible with the medium | Keep the designated role free from film grain and incidental noise while preserving legitimate material microtexture. |
| `clean.smooth-fields` | Backgrounds or gradients must be clean | Keep designated color fields and gradients smooth, continuous, and free from banding, mottling, dirt, or block buildup. |
| `clean.crisp-graphics` | Text or graphic edges matter | Keep typography, logos, icons, diagram lines, and intentional graphic edges crisp and clean without halos or contaminated pixels. |
| `clean.single-edge-graphics` | High-contrast strokes risk ringing or echo contours | Render every printed letter, logo stroke, and label line with one clean boundary only, preserving its intended shape and spacing without duplicate edges, echo contours, embossed rims, glow, chromatic fringes, or sharpening rings. |
| `clean.graphic-neighborhood` | Fine graphics sit on a smooth photographic or rendered surface | Keep the immediate surface around and between every printed stroke as one continuous low-frequency material field matching the surrounding unprinted surface, with no concentric ripples, alternating light-dark bands, halos, contaminated pixels, or local texture amplification. |
| `clean.negative-space` | Empty areas are part of the design | Preserve clean negative space without decorative particles, paper noise, grime, or unrequested texture. |
| `clean.incidental-texture` | The output should suppress random texture | Add no film grain, paper texture, dust, patina, compression-like blocks, or random surface variation unless explicitly assigned to a named role. |
| `clean.credible-materials` | Products must look clean but real | Keep product materials pristine yet physically credible, with material-specific reflections and roughness rather than uniform plastic gloss. |
| `clean.edge-separation` | Photo and graphic regions meet | Maintain clean separation between photographic subjects and graphic fields without cutout halos, dirty fringes, or synthetic edge buildup. |

## Native-format insertion

### JSON

Use `visual_integrity.scoped` for named backgrounds, text regions, UI components, diagrams, or product surfaces. Use `global` only when the whole image requires clean rendering.

### Prose

Add a concise `Rendering integrity:` sentence that names the clean role rather than declaring the entire image texture-free.

### Markdown

Place selected requirements under `## Visual Integrity` and state the affected regions.

## Preflight checklist

- [ ] Every clean requirement has a global or named scope.
- [ ] Grain-free and pristine-surface wording is applied only to compatible named roles.
- [ ] Intentional analog, distressed, printed, or weathered regions remain exempt.
- [ ] Required material texture is preserved.
- [ ] Photography and graphic edge treatments are separated correctly.
- [ ] Text-bearing smooth surfaces protect both the strokes and their immediate supporting surface.
- [ ] `Commercial` alone has not triggered global no-grain wording.
- [ ] No unrequested cleanliness rule alters the user's visual style.
