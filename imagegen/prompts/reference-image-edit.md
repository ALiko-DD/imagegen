# Reference Image Edit Template

## Purpose and use cases

Use to modify one or more input images through movement, removal, replacement, addition, identity preservation, product transformation, background compositing, or style transfer.

## Routing boundaries

- Use this family whenever an input image is an object that must be compared or preserved.
- Route by the intended final artifact only when the input contributes abstract style and no input content must remain.
- When the request also requires separate output files, split it into two stages: create one edited baseline, then use `multi-image-series`.

## Required inputs

- Order and role of every input image.
- Edit objective.
- Content to preserve, remove, replace, add, and allow to change.
- Edit mode: constrained edit, artifact cleanup, or global transformation.
- Cleanest available source: original, approved baseline, or least-degraded valid result.
- Identity, packaging, text, geometry, camera, background, and lighting invariants.
- For text-bearing surfaces: printed-stroke boundaries, immediate surrounding material field, and whether original pixels or an authoritative asset can be retained.
- Output ratio, format, and comparison criteria.

## Default native format

Use structured prose by default. A multi-reference task may use a structured list, but every image role must remain explicit.

## Prompt structure

```text
Input images:
- Image 1: <edit target or reference role>.
- Image 2: <role, when present>.

Goal: <visible edited result>.
Edit mode: <constrained edit, artifact cleanup, or global transformation>.
Source selection: <original, approved baseline, or least-degraded valid result>.
Preserve: <identity, product, packaging, text, geometry, camera, or background>.
Remove: <complete list>.
Replace: <old content → new content>.
Add: <position, count, and appearance>.
Allowed changes: <explicit scope>.
Output: <ratio, size, and format>.
Do not include: <drift, extra edits, or incorrect text>.
```

## Field guidance

- Do not treat every input image as an edit target.
- Keep preservation and change instructions mutually consistent.
- Record exact text, logos, and packaging elements verbatim.
- Treat each exact text or logo region together with its immediate supporting surface; preserving glyph content alone does not protect against ringing around it.
- Define face, silhouette, proportion, clothing, or product-geometry anchors for identity preservation.
- During artifact cleanup, exclude the named contamination from preservation while retaining legitimate texture and intended grain.
- During global transformation, preserve only explicitly required anchors instead of claiming every pixel remains unchanged.

## Writing guidance

- State image roles before edit operations.
- Separate preserve, remove, replace, add, and allowed-change instructions.
- Read [edit-integrity.md](visual-noise-control/edit-integrity.md) and select only clauses matching the edit mode.
- Prefer the original or an approved clean baseline over successive generated results.
- When the requested edit permits it, preserve original pixels for complete label or logo regions instead of asking the model to redraw them.
- If label planes must be resynthesized, keep them sufficiently large and near front-facing, then apply `clean.single-edge-graphics`, `clean.graphic-neighborhood`, and `edit.protect-printed-region`.
- Combine compatible corrections into one narrowly scoped cumulative edit when possible.
- Do not use a failed or visibly degraded output as a new reference unless no cleaner source exists or the user explicitly selects it.
- Report degradation risk when only a prior generated result is available.
- If exact brand artwork is mandatory and an authoritative asset exists, report compositing that asset after generation as more reliable than model redrawing; do not create or substitute unsupplied artwork.
- Load only modifiers needed for the target visual result; do not load a second structure template.

## Verbatim source Prompt examples

### Example 1

- `entry_id`: `all-095`
- Source title: `产品营销 - 将展示架移至露台上`
- Native format: prose

<!-- SOURCE_PROMPT_START:all-095 -->
```text
使用提供的参考图像，保持相同的花园、池塘、树木、山坡和木质露台视角，但将装饰性标识装置重新定位，使其立在前景的木质露台上，而不是水中。将其放大并更显眼地置于镜头中心，同时保持逼真的户外透视、自然日光和一致的阴影。保持装置结构为 3 列 3 行共 9 个圆形标识面板，放置在细长的绿色支架上，顶部标题栏文字为“对着镜子笑一场”。使面板看起来更具反光感和镜面效果，呈现周围绿植的逼真倒影，同时保留圆形面板上的可爱表情图案和中文字符。最终效果应呈现为一张逼真的广告样机/合成照片，展示该装置在场景中正确放置的状态。
```
<!-- SOURCE_PROMPT_END:all-095 -->

### Example 2

- `entry_id`: `all-101`
- Source title: `电商主图 - 从蓝图生成摄影级产品渲染图`
- Native format: prose

<!-- SOURCE_PROMPT_START:all-101 -->
```text
使用提供的参考图像，将技术工程规格表转换为同一个水母形状厨房用具架的干净摄影级产品主图。保留整体产品设计、半透明蓝色圆顶盖、银色底座以及 4 件悬挂用具：1 个漏勺、1 个意面捞勺和 2 个汤勺。移除所有蓝图元素，包括爆炸图、尺寸线、标签、表格、注释和标题栏。仅展示居中对齐、正面朝向的组装成品，背景为极简浅灰色，置于白色平面上，采用柔和的漫射光，带有细腻逼真的阴影，并呈现出高级的光泽质感。使其看起来像是一张现代工业设计目录或电商产品摄影图。
```
<!-- SOURCE_PROMPT_END:all-101 -->

### Example 3

- `entry_id`: `all-118`
- Source title: `电商主图 - 药膳鸡汤标签设计转换`
- Native format: prose

<!-- SOURCE_PROMPT_START:all-118 -->
```text
以 REFERENCE_0 为基础风格，在保留中央鸡肉插图的同时，将图像转换为药膳汤包的产品包装标签。将鸡肉移至右侧。将顶部文字替换为醒目的大号黑色笔触标题 {argument name="main headline" default="元气祛湿 鸡煲汤包"} 以及较小的副标题 {argument name="subtitle" default="吃山林土货 味道当然好!"}。在左侧添加一个全新的编织篮，篮中包含 6 种不同的食材堆：木质根茎、白色方块、圆形棕色根茎切片、黄豆、陈皮条和深红色红枣。为这些食材贴上 6 个带有白色文字的棕色小长方形标签。在鸡肉下方，添加一个圆形的橙色徽章，内含文字 {argument name="ingredients list" default="内含有:五指毛桃、茯苓、土茯苓、黄豆、陈皮、红枣"}。在底部，创建一个纯橙色的长方形横幅，其中包含一个烹饪锅图标、文字 {argument name="usage instructions" default="用法:把汤料清洗干净放入锅中，加入姜片煮20分钟，后加入鸡肉再煮20分钟即可。"} 以及一条辅助标语 {argument name="bottom slogan" default="天然好料 滋补好汤"}。
```
<!-- SOURCE_PROMPT_END:all-118 -->

## Preflight checklist

- [ ] Every input image has an explicit role.
- [ ] Preserve, remove, replace, add, and allowed-change instructions do not conflict.
- [ ] The edit mode and cleanest available source are explicit.
- [ ] Artifact-cleanup targets are not accidentally preserved.
- [ ] Global transformations preserve only the anchors the user requires.
- [ ] Identity, packaging, geometry, and text anchors are complete.
- [ ] Required background, camera, and lighting invariants remain unchanged.
- [ ] The output can be compared against each input requirement.
- [ ] Any edit-plus-series request has been split into two stages.
- [ ] Repeated-edit degradation risk is disclosed instead of hidden.
