# Single-Frame Scene Template

## Purpose and use cases

Use for one finished frame centered on people, animals, products, objects, actions, or environments. This includes photography, illustration, anime scenes, and product hero images without a dominant copy layout.

## Routing boundaries

- Route to `commercial-copy-layout` when headline, CTA, badge, price, or marketing hierarchy controls the composition.
- Route to `nonsequential-collection-grid` when independent slots, products, or variants dominate.
- Route to `reference-image-edit` when an input image must be changed or preserved.
- Route to `multi-image-series` when the request requires separate output files.

## Required inputs

- Subject identity, count, and defining appearance.
- Action, pose, or object state.
- Environment, depth layers, and subject relationships.
- Framing, viewpoint, lens, or illustration perspective.
- Medium, lighting, color, material, and mood.
- Exact text, aspect ratio, size, and prohibitions.

## Default native format

Use prose by default. Describe the final result first, then the subject, scene, composition, lighting, and details. Use JSON only when many objects or relationships need independent validation.

## Prompt structure

```text
Create a <photographic or illustrated artifact> for <use case>.
Subject: <identity, count, appearance, and fixed traits>.
Action and relationships: <pose, action, object state, and interactions>.
Scene: <environment, foreground, midground, background, and props>.
Composition and viewpoint: <aspect ratio, framing, camera, lens, or illustration perspective>.
Visual treatment: <medium, lighting, color, material, and mood>.
Exact visible text: <verbatim text, or explicitly state no text>.
Output: <aspect ratio, size, and format>.
Do not include: <task-specific failure risks>.
```

## Field guidance

- Lock subject count and identity before adding stylistic modifiers.
- State each subject's position, action, and relationship in multi-subject scenes.
- Use camera terminology only when photographic control is relevant.
- Replace vague quality claims with observable lighting, material, and composition requirements.

## Writing guidance

- Start from the visible deliverable, not from model drawing steps.
- Add targeted checks for text, counts, hands, reflections, and edge cropping when relevant.
- Load only the relevant modifier dimensions for medium, camera, lighting, color, material, and composition.
- Never copy people, brands, scenes, or copy from a source example into an unrelated request.

## Verbatim source Prompt examples

### Example 1

- `entry_id`: `featured-005`
- Source title: `动漫武术对决`
- Native format: prose

<!-- SOURCE_PROMPT_START:featured-005 -->
```text
一幅极具动态感的动漫插画，描绘了两名少女在传统木质道场内进行激烈武术对决的场景。在前景中，一名留着 {argument name="character 1 hair" default="黑色高丸子头配红色丝带"} 的少女摆出强有力的低位武术架势，正奋力挥拳。她身穿 {argument name="character 1 outfit" default="带有红色流苏的白色中式上衣和红色宽松长裤"}，强烈的红色能量斩击环绕着她挥动的四肢。在右侧半空中，一名留着 {argument name="character 2 hair" default="浅紫色双丸子头"} 的少女优雅地跃起，自信地微笑着，身穿 {argument name="character 2 outfit" default="带有金色刺绣的深绿色连衣裙和黑色紧身裤"}，伴随着扫过的蓝色水流状能量轨迹。背景是质朴的木质寺庙内部，上方悬挂着一块写有“{argument name="sign text" default="武術会"}”的醒目招牌。场景充满了爆发性的动作感，飞扬的尘土、破碎的木质地板、发光的彩色粒子特效，以及将角色与精细背景完美区分开来的戏剧性低角度光影。
```
<!-- SOURCE_PROMPT_END:featured-005 -->

### Example 2

- `entry_id`: `all-012`
- Source title: `个人资料 / 头像 - 手持草莓冰淇淋的摄影棚肖像`
- Native format: prose

<!-- SOURCE_PROMPT_START:all-012 -->
```text
一张精致的摄影棚肖像，拍摄对象为一位极具明星气质的女性，半身像，居中构图，背景为平滑的中性灰色。她留着 {argument name="hair color" default="乌黑"} 的长发，发丝蓬松微卷，中分，光泽感强，柔和地垂落在双肩。她的面部大部分被举在嘴部和下颌前的冰淇淋甜筒遮挡，营造出一种俏皮的时尚编辑构图。她身穿白色罗纹背心，肩带较宽，佩戴着一颗显眼的闪亮耳钉。她手中拿着一个华夫甜筒，上面堆着一个巨大的粉色草莓冰淇淋球，带有深红色浆果纹理，呈现出轻微融化的质感。温暖且修饰肤色的美妆光效，柔和的阴影，写实的肤色，高端名人肖像摄影，对手部、甜筒、头发和肩部的对焦清晰，极简背景，氛围微妙而性感且时髦，竖构图。
```
<!-- SOURCE_PROMPT_END:all-012 -->

### Example 3

- `entry_id`: `all-119`
- Source title: `电商主图 - 机库中的跑车与客机`
- Native format: prose

<!-- SOURCE_PROMPT_START:all-119 -->
```text
一张写实的高分辨率商业摄影图片，前景是一辆 {argument name="car model and color" default="亮蓝色 Alpine A110 R 跑车"}，停在巨大的飞机库内。跑车配有黑色碳纤维引擎盖、黑色车顶、黑色合金轮毂，前车牌上写着 "{argument name="license plate text" default="A110 R"}"。在车后方，背景中是一架占据视觉中心的 {argument name="airplane model" default="白色空客 A320 商用客机"}，机尾为蓝色。机库地面为高度抛光的反光混凝土，映照出跑车和飞机的倒影。左侧金属墙上的标志写着 "{argument name="hangar sign text" default="HANGAR 05 MAINTENANCE"}"。机库大门敞开，露出明亮的阴天和远处的城市景观。光线柔和且具有电影质感，突显了两种交通工具流畅的空气动力学曲线。
```
<!-- SOURCE_PROMPT_END:all-119 -->

## Preflight checklist

- [ ] Subject count, identity, and action are explicit.
- [ ] Foreground, midground, and background relationships do not conflict.
- [ ] Required text, colors, and ratios remain verbatim.
- [ ] Lighting, material, and medium requirements are compatible.
- [ ] No copy-layout, UI, grid, or multi-output structure has been added accidentally.
- [ ] Negative constraints target realistic failure risks for this scene.
