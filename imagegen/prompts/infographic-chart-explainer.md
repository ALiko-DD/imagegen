# Infographic, Chart, and Explainer Template

## Purpose and use cases

Use for data graphics, comparison charts, timelines, process explainers, educational posters, recipe explainers, and other single-page visuals whose primary contract is factual relationship and visual encoding.

## Routing boundaries

- Use this family when facts, values, nodes, order, legends, and visual encoding are the main validation targets.
- Route to `technical-annotated-diagram` when assembly, callouts, and geometric relationships dominate.
- Route to `print-document-form` when paper schema, fields, cells, and print integrity cannot change.
- Route to `map-spatial-guide` when geographic topology and routes dominate.

## Required inputs

- Topic, audience, and information goal.
- Confirmed facts, data, steps, nodes, or comparison items.
- Reading order, visual encoding, labels, and legend.
- Section count, section content, and text-to-visual mapping.
- Any uncertain or unsourced values.
- Canvas, exact text, style, and prohibitions.

## Default native format

Use JSON by default. Represent information arrays, relationships, and counts explicitly. A simple timeline may use prose.

## Prompt structure

```json
{
  "type": "infographic chart or explainer",
  "topic": "<topic>",
  "audience": "<audience>",
  "canvas": {
    "aspect_ratio": "<ratio>",
    "reading_flow": "<reading order>"
  },
  "sections": [
    {
      "id": "<section id>",
      "title": "<verbatim title>",
      "facts": ["<confirmed fact>"],
      "visual": "<diagram or chart>",
      "labels": ["<verbatim label>"]
    }
  ],
  "visual_encoding": [
    {
      "value_or_relation": "<value or relationship>",
      "representation": "<color, position, line, or shape>"
    }
  ],
  "legend": ["<legend mapping>"],
  "negative_constraints": ["<forbidden factual or relational error>"]
}
```

## Field guidance

- Do not invent facts, numbers, formulas, or rankings.
- Keep the same value consistent in body copy, charts, and legends.
- Make declared counts agree with section, object, and label arrays.
- Never let a stylistic choice change a factual relationship.

## Writing guidance

- Verify facts before designing the reading flow.
- Map each value and label to a specific graphic representation.
- Load only relevant color, typography, composition, medium, and negative-constraint modifiers.
- Prefer JSON for long timelines, comparison tables, and dense educational explainers.

## Verbatim source Prompt examples

### Example 1

- `entry_id`: `all-036`
- Source title: `信息图 / 教育视觉图 - 中国书法风格对比表`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-036 -->
```json
{"type":"中国书法对比表","subject":"以五种不同历史书法风格书写的同一五字短语","phrase":"{argument name=\"calligraphy text\" default=\"视觉新时代\"}","canvas":{"orientation":"垂直海报","background":"带有细微纤维、轻微陈旧感及柔和不均匀色调的暖白色宣纸纹理"},"layout":{"structure":"由淡薄分割线隔开的 5 行水平排列","row count":5,"left labels count":5,"seal count":5,"left labels":["王羲之","宋徽宗","赵孟頫","颜真卿","苏轼"],"rows":[{"position":"第一行","style":"受王羲之启发的行书","main text":"视觉新时代","label":"王羲之","seal":"最右侧的小红方印"},{"position":"第二行","style":"受宋徽宗瘦金体启发，笔画尖锐刚劲、间架开阔的优雅书法","main text":"视觉新时代","label":"宋徽宗","seal":"最右侧的小红方印"},{"position":"第三行","style":"受赵孟頫启发的精炼行楷","main text":"视觉新时代","label":"赵孟頫","seal":"最右侧的小红方印"},{"position":"第四行","style":"受颜真卿启发的雄浑厚重楷书","main text":"视觉新时代","label":"颜真卿","seal":"最右侧的小红方印"},{"position":"第五行","style":"受苏轼启发的奔放劲健行书","main text":"视觉新时代","label":"苏轼","seal":"最右侧的小红方印"}],"left label design":"每一行最左侧均配有一个垂直的米色窄名牌，上面印有黑色中文字符","centerpiece":"每一行居中书写的大号黑色毛笔字短语"},"style":{"ink":"深黑色墨汁，呈现出明显的枯笔纹理、飞白、力度变化及自然的笔锋收尾","mood":"学术性、实验性、博物馆展品式呈现","composition":"干净宽敞的留白、平衡的行间距、平整的正面扫描或文档摄影"},"quality":{"detail":"高分辨率、清晰的笔触纹理、逼真的纸张颗粒感","lighting":"柔和均匀的摄影棚灯光，无强烈阴影"}}
```
<!-- SOURCE_PROMPT_END:all-036 -->

### Example 2

- `entry_id`: `all-041`
- Source title: `信息图 / 教育视觉图 - 适合青少年的黑洞物理学信息图`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-041 -->
```json
{"type":"编辑类科学信息图海报","style":"面向青少年的友好型杂志风格科普信息图，结合手绘物理图解、卡通角色和简洁的编辑排版","topic":"原初黑洞、霍金辐射与记忆负担暗物质","canvas":{"orientation":"纵向","background":"暖色调奶油纸纹理，带有细微颗粒感","border":"页面四周带有纤细的柔和灰色矩形边框"},"headline":{"title":"拒绝消亡的黑洞","subtitle":"一个诞生于宇宙最初一秒的微小黑洞，以及可能让它伪装成暗物质的奇特新物理学。","credit":"Thoss, Lopez-Honorez, Kühnel & Hufnagel"},"layout":{"sections":[{"title":"闪电般的诞生","position":"左上","count":4,"labels":["早期宇宙旋转诞生示意图","比盐粒还小但比山还重的原初黑洞","大爆炸后 10^-30 秒的时钟图标","温度计图标"]},{"title":"普通黑洞的蒸发","position":"右上","count":4,"labels":["从左至右三个黑洞缩小阶段","每个阶段周围的粒子外溢波浪线","斯蒂芬·霍金的解释段落","贴纸引言：\"黑洞并非那么黑\" — S. Hawking, 1974"]},{"title":"情节反转：记忆负担","position":"中中","count":4,"labels":["背着标有 MEMORY 背包的悲伤超载卡通黑洞","关于因信息过载而无法完成蒸发的对话气泡","公式：正常速度 ÷ (大量信息)^k = 爬行速度","关于 Gia Dvali 2018 年提议的括号注释"]},{"title":"两种幽灵粒子","position":"中下","count":5,"labels":["左侧快速移动的粒子","右侧缓慢温暖的粒子角色","从大爆炸到今天的演化时间轴","快速且寒冷云朵标签","缓慢且温暖云朵标签"]},{"title":"我们如何捕捉它们：莱曼-α 森林","position":"左下","count":4,"labels":["关于古老星系穿过氢云的段落","尖刺状的吸收森林景观图","手写注释：森林告诉我们：我们会发现的。","从我们到遥远类星体的轴线概念"]},{"title":"这篇论文说明了什么？","position":"右下","count":1,"labels":["圆角矩形总结框"]}],"count":6},"visuals":{"color_palette":["暖米色","深海军蓝","铁锈橙","灰青色","柔棕色","柔和灰"],"illustration_notes":"扁平矢量形状，带有略显粗糙的轮廓、柔和阴影、圆润形态，既俏皮又具备科学严谨性","typography":"标题使用大号衬线全大写字母，章节标题使用粗体无衬线字体，正文紧凑易读，偶尔点缀手写体文字"},"objects":{"count":15,"items":["1 个全页边框","1 个标题块","1 个早期宇宙旋转图","1 个带有标注的微小原初黑洞点","1 个时钟图标","1 个温度计图标","3 个黑洞蒸发图解","1 个霍金引言贴纸徽章","1 个背着背包的卡通黑洞角色","1 个对话气泡","1 个公式块","2 个云朵标签","1 个左下角光谱森林插图"]},"text_blocks":{"count":9,"items":["标题","副标题","作者署名","闪电般的诞生正文","普通黑洞蒸发正文","记忆负担解释段落","幽灵粒子说明文字","莱曼-α 森林解释","最终结论总结"]},"composition":"布局紧凑但易读的单页说明图，包含多个插图标注，具有清晰的从左至右、从上至下的阅读流向，设计旨在成为可分享的社交媒体科学海报，让青少年也能轻松理解深奥的物理学论文"}
```
<!-- SOURCE_PROMPT_END:all-041 -->

### Example 3

- `entry_id`: `all-049`
- Source title: `信息图 / 教育视觉图 - 历史发明时间轴网格`
- Native format: prose

<!-- SOURCE_PROMPT_START:all-049 -->
```text
创建一个方形信息图风格的插图，展示一个 {argument name="grid size" default="15×15"} 的发明时间轴网格，渲染为陈旧羊皮纸砖块上的微型等轴测立体模型集合。图像应看起来像一张精心策划的历史海报，跨度从 {argument name="starting year" default="公元前 1000 年"} 到 {argument name="ending year" default="2026 年"}，每个砖块展示一项发明，且不重复。显示较大网格中 5 乘 5 的可见部分，总共 25 个带有标签的砖块，排列整齐，行与列之间有细深色边框。每个砖块都包含一项改变世界的独特发明，描绘成带有时代特征的材料、颜色和背景细节的小型手工立体模型。古代和中世纪发明使用温暖的古董色调，早期现代发明使用棕褐色技术文档色调，现代数字和生物技术发明使用冷色调的霓虹蓝灯光。网格周围环绕着旧地图边框和微妙的历史制图纹理，右下角逐渐融入淡淡的现代网络图形。

用醒目的黑色粗体文字为每个可见砖块贴上米色小标签。按从左上到右下的阅读顺序，包含以下 25 项可见发明：1) {argument name="first tile label" default="公元前 1000 年"} 砖块，展示农田里的铁犁和简易手工工具，标签为“铁犁与工具”；2) “零的概念”，展示为带有雕刻零符号和蓝色沙漏的羊皮纸风格砖块；3) “水钟”，展示为木制计时装置；4) “投石机”，展示为木制攻城器械；5) “安提基特拉机械”，展示为石龛中复杂的青铜齿轮装置；6) “混凝土”，展示为装满湿水泥或砂浆的手推车；7) “独轮车”，展示为简单的木制单轮车；8) “风车”，展示为草地上的传统磨坊；9) “火药”，展示为木桶和一堆带有烟雾的黑色粉末；10) “印刷机”，展示为古典圆柱框架下的木制印刷机；11) “机械钟”，展示为华丽的立式钟；12) “望远镜”，展示为三脚架上的早期黄铜望远镜，配有素描风格的科学笔记；13) “蒸汽机”，展示在蓝色蓝图风格的砖块上，带有早期火车头引擎；14) “电池”，展示在蓝图风格的砖块上，带有两个圆柱形电池单元和线路；15) “电报”，展示为技术纸张上的莫尔斯电报键；16) “灯泡”，展示在中性底座上发出温暖的光；17) “汽车”，展示为车间规划背景下的早期红色汽车；18) “飞机”，展示为微型商用喷气式飞机；19) “晶体管”，展示为发光项目砖块上的黑色微芯片；20) “个人电脑”，展示为带有 CRT 显示器和键盘的米色台式电脑；21) “万维网”，展示为数字电路之上发光的蓝色地球仪；22) “智能手机”，展示为霓虹科技背景下时尚的现代手机；23) “CRISPR-Cas9”，展示为生物科技蓝色显示砖块中的 DNA 双螺旋结构；24) “可重复使用火箭”，展示为几枚竖立发射并带有尾气的火箭；25) “AI (LLMs)”，展示为全息科技立方体中发光的巨大字母 AI；26) “脑机接口”，展示为蓝色平台上的发光大脑全息图；27) “高级神经接口 (植入物)”，展示为带有发光大脑植入物的透明人头侧影，顶部带有小标签“2026 年”。

保持构图高度组织化、海报感强且视觉密集，每个砖块一目了然。使用轻微的等轴测透视、清晰的线条、绘画般的阴影和精致的编辑插图质量。整体感觉应结合博物馆海报、教育时间轴和富有想象力的历史科技立体模型艺术。
```
<!-- SOURCE_PROMPT_END:all-049 -->

## Preflight checklist

- [ ] Facts, data, order, and legends agree.
- [ ] Section, object, and label counts are independently checkable.
- [ ] Source conflicts are resolved before execution rather than silently preserved.
- [ ] Reading flow is clear at the target ratio.
- [ ] The request is not actually a technical diagram, map, or print document.
- [ ] No unsupported facts or rankings have been invented.
