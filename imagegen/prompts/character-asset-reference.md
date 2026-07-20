# Character and Asset Reference Template

## Purpose and use cases

Use for turnarounds, view sets, expression sheets, pose sheets, costume specifications, and production reference boards for a character or reusable asset.

## Routing boundaries

- Identity, proportions, clothing, and materials must remain consistent across views.
- Route to `nonsequential-collection-grid` when slots are independent subjects without a shared identity anchor.
- Route to `sequential-comic-storyboard` when story beats, dialogue, and reading order matter.
- Route to `reference-image-edit` when an input image is the required identity or product reference.

## Required inputs

- Character or asset identity anchors.
- Body proportions, silhouette, clothing, materials, and fixed traits.
- Required views, expressions, poses, and detail close-ups.
- View arrangement, labels, and background.
- Allowed variation and prohibited drift.

## Default native format

Use structured prose by default. Use a JSON array when many views require independent validation, but do not force a simple reference sheet into a complex schema.

## Prompt structure

```text
Create a production reference sheet for <character or asset>.
Identity anchors: <proportions, silhouette, face, clothing, materials, and signature details>.
Required views: <front, side, back, three-quarter, and any other required views>.
Expressions and poses: <complete list>.
Detail close-ups: <weapons, accessories, textures, or construction>.
Layout and labels: <grid, reading order, and verbatim labels>.
Consistency requirements: <traits that must remain identical in every slot>.
Output and prohibitions: <ratio, format, and drift risks>.
```

## Field guidance

- Define identity anchors before listing views.
- List views, expressions, and poses separately instead of grouping them as “variations.”
- Keep color, proportions, clothing layers, and accessory counts constant for one identity.
- Do not infer missing views or fields from an example image or a short source Prompt.

## Writing guidance

- State invariants first and per-slot differences second.
- Use labels to identify views; do not fill a production sheet with unrelated promotional slogans.
- Load only relevant medium, color, material, composition, and quality-control modifiers.
- Treat short source examples as evidence of a task type, not as evidence for facts they do not contain.

## Verbatim source Prompt examples

### Example 1

- `entry_id`: `all-072`
- Source title: `漫画 / 故事板 - 优雅动漫女剑士 4 格设定图`
- Native format: prose

<!-- SOURCE_PROMPT_START:all-072 -->
```text
一张精致的动漫奇幻插画设定图，采用 2x2 网格布局，展示了同一位优雅女剑士的 4 个画面。角色为一位年轻女性，拥有一头极长的铂金白发，扎成高马尾并系有深海军蓝色的巨大蝴蝶结，发丝柔软卷曲且飘逸，皮肤白皙，五官精致细腻，双眸呈现明亮的红粉色。她身着华丽的白蓝配色哥特贵族裙装：带有蕾丝花边和金色刺绣的白色高领荷叶边衬衫，胸前饰有镶嵌红色宝石胸针的巨大海军蓝蝴蝶结，泡泡袖配有丝带袖口，深海军蓝色束腰紧身胸衣带有金色细节，蓬松的海军蓝色裙摆装饰着金色花纹、层叠的荷叶边，并带有缎面光泽。她携带一把带有深色剑柄和金色装饰的武士刀。第 1 格为胸部以上的特写肖像，身体微侧，在深色闪烁的夜空背景下，头发呈现出戏剧性的轮廓光。第 2 格为动态的上半身动作镜头，角色正横向拔剑或展示剑身，头发随风狂舞，背景为电影感的城市夜景虚化效果，周围环绕着发光的花瓣。第 3 格为全身时尚肖像，她优雅地站在高耸发光建筑环绕的明亮反光大厅中，展示了裙装的完整轮廓、带蝴蝶结的高跟鞋以及身侧的佩剑。第 4 格为日落或黎明时分在波光粼粼的海边拍摄的四分之三背影，角色回眸，背景是温暖的柔和色调天空和闪烁的水面，樱花花瓣随风飘落。采用超精细动漫渲染，轻小说封面级画质，细腻的织物纹理，光泽高光，金色装饰，柔和光晕，戏剧性背光，漂浮花瓣，闪烁粒子，优雅浪漫的氛围，以及海军蓝、白、金、淡粉色的和谐配色。
```
<!-- SOURCE_PROMPT_END:all-072 -->

### Example 2

- `entry_id`: `all-076`
- Source title: `漫画 / 故事板 - 角色设计参考表`
- Native format: prose

<!-- SOURCE_PROMPT_START:all-076 -->
```text
为 {argument name="character" default="Hermes Agent"} 创建一份角色设计表，并包含关键信息
```
<!-- SOURCE_PROMPT_END:all-076 -->

### Example 3

- `entry_id`: `all-080`
- Source title: `漫画 / 故事板 - Velvedia 角色参考图提示词`
- Native format: JSON-like

<!-- SOURCE_PROMPT_START:all-080 -->
```text
{argument name="character name" default="Velvedia"} 参考图
```
<!-- SOURCE_PROMPT_END:all-080 -->

## Preflight checklist

- [ ] Every view belongs to the same identity.
- [ ] Clothing, color, material, and accessory counts remain consistent.
- [ ] View, pose, expression, and detail counts agree with their lists.
- [ ] No story beats or unrelated independent subjects have been added.
- [ ] Short source examples have not been expanded into invented facts.
- [ ] Labels and canvas edges remain readable.
