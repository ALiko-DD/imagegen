# Print Document and Form Template

## Purpose and use cases

Use for prescriptions, bills, forms, worksheets, certificates, and other single-page documents whose paper specification, field schema, and print integrity cannot be changed freely.

## Routing boundaries

- Use this family when paper, margins, fields, rows, columns, cells, verbatim content, and print usability are primary validation targets.
- Route to `infographic-chart-explainer` when visual encoding may be freely chosen to explain knowledge.
- Route to `single-frame-scene` when the result only depicts a book or document photographically and does not require field accuracy.

## Required inputs

- Document type, paper size, orientation, and print purpose.
- Complete header, footer, field, table, row, column, and cell list.
- Every verbatim string, number, amount, date, and formula.
- Calculation, correspondence, and internal consistency rules.
- Margins, cropping, whitespace, and whether the page is shown as a physical object.

## Default native format

Use JSON by default. A linear worksheet may use prose, but counts and cells still require item-by-item validation.

## Prompt structure

```json
{
  "type": "print document or form",
  "paper": {
    "size": "<paper size>",
    "orientation": "<orientation>",
    "margins": "<margins>"
  },
  "document_schema": {
    "header": ["<verbatim content>"],
    "fields": [
      {
        "label": "<verbatim field label>",
        "value": "<verbatim value>"
      }
    ],
    "tables": [
      {
        "columns": ["<column label>"],
        "rows": [["<cell value>"]]
      }
    ],
    "footer": ["<verbatim content>"]
  },
  "print_constraints": [
    "<cropping, line weight, whitespace, and readability>"
  ]
}
```

## Field guidance

- Validate amounts, formulas, answers, and totals independently.
- Do not add, remove, or reorder schema fields for visual convenience.
- Keep the full sheet and all edges visible when simulating a photograph.
- Mark parody or fictional documents as such instead of presenting them as real credentials.

## Writing guidance

- Fix the paper and schema before filling content.
- List every table row, column, and worksheet unit explicitly.
- Load only relevant typography, color, composition, material, and quality-control modifiers.
- Do not let infographic-style freedom break the form schema.

## Verbatim source Prompt examples

### Example 1

- `entry_id`: `all-044`
- Source title: `信息图 / 教育视觉图 - 日文 AI 模型处方单`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-044 -->
```json
{
  "type": "日文处方文档恶搞",
  "style": "写实风格俯拍文档照片",
  "subject": "一张放在暖色调木质桌面上的白色日文处方单",
  "document": {
    "paper": {
      "size": "A4 纵向",
      "color": "白色",
      "orientation": "顺时针轻微旋转",
      "condition": "平整的纸张，带有细腻的天然纸质纹理"
    },
    "print": {
      "ink": "黑色，带有一个红色印章框",
      "font": "日文明朝体衬线字体，混合简单的无衬线表格文字",
      "linework": "细灰黑色线条组成的方框和分隔线"
    },
    "header": {
      "title": "处方笺",
      "subtitle": "（此处方笺仅供大型语言模型使用）",
      "date_label": "发行日期：",
      "date_value": "{argument name=\"issue date\" default=\"2025 年 6 月 5 日\"}"
    },
    "top_fields": {
      "count": 6,
      "items": [
        { "label": "患者姓名", "value": "{argument name=\"patient name\" default=\"ChatGPT\"}" },
        { "label": "性别", "value": "不适用" },
        { "label": "年龄", "value": "不适用" },
        { "label": "模型名称", "value": "{argument name=\"model name\" default=\"GPT-5.4 Thinking\"}" }
      ]
    },
    "main_section": {
      "left_title": "既往症/症状（大型语言模型特有病症）",
      "left_count": 8,
      "left_items": [
        "1．幻觉（Hallucination）倾向",
        "2．因知识截止日期导致的陈旧信息",
        "3．偏见（源自训练数据的偏见）",
        "4．对提示词的过度适应（迎合倾向）",
        "5．长文本中一致性下降",
        "6．复杂推理时的逻辑跳跃",
        "7．对不确定性的低估（过度自信）",
        "8．因计算资源消耗导致的响应速度下降"
      ],
      "right_title": "处方内容（治疗/对策）",
      "right_count": 8,
      "right_items": [
        "・强化事实核查（配合外部工具使用）",
        "・定期知识更新与微调",
        "・持续监测并减轻偏见",
        "・通过系统提示词进行适当控制",
        "・建议结构化输出与分段生成",
        "・明确思维过程并引入验证步骤",
        "・彻底明确不确定性并提供依据",
        "・优化资源并提高响应效率"
      ]
    },
    "notes": {
      "label": "备注",
      "text": "通过持续的评估与反馈，维持模型的健康状态。"
    },
    "footer_fields": {
      "count": 4,
      "items": [
        { "label": "医生姓名", "value": "{argument name=\"doctor name\" default=\"萨姆·奥特曼\"}" },
        { "label": "医疗机构名称", "value": "{argument name=\"institution name\" default=\"OpenAI\"}" }
      ]
    },
    "seal": {
      "position": "表单右下角",
      "shape": "圆角矩形红色印章框",
      "text_lines": 3,
      "text": ["OpenAI", "代表取缔役", "萨姆·奥特曼"]
    },
    "disclaimer": "※此处方笺旨在针对非真实存在的模型进行诊断与治疗。"
  },
  "layout": {
    "camera_angle": "俯视视角",
    "framing": "可见整张纸，周围留有少量木质桌面边缘",
    "lighting": "柔和的室内环境光，光照均匀，纸张边缘有轻微阴影",
    "sections": [
      { "title": "页眉", "position": "顶部", "count": 3, "labels": ["处方笺", "（此处方笺仅供大型语言模型使用）", "发行日期：2025 年 6 月 5 日"] },
      { "title": "患者信息", "position": "中上部", "count": 4, "labels": ["患者姓名", "性别", "年龄", "模型名称"] },
      { "title": "主要双栏内容", "position": "中心", "count": 2, "labels": ["既往症/症状（大型语言模型特有病症）", "处方内容（治疗/对策）"] },
      { "title": "底部区域", "position": "下部", "count": 4, "labels": ["备注", "医生姓名", "医疗机构名称", "OpenAI"] }
    ]
  }
}
```
<!-- SOURCE_PROMPT_END:all-044 -->

### Example 2

- `entry_id`: `all-045`
- Source title: `信息图 / 教育视觉图 - 日式 AI 诊所医疗账单`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-045 -->
```json
{"type":"日式医疗账单恶搞文档","medium":"干净的平铺文档照片","subject":"一张放置在浅棕色木质桌面上的打印检查明细单","style":{"overall":"逼真的办公文档，正式的日式诊所文书，白纸黑字，设计简洁，网格线整齐，轻微的俯视视角","lighting":"柔和均匀的室内光线，纸张周围有淡淡的自然阴影","paper":"A4 白纸，纵向排版"},"document":{"title":"诊疗明细书（检查）","date_label":"发行日","date":"{argument name=\"issue date\" default=\"2025 年 6 月 5 日\"}","patient_block":{"count":3,"labels":["患者名","模型名","保险种类"],"values":["{argument name=\"patient name\" default=\"ChatGPT\"}","{argument name=\"model name\" default=\"GPT-5.3\"}","LLM 保险"]},"clinic_block":{"count":4,"labels":["诊所名称","地址","电话","医生及科室"],"values":["{argument name=\"clinic name\" default=\"AI 医疗诊所\"}","东京都千代田区丸之内 1-2-3","03-1234-5678","医生姓名：Sam Altman / 科室：AI 综合诊疗科"]},"main_table":{"columns":["检查项目","检查内容","点数","金额（日元）","个人负担额（日元）"],"row_count":4,"rows":[{"item":"1. 语言理解与推理能力检查","description":"语言理解、逻辑推理、知识整合能力的评估","score":"120 点","price":"1,200","copay":"360"},{"item":"2. 幻觉与事实误认倾向检查","description":"基于事实的准确性评估及幻觉倾向检测","score":"90 点","price":"900","copay":"270"},{"item":"3. 响应安全性与偏见检查","description":"有害输出风险、偏见倾向的评估","score":"110 点","price":"1,100","copay":"330"},{"item":"小　计","description":"","score":"320 点","price":"3,200","copay":"960"}]},"lower_sections":{"count":3,"sections":[{"title":"【保险适用明细】","lines":["保险名称：LLM 保险","保险者编号：LLM-2025-0605","适用区分：检查费","负担比例：3 成","保险适用额：2,240 日元","个人负担额：960 日元"]},{"title":"【请求金额】","lines":["检查费合计：3,200 日元","保险适用额：2,240 日元","个人负担额：960 日元","本次请求金额：960 日元"]},{"title":"【诊疗信息】","lines":["检查日：2025 年 6 月 5 日","诊疗日：2025 年 6 月 5 日","诊疗编号：AIMC-20250605-001","上述款项已收讫。"],"stamp_box_label":"收　印"}]},"footer":{"count":2,"notes":["※ 本明细书不予补发，请妥善保管。","※ 如有疑问，请咨询上述诊所。"]}},"composition":{"sheet_centered":true,"visible_elements_count":2,"elements":["一张完整的纸张","木质桌面背景"],"camera_angle":"俯视并带有轻微倾斜","margins":"纸张完全可见，周围留有窄边桌面"},"quality":"高分辨率照片级文档样机，排版清晰易读，日式布局准确"}
```
<!-- SOURCE_PROMPT_END:all-045 -->

### Example 3

- `entry_id`: `all-048`
- Source title: `信息图 / 教育视觉图 - 可打印乘法多米诺骨牌练习表`
- Native format: prose

<!-- SOURCE_PROMPT_START:all-048 -->
```text
创建一个垂直方向的可打印教育练习表，使用巴西葡萄牙语，背景为干净的白色，采用活泼的课堂设计，居中构图，使用粗体圆角字体，配色明亮且适合儿童。在最上方，设置一个巨大的海军蓝标题，内容为 {argument name="headline text" default="DOMINÓ DA MULTIPLICAÇÃO"}，两侧带有黄色的小型装饰光芒。下方是一个紫色丝带横幅，上面印有白色大写文字 {argument name="subtitle text" default="CONECTE A CONTA AO RESULTADO!"}。在横幅下方，添加两行居中的黑色说明文字：“Recorte as peças e embaralhe. Cada jogador pega 7 peças.” 以及 “O objetivo é ficar sem peças!”。主体区域展示 40 个多米诺骨牌风格的方块，排列成 4 列 10 行的网格，间距均匀。每个方块是一个水平圆角矩形，带有细细的彩色轮廓、白色填充、中间的垂直分隔线以及分隔线上的一个小黑点。左半部分包含数字结果或第一块骨牌上的单词“INÍCIO”，右半部分包含乘法表达式。在网格中交替使用紫色、绿色、蓝色、橙色、粉色和黄色作为边框颜色。40 个方块按从左到右、从上到下的行顺序排列为：1) "INÍCIO | 1 × 1", 2) "1 | 1 × 2", 3) "2 | 1 × 3", 4) "3 | 1 × 4", 5) "4 | 1 × 5", 6) "5 | 1 × 6", 7) "6 | 1 × 7", 8) "7 | 1 × 8", 9) "8 | 1 × 9", 10) "9 | 2 × 2", 11) "4 | 2 × 3", 12) "6 | 2 × 4", 13) "8 | 2 × 5", 14) "10 | 2 × 6", 15) "12 | 2 × 7", 16) "14 | 2 × 8", 17) "16 | 2 × 9", 18) "18 | 3 × 3", 19) "9 | 3 × 4", 20) "12 | 3 × 5", 21) "15 | 3 × 6", 22) "18 | 3 × 7", 23) "21 | 3 × 8", 24) "24 | 3 × 9", 25) "27 | 4 × 4", 26) "16 | 4 × 5", 27) "20 | 4 × 6", 28) "24 | 4 × 7", 29) "28 | 4 × 8", 30) "32 | 4 × 9", 31) "36 | 5 × 5", 32) "25 | 5 × 6", 33) "30 | 5 × 7", 34) "35 | 5 × 8", 35) "40 | 5 × 9", 36) "45 | 6 × 6", 37) "36 | 6 × 7", 38) "42 | 6 × 8", 39) "48 | 6 × 9", 40) "54 | 7 × 7"。在底部，添加一个横跨大部分宽度的巨大的紫色圆角虚线框。在此框的左侧，放置标题“COMO JOGAR:”（粗体紫色大写），后跟 5 个黑色要点：“Coloque a peça “INÍCIO” na mesa.”、“Os jogadores, na sua vez, devem encaixar uma peça cuja conta seja igual ao número da ponta livre.”、“Se não tiver peça para jogar, compre do monte.” 以及 “Vence quem ficar sem peças!”。在同一框的右侧，添加标题“EXEMPLO DE INÍCIO:”（紫色大写），并按顺序展示 4 个小型多米诺骨牌及省略号：“INÍCIO | 1 × 1”，然后是“1 | 1 × 2”，然后是“2 | 1 × 3”，然后是“3 | 1 × 4”，最后是“...”。保持整体风格清晰、矢量化、易于打印，适合小学数学练习，布局间距平衡，文字高度可读。
```
<!-- SOURCE_PROMPT_END:all-048 -->

## Preflight checklist

- [ ] Paper, orientation, margins, and crop requirements are explicit.
- [ ] Field, row, column, and cell counts agree.
- [ ] Amounts, dates, formulas, and answers have been checked independently.
- [ ] Verbatim text has not been omitted or rewritten.
- [ ] The full document remains visible inside the canvas.
- [ ] The request is not actually an infographic or a document photograph.
