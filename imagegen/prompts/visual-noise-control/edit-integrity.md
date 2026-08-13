# Edit Integrity

## Purpose

Reduce collateral reconstruction and accumulated degradation during reference-image editing. Define the allowed change first, preserve compatible source anchors, distinguish artifact cleanup from legitimate texture, and prefer the cleanest valid source.

## Apply when

- An existing raster image must be modified, preserved, replaced, removed, or composited.
- The request uses the `reference-image-edit` structure family.
- A previous generated result is being corrected.
- Existing text, logos, labels, or fine graphics must remain on a smooth product or photographic surface.

## Do not apply when

Do not use a blanket preserve-everything rule for a requested global transformation, relighting, recoloring, or restyle. Preserve only the anchors the user explicitly requires.

Do not preserve an artifact whose removal is the stated edit objective.

## Compatible controls

- Combine with image integrity for all edit modes.
- Add photographic rendering when the source or target is photographic.
- Add clean rendering for clean graphic, UI, diagram, background, or catalog regions.
- Keep the existing edit-plus-series two-stage split.

## Edit modes

### Constrained edit

Use for local corrections, additions, removals, replacements, or compositing. Define exact operations, allowed regions, preserved anchors, and prohibited global changes.

### Artifact cleanup

Use when the target is tiled, checkerboard, ripple-like, grime-like, blocky, speckled, blurred, haloed, or otherwise contaminated. Name the affected region and preserve legitimate material texture, edges, text, geometry, and intended grain.

### Global transformation

Use for style transfer, broad relighting, recoloring, environmental transformation, or other authorized global changes. Permit the requested transformation and preserve only named identity, text, logo, geometry, layout, composition, or product anchors.

## Source selection

Use this order:

1. Original source image.
2. User-approved clean baseline.
3. Least-degraded valid prior result.
4. Latest generated result only when no cleaner source exists or the user explicitly selects it.

Prefer one cumulative, narrowly scoped edit over a chain of defect-by-defect edits when the corrections are compatible. If only a previously generated result is available, disclose the degradation risk and do not claim lossless preservation.

When exact text or a logo must remain unchanged, prefer retaining the original source pixels for the complete printed region and its immediate surrounding surface. Re-render that region only when the requested geometry, viewpoint, lighting, occlusion, or edit makes source-pixel retention impossible. If an authoritative logo or label asset is supplied and exact fidelity is mandatory, prefer compositing that asset after generation over model redrawing when the available workflow supports it; never fabricate an asset.

## Conflicts and exceptions

- Derive `Allowed changes` before defining preservation.
- A property cannot be both preserved and changed in the same role.
- During ordinary edits, preserve intentional grain and material texture.
- During artifact cleanup, the named contamination becomes an allowed-change target.
- A mask is guidance, not a guaranteed hard pixel boundary.
- Do not turn a local correction into a global quality enhancement.

## Atomic Prompt clauses

| ID | Select when | English clause |
| --- | --- | --- |
| `edit.minimum-change` | The edit is local | Make the minimum visual change necessary and leave every unrelated region unchanged. |
| `edit.no-global-reprocessing` | Global drift is a risk | Do not globally restyle, re-render, relight, recolor, sharpen, denoise, smooth, or retexture the image. |
| `edit.preserve-anchors` | Identity or exact assets matter | Preserve the declared identity, geometry, composition, crop, camera position, text, logos, and other named anchors. |
| `edit.regional-match` | A changed region must blend | Match the edited region to the surrounding detail scale, edge behavior, tonal range, lighting direction, color response, and intended grain character. |
| `edit.artifact-cleanup` | Structured contamination is the target | Remove only the named contamination in the affected region while preserving legitimate material texture, fine edges, text, geometry, and natural tonal variation. |
| `edit.global-transformation` | The user requests broad change | Apply the requested global transformation while preserving only the explicitly named identity, text, logo, geometry, layout, composition, or product anchors. |
| `edit.no-new-contamination` | Any edit may add artifacts | Introduce no new tiled, checkerboard, ripple-like, grime-like, blocky, haloed, or chromatically speckled artifacts. |
| `edit.protect-printed-region` | Existing printing must survive an edit | Treat each declared text or logo region and its immediate supporting surface as a protected unit: preserve stroke geometry and keep the neighboring material field smooth, with no redraw drift, echo contours, ripple bands, halos, or local texture buildup. |
| `edit.preserve-source-pixels` | Exact unchanged printing can remain in place | Retain original source pixels for the complete printed region and its immediate surrounding surface; do not reconstruct, relight, sharpen, denoise, or resynthesize that protected unit. |

## Native-format insertion

### JSON

Use `visual_integrity.edit` for selected edit clauses. Keep edit operations and preservation fields in their structure-family fields; do not duplicate them inside `visual_integrity`.

### Prose

Place `Edit integrity:` after `Allowed changes` and before `Output` and `Do not include`.

### Markdown

Place selected clauses under `## Edit Integrity` after edit operations and preservation constraints.

## Preflight checklist

- [ ] Every input image has an explicit role.
- [ ] The edit mode is constrained edit, artifact cleanup, global transformation, or an explicit compatible combination.
- [ ] The cleanest available valid source has been selected.
- [ ] Allowed changes are defined before preservation.
- [ ] The named cleanup target is not accidentally preserved.
- [ ] Legitimate texture, natural grain, text, geometry, and identity anchors remain protected when required.
- [ ] Exact printing uses source-pixel retention when compatible; otherwise the Prompt explicitly protects both strokes and neighboring surface.
- [ ] The Prompt does not claim a mask or preservation instruction guarantees unchanged pixels.
- [ ] A repeated-edit risk is reported instead of hidden.
