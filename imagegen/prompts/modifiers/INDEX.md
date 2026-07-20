# Modifier System

Use modifiers only after selecting one structure template and completing its required fields. Modifiers refine visual treatment; they never replace subjects, layout, facts, exact text, edit operations, or output requirements.

## Visual-noise control boundary

Read [the visual-noise control index](../visual-noise-control/INDEX.md) after family and native-format selection and before final modifier resolution.

Visual-noise controls are cross-cutting Prompt clauses, not modifier entries. Use this precedence:

1. Explicit user requirements.
2. Exact content and edit or preservation boundaries.
3. Selected visual-noise controls.
4. Compatible optional modifiers.

Modifiers may narrow a control to a named role but may not silently override preservation requirements, intentional texture exceptions, or a resolved grain policy. Remove semantic duplicates before authoring the final Prompt.

## Dimensions

| Dimension | File | Controls |
| --- | --- | --- |
| Medium and style | [medium-style.md](medium-style.md) | Rendering medium and visual grammar |
| Camera and framing | [camera-framing.md](camera-framing.md) | Viewpoint, shot size, and lens behavior |
| Lighting and shadow | [lighting-shadow.md](lighting-shadow.md) | Light direction, softness, contrast, and shadow |
| Color and tone | [color-tone.md](color-tone.md) | Palette, saturation, value range, and grading |
| Material and texture | [material-texture.md](material-texture.md) | Surface properties and tactile detail |
| Composition tendency | [composition-tendency.md](composition-tendency.md) | Balance, symmetry, density, and directional flow |
| Typography and graphic treatment | [typography-graphic-treatment.md](typography-graphic-treatment.md) | Type roles, callouts, dividers, and graphic devices |
| Era, region, and cultural language | [era-region-cultural-language.md](era-region-cultural-language.md) | Historically or culturally specific visual cues |
| Atmosphere and visual effects | [atmosphere-visual-effects.md](atmosphere-visual-effects.md) | Mood, particles, motion, weather, and energy effects |
| Quality and technical control | [quality-technical-control.md](quality-technical-control.md) | Observable fidelity and production constraints |
| Negative constraints | [negative-constraints.md](negative-constraints.md) | Task-specific exclusions and drift prevention |

## Entry contract

Every entry records:

- `name`: canonical English label;
- `aliases`: accepted equivalent labels;
- `applies_to`: compatible structure families or `all`;
- `intensity`: `low`, `medium`, or `high`;
- `conflicts`: mutually exclusive entry IDs or a conditional conflict;
- `dependencies`: required context or another entry;
- `polarity`: `positive` or `negative`;
- `source`: `corpus:<entry_id>` or `professional-supplement`.

Corpus-backed names are normalized English labels for concepts directly present in the cited source Prompt. They are not presented as verbatim translations. Professional supplements are general production vocabulary added outside `prompt大全.md`.

## Selection rules

1. Load only dimensions that materially change the requested result.
2. Prefer explicit user wording over every modifier entry.
3. Do not combine conflicts in the same visual role.
4. Satisfy dependencies before adding an entry.
5. Use at most one high-intensity entry per dimension unless the user explicitly requests a hybrid.
6. Never copy a source example's subject, brand, copy, facts, or story event while borrowing a treatment concept.
7. Remove any modifier that conflicts with required text, preservation constraints, technical truth, or the chosen output format.
