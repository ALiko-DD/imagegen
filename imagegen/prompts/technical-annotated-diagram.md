# Technical Annotated Diagram Template

## Purpose and use cases

Use for exploded views, assembly diagrams, cutaway structures, and component diagrams with leader-line callouts. This family is provisional because the corpus contains only one unambiguous direct sample.

## Routing boundaries

- Component identity, hierarchy, relative position, assembly order, or callout ownership must be validated.
- Route to `infographic-chart-explainer` when the task only explains facts, processes, or time.
- Route to `nonsequential-collection-grid` when items are independent and have no structural relationship.
- Route to `reference-image-edit` when technical labels or geometry must be changed in an input image.

## Required inputs

- Technical subject and view.
- Complete component list and quantities.
- Component hierarchy, explosion axis, assembly, or spatial relationships.
- Target component and verbatim text for every callout.
- Canvas, title, units, ratio, and allowed simplification.

## Default native format

Use JSON by default. Components, callout mappings, and quantities must be explicit. Markdown is only the template documentation container.

## Prompt structure

```json
{
  "type": "technical annotated diagram",
  "subject": "<technical object>",
  "view": "<exploded, cutaway, or assembly view>",
  "components": [
    {
      "id": "<unique component id>",
      "name": "<verbatim name>",
      "quantity": 1,
      "relative_position": "<relative position>",
      "relationship": "<assembly or hierarchy relationship>"
    }
  ],
  "callouts": [
    {
      "target_component_id": "<component id>",
      "text": "<verbatim callout>",
      "side": "<left, right, or named region>"
    }
  ],
  "visual_system": {
    "rendering": "<rendering method>",
    "background": "<background>",
    "lighting": "<lighting>"
  },
  "output": {
    "aspect_ratio": "<ratio>",
    "size": "<size or auto>"
  },
  "negative_constraints": [
    "<forbidden structural error>"
  ]
}
```

## Field guidance

- Give every component a unique ID and keep its name, quantity, and visible object aligned.
- Use `relationship` for connection, enclosure, front/back, above/below, or disassembly order, not for visual style.
- Make every callout reference an existing component ID.
- When technical reality is unknown, request source data instead of inventing internal structures.

## Writing guidance

- Define structure and relationships before materials, lighting, or promotional copy.
- Separate what must be technically exact from what may be artistically simplified.
- Check for duplicate component names and inconsistent quantities.
- Load only relevant `material-texture`, `lighting-shadow`, and `quality-technical-control` modifiers.

## Verbatim source Prompt examples

Only one direct sample is available. Use it to understand the native structure, never as a ready-to-send Prompt for a new request.

### Example 1

- `entry_id`: `featured-001`
- Source title: `VR 头显爆炸视图海报`
- Native format: JSON

<!-- SOURCE_PROMPT_START:featured-001 -->
```json
{
  "type": "产品爆炸视图海报",
  "subject": "VR 头显",
  "style": "简洁的高科技 3D 渲染，摄影棚灯光，发光装饰",
  "background": "{argument name=\"background color\" default=\"柔和的紫蓝色渐变\"}",
  "header": {
    "logo": "∞ {argument name=\"product name\" default=\"Meta Quest 3\"}",
    "subtitle": "{argument name=\"main catchphrase\" default=\"以全新的结构，重塑全新的现实。\"}"
  },
  "layout": {
    "centerpiece": "VR 头显的垂直堆叠爆炸视图，展示了 9 层不同的内部组件：外壳、摄像头传感器、带芯片的主板、Pancake 透镜、内部框架、电池组、侧带、顶部头带和面部接口衬垫。",
    "callout_labels": {
      "count": 8,
      "left_side": [
        "Snapdragon® XR2 Gen 2\n卓越的处理性能，带来实时沉浸体验。",
        "可调节 IPD 机构\n为广大用户提供舒适的佩戴感。",
        "精密设计的头带\n追求舒适与稳定的工程学设计。"
      ],
      "right_side": [
        "前面板\n精致的设计与优化的重量平衡。",
        "追踪摄像头\n实现高精度的位置追踪与环境感知。",
        "Pancake 透镜\n轻薄设计，提供广阔视野与清晰画质。",
        "高性能电池\n优化电源设计，支持长时间续航。",
        "柔软的面部接口\n确保长时间佩戴依然舒适。"
      ]
    },
    "footer": {
      "left_text_block": {
        "headline": "{argument name=\"bottom headline\" default=\"体验，源于结构的进化。\"}",
        "body": "每一个零件都蕴含着支撑沉浸式体验的前沿科技与匠心设计。Meta Quest 3 从内部构建未来，为您带来超乎想象的体验。"
      },
      "right_logo": "∞ Meta"
    }
  }
}
```
<!-- SOURCE_PROMPT_END:featured-001 -->

## Preflight checklist

- [ ] Component quantities agree with the component list.
- [ ] Every leader line points to the correct component.
- [ ] Explosion axis, hierarchy, and assembly relationships do not conflict.
- [ ] No unsupported internal structure or parameter has been invented.
- [ ] Units, titles, and product names remain verbatim.
- [ ] Components and callouts will not be clipped by the canvas.
