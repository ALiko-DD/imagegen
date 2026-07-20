# Prompt System

## Purpose

Use this reference for difficult family boundaries, native-format exceptions, source-example provenance, and taxonomy maintenance. `SKILL.md` owns the routing table and workflow; each selected template owns its required fields, default format, skeleton, and family checklist.

## Boundary decisions

Choose by the artifact's validation contract, not by platform names, source-site categories, or shared style words:

- Poster vs thumbnail: copy hierarchy and hero placement decide the family, not the platform.
- Grid vs storyboard: ordered causality and continuity require a storyboard; independent slots require a collection grid.
- Infographic vs technical diagram: parts, geometry, assembly, and callout ownership require a technical diagram.
- Infographic vs form: fixed paper fields, cells, and formulas require a form.
- UI vs commercial layout: components, navigation, viewport, interaction, and state require UI.
- Character sheet vs brand board: identity-consistent views require a character reference; identity tokens and applications require a brand system.
- One-canvas board vs separate outputs: separate deliverables require a series.

When no boundary test resolves the request, compare the candidate templates' required inputs, field structures, and preflight checklists. Ask the user only if the remaining choice changes the artifact contract.

## Native-format classification

Classify a Prompt body deterministically:

1. Trim leading and trailing whitespace.
2. If it starts with `{` or `[` and `JSON.parse` succeeds, classify it as `json`.
3. If it starts with `{` or `[` and parsing fails, classify it as `json-like`.
4. If the Prompt body contains Markdown headings, classify it as `markdown`.
5. Otherwise classify it as `prose`.

Do not infer format from visual appearance or from the documentation file containing the Prompt.

## Format selection

Use the selected template's default unless the request contract clearly benefits from another native format.

Use JSON when nested regions, panels, components, routes, callouts, repeated units, exact array counts, or cross-unit relationships need independent validation. The actual Prompt file must be strict JSON without comments, trailing commas, or Markdown fences.

Use prose when one frame or edit can be expressed clearly through compact labeled clauses and nested validation is unnecessary.

Use Markdown only when a long mixed-constraint request becomes materially easier to inspect through named sections. Markdown is not the universal fallback.

## Format override

An override is valid only when all of these remain true:

- the chosen format preserves every required field from the selected template;
- exact text, counts, relationships, and prohibitions remain directly checkable;
- the override reduces ambiguity rather than decorating the Prompt;
- the actual Prompt remains one complete body in a single format.

Do not convert valid JSON to prose merely to shorten it. Do not wrap prose or JSON in Markdown headings solely for uniformity.

## Source examples

Each selected raw example appears once between matching markers:

```text
<!-- SOURCE_PROMPT_START:<entry_id> -->
...
<!-- SOURCE_PROMPT_END:<entry_id> -->
```

- Preserve the enclosed body byte-for-byte as UTF-8 text.
- Preserve native JSON, JSON-like, or prose form.
- Do not fix invalid JSON-like examples.
- Do not translate, expand, or present examples as user-specific output.
- Use the valid template skeleton, not a raw example, when authoring a new Prompt.

## Taxonomy maintenance

Keep families separate unless their required inputs, field structure, routing boundary, validation checklist, and output contract overlap by at least 85%.

Re-audit the local corpus when:

- the source SHA-256 changes;
- a Prompt title, block boundary, or count changes;
- new direct evidence is added for a provisional family;
- a proposed merge or split changes one-family assignment.

Never migrate silently. A source change must fail audit and trigger classification review.
