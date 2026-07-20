# UI Page Mockup Template

## Purpose and use cases

Use for application screens, websites, landing pages, product pages, livestream interfaces, dashboards, and other screenshot-like mockups whose component tree, navigation, and visible state are primary constraints.

## Routing boundaries

- Components, navigation, controls, state, and viewport are hard constraints.
- Route to `commercial-copy-layout` when the output is only a marketing headline and a single-canvas hero.
- Route to `nonsequential-collection-grid` when multiple page thumbnails are only displayed as an independent collection.
- Route to `reference-image-edit` when an input screenshot or image must be modified.

## Required inputs

- Platform, device, viewport, and page type.
- Component tree, region order, and navigation.
- Visible state, data, buttons, inputs, and overlays.
- Every UI string, number, price, and icon.
- Whether only one state is allowed and which extra interfaces are prohibited.

## Default native format

Use JSON by default. Represent complex pages as nested component structures instead of replacing hierarchy with decorative prose.

## Prompt structure

```json
{
  "type": "ui page mockup",
  "platform": "<web, mobile, desktop, or livestream>",
  "viewport": "<device and dimensions>",
  "page_type": "<page type>",
  "components": [
    {
      "id": "<component id>",
      "role": "<header, navigation, card, button, or other role>",
      "position": "<region>",
      "content": ["<verbatim copy or data>"],
      "state": "<visible state>"
    }
  ],
  "navigation": ["<verbatim navigation item>"],
  "visual_system": {
    "colors": ["<color>"],
    "density": "<density>",
    "style": "<interface style>"
  },
  "negative_constraints": ["<forbidden extra component or state>"]
}
```

## Field guidance

- Use `viewport` to determine density and responsive collapse.
- List navigation, button, and state text item by item.
- Make card, chat-message, label, and price counts agree with their arrays.
- Do not invent social metrics, inventory, ratings, or platform controls.

## Writing guidance

- Define the component tree before visual style.
- State whether the result is a design mockup or a simulated platform screenshot.
- Load only relevant typography, color, composition, quality-control, and negative-constraint modifiers.
- Apply the same component contract to landing pages and product detail pages.

## Verbatim source Prompt examples

### Example 1

- `entry_id`: `featured-004`
- Source title: `电商直播 UI 样机`
- Native format: JSON

<!-- SOURCE_PROMPT_START:featured-004 -->
```json
{
  "type": "直播 UI 样机",
  "subject": {
    "description": "{argument name=\"host name\" default=\"Elon Musk\"} 的肖像，面带微笑，身穿印有白色技术示意图的黑色 T 恤",
    "background": "左侧显示带有 '{argument name=\"left background logo\" default=\"SPACEX\"}' 文字的屏幕，右侧显示红色的 '{argument name=\"right background logo\" default=\"Tesla T logo\"}' 和一辆深色汽车"
  },
  "ui_overlay": {
    "top_header": {
      "host_info": "头像，名称 '{argument name=\"host name\" default=\"Elon Musk\"}'，副标题 '55.6万本场点赞'，红色 '关注' 按钮",
      "rank_badge": "带有 '全站第1名' 的金币图标",
      "viewer_stats": "3 个顶部观众头像，显示 '12.3w'、'8.6w'、'5.7w'，总计 '68.7万'，'X' 关闭按钮",
      "right_links": "'更多直播 >'，'礼物展馆 0/24'（带有蓝色 '经典' 标签）"
    },
    "mid_left_gifts": {
      "count": 2,
      "items": [
        "头像 '科技爱好者'，'送小心心'，爱心图标 x 1314",
        "头像 '星辰大海'，'送火箭'，火箭图标 x 666"
      ]
    },
    "bottom_left_chat": {
      "system_message": "37 级勋章 '宇宙漫游者 加入了直播间'",
      "message_count": 7,
      "messages": [
        "小火箭: 马斯克！未来可期！🚀",
        "future: 特斯拉Model 2什么时候出？",
        "星空梦想家: SpaceX今年能上火星吗？",
        "AI探索者: Neuralink进展如何？",
        "帅气的网友: 马总好！",
        "Mars: 第一次来你的直播，超激动！",
        "用户123: 讲讲AI吧，会取代人类吗？"
      ]
    },
    "bottom_right_product_card": {
      "hot_tag": "橙色 '热卖 x 1888'",
      "image": "Tesla Cybertruck",
      "title": "{argument name=\"product name\" default=\"特斯拉Cybertruck 电动皮卡\"}",
      "price": "{argument name=\"product price\" default=\"¥ 1,618,000\"}",
      "button": "红色 '抢' 按钮",
      "floating_animation": "半透明爱心沿右侧边缘向上浮动"
    },
    "bottom_bar": {
      "input_field": "'说点什么...'",
      "icons": ["笑脸", "三个点", "购物车", "礼物盒", "分享"]
    }
  }
}
```
<!-- SOURCE_PROMPT_END:featured-004 -->

### Example 2

- `entry_id`: `all-105`
- Source title: `电商主图 - Skincare E-commerce Landing Page Mockup`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-105 -->
```json
{
  "type": "skincare e-commerce landing page mockup",
  "brand": "{argument name=\"brand name\" default=\"DERMA CALM\"}",
  "color_palette": ["white", "light blue", "{argument name=\"primary color\" default=\"dark blue\"}"],
  "layout": {
    "header": {
      "logo": "left-aligned brand name with Japanese subtext",
      "navigation_links": {
        "count": 6,
        "labels": ["ABOUT", "PRODUCT", "FEATURE", "INGREDIENT", "VOICE", "Q&A"]
      },
      "buttons": {
        "count": 2,
        "labels": ["マイページ", "今すぐ購入する"]
      }
    },
    "hero_section": {
      "left_column": {
        "headline": "{argument name=\"hero headline\" default=\"敏感な肌にも、毎日つづけられる安心ケア。\"}",
        "subtext": "paragraph detailing low irritation, moisturizing, fragrance-free, and alcohol-free benefits",
        "buttons": {
          "count": 2,
          "labels": ["今すぐ購入する", "詳しく見る"]
        }
      },
      "center_column": {
        "product": "white pump bottle with clear cap labeled {argument name=\"product type\" default=\"Moisture Barrier Serum\"}",
        "props": ["dollop of white cream", "circular badge reading 皮膚科医監修"]
      },
      "right_column": {
        "subject": "{argument name=\"model description\" default=\"young East Asian woman with clear glowing skin touching her cheek\"}",
        "background": "blurred laboratory glassware in a bright, clean clinical setting"
      }
    },
    "bottom_features_panel": {
      "left_cards": {
        "count": 3,
        "descriptions": ["95% satisfaction with 5 stars", "shield icon for low irritation formula", "drop icon for skin barrier support"]
      },
      "right_badges": {
        "count": 3,
        "descriptions": ["no fragrance icon", "no alcohol icon", "patch tested icon"]
      },
      "footer": "fine print disclaimers at the bottom"
    }
  }
}
```
<!-- SOURCE_PROMPT_END:all-105 -->

### Example 3

- `entry_id`: `all-117`
- Source title: `电商主图 - 电商直播 UI 样机`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-117 -->
```json
{
  "type": "电商直播截图样机",
  "scene": {
    "subject": "{argument name=\"main subject\" default=\"外貌酷似 Sam Altman 的白人男性\"}",
    "clothing": "深绿色圆领毛衣",
    "action": "一只手拿着黑色产品盒，另一只手指向它",
    "setting": "暗色调摄影棚，左侧配有麦克风，背景有淡淡的 'AI' 文字",
    "props": [
      "印有白色 OpenAI 标志的黑色马克杯",
      "右侧堆叠着 4 个黑色产品盒"
    ]
  },
  "product_design": {
    "box_color": "黑色",
    "logo": "橙色星号或太阳光芒图案",
    "text": "{argument name=\"product name\" default=\"Claude Opus 4.7\"}"
  },
  "ui_overlays": {
    "top_left_product_info": {
      "brand_tag": "Anthropic 官方旗舰店",
      "title": "{argument name=\"product name\" default=\"Claude Opus 4.7\"}",
      "subtitle": "{argument name=\"main headline\" default=\"更强推理·更高智能\"}",
      "sub_subtitle": "最强大模型: Opus 4.7 重磅发布!",
      "bullet_points_count": 3,
      "bullet_points": ["超强推理能力", "代码能力巅峰", "复杂任务轻松搞定"]
    },
    "top_right_live_status": {
      "viewer_info": "直播中 | 52.8 万人观看",
      "promo_banner": "直播专属福利 限时折扣·错过不再有",
      "countdown": "倒计时 00:09:47"
    },
    "middle_right_price_card": {
      "header": "{argument name=\"product name\" default=\"Claude Opus 4.7\"} 直播间专享价",
      "price_currency": "¥",
      "price_value": "{argument name=\"promotional price\" default=\"0.47\"}",
      "price_unit": "/百万 tokens 起",
      "original_price": "原价: ¥1.89",
      "button": "立即抢购"
    },
    "bottom_left_chat": {
      "message_count": 9,
      "input_box_placeholder": "说点什么..."
    },
    "bottom_right_banner": {
      "headline": "奥特曼首推！认准 Claude Opus 4.7",
      "subheadline": "更智能 · 更安全 · 更可靠",
      "feature_tags_count": 4,
      "feature_tags": ["强大推理", "代码神器", "安全可靠", "极速响应"]
    },
    "floating_elements": [
      {
        "type": "sticker",
        "position": "产品盒右侧上方",
        "text": "{argument name=\"sticker text\" default=\"史上最强 AI 模型!\"}"
      }
    ]
  }
}
```
<!-- SOURCE_PROMPT_END:all-117 -->

## Preflight checklist

- [ ] Viewport, platform, and page type are explicit.
- [ ] Component tree, navigation, buttons, and state are complete.
- [ ] Counts, prices, messages, and labels agree with their arrays.
- [ ] No platform data or controls have been invented.
- [ ] The request is not merely a commercial poster or collection board.
- [ ] Critical components remain inside the target viewport.
