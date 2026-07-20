# Map and Spatial Guide Template

## Purpose and use cases

Use for city maps, route maps, campus guides, spatial zoning, and location diagrams with legends. This family is provisional because the corpus contains only one complete direct sample.

## Routing boundaries

- Geographic topology, routes, landmarks, points, and legend mappings are hard constraints.
- Route to `infographic-chart-explainer` when only temporal, process, or knowledge-node relationships matter.
- Route to `nonsequential-collection-grid` for independent place cards or collections without spatial positions.

## Required inputs

- Geographic or spatial scope.
- Roads, waterways, regions, and directional relationships.
- Complete landmark, route, or point-of-interest list.
- Number, label, icon, and legend mappings.
- Orientation, scale, and whether schematic distortion or simplification is allowed.

## Default native format

Use JSON by default to store points, routes, labels, and legends. Decorative style must never replace spatial relationships.

## Prompt structure

```json
{
  "type": "map or spatial guide",
  "scope": "<city, campus, or interior>",
  "orientation": "<north-up or specified direction>",
  "base_map": {
    "regions": ["<region>"],
    "roads": ["<road>"],
    "waterways": ["<waterway>"]
  },
  "points_of_interest": [
    {
      "id": 1,
      "name": "<verbatim place name>",
      "position": "<relative position>",
      "icon": "<icon>"
    }
  ],
  "routes": [
    {
      "from": "<origin id>",
      "to": "<destination id>",
      "style": "<route treatment>"
    }
  ],
  "legend": [
    {
      "symbol": "<symbol>",
      "meaning": "<verbatim meaning>"
    }
  ],
  "output": {
    "aspect_ratio": "<ratio>",
    "size": "<size or auto>"
  }
}
```

## Field guidance

- Give every place a unique ID and keep the ID, name, icon, and map position aligned.
- Make every route reference declared points or regions.
- Include only symbols that actually appear in the image in `legend`.
- When real geography is unknown, label the result schematic or request source data.

## Writing guidance

- Define the spatial skeleton before landmarks and decoration.
- Distinguish real maps, schematic routes, and artistic guides to avoid misrepresentation.
- Keep orientation marks, legends, and numbers readable at the intended viewing size.
- Load only relevant `medium-style`, `color-tone`, and `typography-graphic-treatment` modifiers.

## Verbatim source Prompt examples

Only one direct sample is available. Use it to understand the native structure; do not reuse its city, places, or copy.

### Example 1

- `entry_id`: `featured-002`
- Source title: `手绘城市美食地图`
- Native format: JSON

<!-- SOURCE_PROMPT_START:featured-002 -->
```json
{
  "type": "手绘地图信息图",
  "style": "{argument name=\"art style\" default=\"复古羊皮纸上的水彩墨水手绘插画\"}",
  "title_section": {
    "text": "{argument name=\"city name\" default=\"成都\"} {argument name=\"map title\" default=\"吃货暴走地图\"}",
    "mascot": "戴着墨镜并竖起大拇指的卡通红辣椒"
  },
  "border": "{argument name=\"border decoration\" default=\"绿叶与红辣椒藤蔓\"}",
  "layout": {
    "background": "带有黄色道路、蓝色河流和绿色公园区域的纹理米色羊皮纸",
    "sections": [
      {
        "title": "地标建筑",
        "count": 6,
        "illustrations": ["传统凉亭", "传统寺院", "带有攀爬熊猫的现代摩天大楼", "高耸的电视塔", "传统牌坊", "工业建筑"],
        "labels": ["人民公园", "文殊院", "IFS", "339电视塔", "宽窄巷子", "东郊记忆"]
      },
      {
        "title": "美食地点",
        "count": 12,
        "illustrations": ["麻婆豆腐", "红油水饺", "冷锅串串", "三大炮", "蛋烘糕", "九宫格火锅", "肥肠粉", "钵钵鸡", "冒菜", "盖碗茶", "冰粉", "兔头"],
        "labels": ["1 陈麻婆豆腐", "2 钟水饺", "3 春熙路", "4 宽窄巷子·三大炮", "5 建设路·叶婆婆蛋烘糕", "6 玉林路·小龙坎火锅", "7 香香巷·肥肠粉", "8 武侯祠大街·钵钵鸡", "9 东郊记忆·冒椒火辣", "10 人民公园·鹤鸣茶社", "11 锦里古街·冰粉", "12 双流老妈兔头"]
      },
      {
        "title": "图例",
        "position": "右下角",
        "count": 5,
        "items": ["红点", "绿色建筑", "绿树", "蓝线", "黄色双线"],
        "labels": ["美食地点", "地标景点", "公园绿地", "河流湖泊", "主要道路"]
      }
    ],
    "centerpiece": "坐着吃竹子的大熊猫",
    "bottom_right_extras": ["带有东南西北方向的复古罗盘", "带有红辣椒图标的免责声明：'温馨提示：吃辣需谨慎，肠胃要保护~'"]
  }
}
```
<!-- SOURCE_PROMPT_END:featured-002 -->

## Preflight checklist

- [ ] Point count, numbering, and lists agree.
- [ ] Places, routes, and legend mappings are correct.
- [ ] Directional and spatial relationships do not conflict.
- [ ] Real and schematic scope is explicit.
- [ ] Every place name and label remains verbatim.
- [ ] Primary routes and legends remain readable at the intended display size.
