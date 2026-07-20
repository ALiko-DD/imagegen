# Nonsequential Collection Grid Template

## Purpose and use cases

Use for sticker sheets, ad grids, product catalogs, variant displays, independent concepts, and other multi-slot canvases without narrative order.

## Routing boundaries

- Each slot must be independently meaningful while sharing one canvas and visual system.
- Route to `sequential-comic-storyboard` when story beats, causality, and reading order matter.
- Route to `character-asset-reference` when every slot must preserve one identity across views.
- Route to `ui-page-mockup` when component hierarchy, navigation, and state dominate.

## Required inputs

- Row, column, slot, or item count.
- Position, content, exact text, and local constraints for every slot.
- Shared background, margins, style, and alignment rules.
- Any cross-grid title, footer, or common legend.
- Aspect ratio, size, and prohibitions.

## Default native format

Use JSON by default. The item array length must agree with the declared slot count.

## Prompt structure

```json
{
  "type": "nonsequential collection grid",
  "grid": {
    "rows": 2,
    "columns": 2,
    "count": 4,
    "spacing": "<gaps and margins>"
  },
  "shared_style": {
    "background": "<shared background>",
    "visual_language": "<shared visual system>"
  },
  "items": [
    {
      "position": "<row, column, or region>",
      "subject": "<slot content>",
      "text": ["<verbatim text>"],
      "constraints": ["<slot-specific constraint>"]
    }
  ],
  "shared_elements": ["<cross-grid title, footer, or legend>"],
  "output": {
    "aspect_ratio": "<ratio>",
    "size": "<size or auto>"
  }
}
```

## Field guidance

- Make `count` equal `rows × columns` or the actual item array length.
- Specify each slot's subject, text, and position; never use “same as above” for required content.
- Do not let shared style overwrite explicit slot differences.
- Do not describe a one-canvas grid as multiple output files.

## Writing guidance

- Define the grid first, populate every slot second, and add shared elements last.
- Reserve enough space for text-heavy slots.
- Load only relevant composition, color, typography, medium, and negative-constraint modifiers.
- Route to `brand-design-system` when the main validation target is brand tokens and usage rules.

## Verbatim source Prompt examples

### Example 1

- `entry_id`: `all-021`
- Source title: `社交媒体帖子 - 4 格日式数字广告横幅网格`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-021 -->
```json
{
  "type": "2x2 日式数字广告横幅网格",
  "layout": {
    "structure": "4 个等分象限",
    "quadrants": [
      {
        "position": "左上",
        "theme": "旅游",
        "subject": "一对情侣在白沙滩上牵手，眺望碧蓝的海水和明亮的蓝天。",
        "elements": ["左下角的红色木槿花"],
        "text_labels": [
          "今年こそ、解き放て。",
          "{argument name=\"travel destination\" default=\"沖縄旅行\"}",
          "3日間の癒やし旅",
          "航空券＋ホテル",
          "39,800円〜",
          "絶景、グルメ、体験 ぜんぶ叶う!"
        ],
        "icons": {
          "count": 3,
          "descriptions": ["飞机", "酒店建筑", "汽车"]
        }
      },
      {
        "position": "右上",
        "theme": "护肤",
        "subject": "一位年轻女性的特写肖像，皮肤水润透亮，闭着眼睛，轻轻触摸脸颊。",
        "elements": [
          "柔和的粉色渐变背景",
          "动态水花效果",
          "粉色化妆品罐，标签为 '{argument name=\"skincare product name\" default=\"LUMIÈRE\"} Brightening Gel'"
        ],
        "text_labels": [
          "毛穴・くすみ卒業！",
          "透明感あふれる",
          "水光肌へ",
          "新感覚スキンケア",
          "初回限定 78%OFF",
          "{argument name=\"discount price\" default=\"1,980円\"}"
        ],
        "badges": {
          "count": 3,
          "style": "金色圆形",
          "labels": ["毛穴ケア", "高保湿", "ハリ・ツヤ"]
        }
      },
      {
        "position": "左下",
        "theme": "美食",
        "subject": "厚切的五分熟牛排在深色烤盘上滋滋作响。",
        "elements": [
          "蒜片",
          "迷迭香枝",
          "带有烟雾和余烬光芒的深色背景"
        ],
        "text_labels": [
          "とろける旨さ！",
          "{argument name=\"food item\" default=\"黒毛和牛\"}",
          "贅沢ステーキ",
          "期間限定",
          "特別価格",
          "通常価格 8,980円",
          "4,980円"
        ],
        "badges": {
          "count": 1,
          "style": "红色圆形",
          "labels": ["A4 A5等級"]
        }
      },
      {
        "position": "右下",
        "theme": "在线教育",
        "subject": "一名穿着蓝色衬衫的年轻男子在书桌前学习，在笔记本上写字，旁边放着一台打开的笔记本电脑。",
        "elements": ["明亮的室内光线", "书桌环境"],
        "text_labels": [
          "スキマ時間で",
          "{argument name=\"education goal\" default=\"最短合格！\"}",
          "オンライン資格講座",
          "スマホで完結",
          "効率学習で差がつく！",
          "今だけ！ 受講料 20%OFF"
        ],
        "badges": {
          "count": 1,
          "style": "蓝色圆形",
          "labels": ["受講者数 10万人 突破！"]
        },
        "icons": {
          "count": 2,
          "descriptions": ["智能手机", "打开的书本"]
        }
      }
    ]
  }
}
```
<!-- SOURCE_PROMPT_END:all-021 -->

### Example 2

- `entry_id`: `all-022`
- Source title: `社交媒体帖子 - 可爱黑猫日文贴纸合集`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-022 -->
```json
{"type":"可爱贴纸合集插画","subject":{"species":"黑猫","style":"可爱的 Q 版风格，柔和的油画感动漫卡通外观，大而圆的琥珀棕色眼睛，小巧的口鼻，表情生动，蓬松的深炭黑色毛发带有暖棕色高光，粗而清晰的轮廓线"},"layout":{"background":"纯白色","grid":{"rows":3,"columns":5,"count":15},"sections":[{"title":"01. ありがとう！","position":"第 1 行第 1 列","count":1,"labels":["快乐感激的姿势，双爪合十放在胸前，张嘴微笑，猫咪周围有粉色樱花瓣"]},{"title":"02. おつかれさま！","position":"第 1 行第 2 列","count":1,"labels":["满足放松的猫咪，爪子拿着一个带有爪印标志的绿色马克杯，闭着眼睛，冒着小蒸汽，带有庆祝意味的黄色强调线"]},{"title":"03. 了解です！","position":"第 1 行第 3 列","count":1,"labels":["直立的猫咪举起一只爪子表示知晓，表情明亮专注，上方有黄色强调线"]},{"title":"04. ＯＫ！","position":"第 1 行第 4 列","count":1,"labels":["眨眼的猫咪用一只爪子做出 OK 的手势，微微一笑，带有黄色强调线"]},{"title":"05. はーい！","position":"第 1 行第 5 列","count":1,"labels":["兴奋的猫咪高高挥动一只爪子，张嘴微笑，带有黄色强调线"]},{"title":"06. いいね！","position":"第 2 行第 1 列","count":1,"labels":["眨眼的猫咪竖起大拇指，旁边有一个粉色小爱心，带有黄色强调线"]},{"title":"07. がんばる！","position":"第 2 行第 2 列","count":1,"labels":["坚定的猫咪握紧双爪，眼神犀利，周围环绕着风格化的橙色火焰"]},{"title":"08. なんとかなる！","position":"第 2 行第 3 列","count":1,"labels":["自信从容的猫咪，闭着眼睛，胸部微微挺起，粉色花瓣在周围飘浮"]},{"title":"09. ごめんね…","position":"第 2 行第 4 列","count":1,"labels":["道歉的忧伤猫咪，双爪合十放在胸前，眼神低垂，带有一滴蓝色汗珠"]},{"title":"10. 待ってるね！","position":"第 2 行第 5 列","count":1,"labels":["猫咪从木质边缘探出头，双爪可见，表情充满期待，两侧有细小的动作线"]},{"title":"11. おやすみなさい","position":"第 3 行第 1 列","count":1,"labels":["在粉色垫子上蜷缩睡觉的猫咪，带有蓝色 ZZZ 字母，上方有新月和小星星"]},{"title":"12. いってきます！","position":"第 3 行第 2 列","count":1,"labels":["猫咪背影，欢快地走开并举起一只爪子，背着一个带有爪印补丁和挂饰的绿色背包，带有黄色强调线"]},{"title":"13. ただいま！","position":"第 3 行第 3 列","count":1,"labels":["猫咪正面，双爪高举，开心地张嘴微笑，周围有金色闪光标记"]},{"title":"14. よろしくね！","position":"第 3 行第 4 列","count":1,"labels":["礼貌坐着的猫咪面向前方，温柔微笑，头部旁边有黄色强调线"]},{"title":"15. 大好き！","position":"第 3 行第 5 列","count":1,"labels":["满足的猫咪拥抱着一个大大的粉色爱心，闭着眼睛，周围飘浮着几个粉色小爱心"]}],"spacing":"均匀分布，留有充足的白色边距"},"rendering":{"quality":"高细节","lighting":"柔和均匀的摄影棚灯光","color_palette":"黑色毛发，暖棕色眼睛，粉色爱心和花朵，黄色强调标记，绿色配饰，极简柔和装饰","mood":"友好、治愈、贴纸风格、聊天软件表情包","composition":"每个贴纸独立居中于各自的格子中，上方配有醒目的日文文字"}}
```
<!-- SOURCE_PROMPT_END:all-022 -->

### Example 3

- `entry_id`: `all-116`
- Source title: `电商主图 - 4 格广告网格概念`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-116 -->
```json
{
  "type": "2x2 广告横幅网格",
  "layout": "4 个独立的象限，每个象限展示不同行业的广告",
  "quadrants": [
    {
      "position": "左上",
      "industry": "护肤",
      "visuals": "亚洲女性轻触脸颊，漂浮的水滴，白色按压式瓶装产品",
      "brand": "BALANCÉE",
      "copy": {
        "headline": "{argument name=\"skincare headline\" default=\"素肌が、目覚める。\"}",
        "subheadline": "迈向充满透明感的新自我。",
        "features_count": 3,
        "features_labels": ["高保湿", "预防肌肤粗糙", "美白护理*"]
      }
    },
    {
      "position": "右上",
      "industry": "餐饮食品",
      "visuals": "特写镜头下的肉酱意大利面，撒有磨碎的奶酪和欧芹，深色调氛围光",
      "brand": "Trattoria Luce",
      "copy": {
        "headline": "{argument name=\"food headline\" default=\"このパスタ、事件級。\"}",
        "badge": "限时供应",
        "description": "黑毛和牛波隆那肉酱面 〜松露香气〜"
      }
    },
    {
      "position": "左下",
      "industry": "旅游",
      "visuals": "背着背包的女性面对风景秀丽的高山湖泊，明亮的日光",
      "brand": "NATURE JOURNEY",
      "copy": {
        "headline": "{argument name=\"travel headline\" default=\"わたしを、解き放つ旅へ。\"}",
        "subheadline": "在自然中，让心动起来。",
        "script": "Find your freedom.",
        "banner_details": ["初夏特别活动", "6 月 1 日 周六 - 6 月 30 日 周日", "最高 20% 折扣", "现有多项限时特别方案！"]
      }
    },
    {
      "position": "右下",
      "industry": "SaaS 应用",
      "visuals": "智能手机显示着一个包含 4 个日程项目的任务管理应用界面",
      "brand": "{argument name=\"app brand name\" default=\"Taskme\"}",
      "copy": {
        "headline": "{argument name=\"app headline\" default=\"タスク管理を、もっとシンプルに、スマートに。\"}",
        "circle_badge": "设计你的一天。",
        "features_count": 3,
        "features_labels": ["直观的操作体验", "支持团队共享", "随时随地访问"],
        "bottom_banner": "7 天免费试用进行中！"
      }
    }
  ]
}
```
<!-- SOURCE_PROMPT_END:all-116 -->

## Preflight checklist

- [ ] Row, column, slot, and array counts agree.
- [ ] Every slot has explicit placement, content, and text.
- [ ] Shared style does not erase slot-specific differences.
- [ ] No narrative order, identity-view contract, or UI state contract is present.
- [ ] Canvas margins and slot gaps are sufficient.
- [ ] A single-canvas grid has not been rewritten as separate files.
