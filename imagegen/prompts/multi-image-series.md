# Multi-Image Series Template

## Purpose and use cases

Use when the deliverable explicitly requires multiple independent image files, pages, or slides. This family is provisional because the corpus contains only two direct samples and does not establish a stable universal schema.

## Routing boundaries

- Route a multi-slot single canvas to `nonsequential-collection-grid` or `sequential-comic-storyboard`.
- Use this family only for separate files, pages, slides, or answer images.
- When reference-image editing is also required, split the work into two stages: establish an edited baseline with `reference-image-edit`, then define the series.

## Required inputs

- Output count.
- Purpose, content, and order of every image or page.
- Subject, style, text, ratio, and other invariants shared across outputs.
- Fields allowed to vary per output.
- User-supplied file naming, canvas dimensions, and delivery order when provided.

## Default native format

Use prose by default. The source evidence does not justify a fixed JSON schema, so do not force one for formatting consistency.

## Prompt structure

Write in this order:

```text
Create <output count> independent outputs for <purpose>.
Shared invariants: <subject, style, ratio, text, and fixed traits>.
Output 1: <purpose and complete content>.
Output 2: <purpose and complete content>.
...
Delivery order and naming: <user-supplied order, filenames, or page numbers; omit unknown optional values>.
Do not include: <cross-output drift, count errors, and other prohibitions>.
```

## Field guidance

- Make the output count agree with the itemized list.
- Make every item independently executable; do not replace required details with “same as above.”
- Separate cross-output invariants from per-output variation.
- Require an explicit slide count; do not invent one when the source request omits it.
- Preserve a supplied aspect ratio without deriving pixel dimensions. Do not invent filenames, page names, or delivery labels.

## Writing guidance

- Define the shared contract first and each output second.
- Treat multi-image response support as a provider capability question; the Prompt system only ensures complete requirements.
- Split dependent outputs into serial tasks instead of pretending one request can complete every dependency.
- Load modifier dimensions relevant to the intended artifacts without loading another structure template.

## Verbatim source Prompt examples

Only two short direct samples are available. Do not infer missing page counts or fields from rendered results.

### Example 1

- `entry_id`: `featured-003`
- Source title: `混合风格的桃太郎讲解 Slides`
- Native format: prose

<!-- SOURCE_PROMPT_START:featured-003 -->
```text
创建一个讲解型 Slides（{argument name="format" default="ponchi-e diagram"}），主题为 {argument name="theme" default="Momotaro"}，将“Irasutoya”的柔和氛围与“霞关风格 Slides”极高的信息密度完美融合。
```
<!-- SOURCE_PROMPT_END:featured-003 -->

### Example 2

- `entry_id`: `all-038`
- Source title: `信息图 / 教育视觉图 - 物理考试题目布局`
- Native format: prose

<!-- SOURCE_PROMPT_START:all-038 -->
```text
生成一张物理 {argument name="subject" default="高中考试"} 题目 {argument name="type" default="多选题"} 的 9:16 图像。生成 4 张图像，每张图像对应所提供问题的一个答案
```
<!-- SOURCE_PROMPT_END:all-038 -->

## Preflight checklist

- [ ] Output count agrees with the itemized list.
- [ ] Every image or page has complete content.
- [ ] Cross-output invariants and allowed variation are separated.
- [ ] Supplied file order, naming, dimensions, and ratios are preserved; omitted optional values remain unspecified.
- [ ] A multi-slot single canvas has not been routed here.
- [ ] Any edit-plus-series request has been split into two stages.
