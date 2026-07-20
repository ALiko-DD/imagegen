# Brand Design System Template

## Purpose and use cases

Use for brand identity boards, visual-system documents, campaign systems, mascot identity programs, packaging families, merchandise systems, and coordinated brand applications.

## Routing boundaries

- Use this family when identity tokens, usage rules, and consistency across several applications are the main validation targets.
- Route to `commercial-copy-layout` when the deliverable is one advertisement or poster without a reusable system.
- Route to `nonsequential-collection-grid` when items merely share a canvas and do not define brand rules.
- Route to `character-asset-reference` when the main result is a character view, pose, or expression sheet rather than a brand system.
- Route to `multi-image-series` when the required applications must be delivered as separate files instead of one system board.

## Required inputs

- Brand name, industry, audience, positioning, and exact verbal identity.
- Logo text, tagline, campaign line, and other verbatim copy.
- Color tokens, typography roles, motifs, graphic devices, and image direction.
- Required identity sections, applications, mockups, and asset counts.
- Rules for consistency, safe area, minimum size, allowed variants, and prohibited usage.
- Canvas, ratio, delivery form, and any supplied brand assets.

## Default native format

Use JSON by default. Keep identity tokens, sections, applications, and usage rules in independently checkable arrays or objects.

## Prompt structure

```json
{
  "type": "brand design system",
  "brand": {
    "name": "<verbatim brand name>",
    "industry": "<industry>",
    "audience": "<audience>",
    "positioning": "<positioning>",
    "verbal_identity": {
      "tagline": "<verbatim tagline or none>",
      "campaign_line": "<verbatim campaign line or none>"
    }
  },
  "identity_tokens": {
    "logo": "<verbatim logo text and supplied mark>",
    "colors": [
      {
        "name": "<token name>",
        "value": "<provided color value>"
      }
    ],
    "typography": [
      {
        "role": "<primary, secondary, display, or body>",
        "direction": "<provided family or visual direction>"
      }
    ],
    "motifs": ["<graphic motif>"]
  },
  "sections": [
    {
      "id": "<section id>",
      "purpose": "<identity rule or application>",
      "elements": ["<required element>"],
      "count": 1
    }
  ],
  "usage_rules": {
    "preserve": ["<invariant>"],
    "allowed_variants": ["<allowed change>"],
    "prohibited": ["<misuse or unsupported addition>"]
  },
  "output": {
    "aspect_ratio": "<ratio>",
    "size": "<size or auto>",
    "delivery": "<single system board or named artifact>"
  }
}
```

## Field guidance

- Keep identity tokens separate from example applications.
- Preserve every logo, tagline, date, color value, and typography name verbatim.
- Make application and asset counts agree with their lists.
- Do not invent official color values, legal lines, certifications, handles, product names, or usage rules.
- Treat a mascot's character identity as a nested invariant, not as a replacement for the brand contract.

## Writing guidance

- Define the brand contract before listing mockups or merchandise.
- Distinguish required rules from optional demonstrations.
- Load only relevant typography, color, composition, material, cultural-language, and quality-control modifiers.
- Keep a one-canvas brand board in this family; use `multi-image-series` only for separate deliverables.

## Verbatim source Prompt examples

### Example 1

- `entry_id`: `all-087`
- Source title: `产品营销 - 动漫角色品牌形象与周边项目`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-087 -->
```json
{
  "type": "品牌形象与周边设计项目",
  "theme": {
    "color_palette": "{argument name=\"theme color\" default=\"柔粉色\"} 与白色",
    "motif": "{argument name=\"motif\" default=\"樱花\"} 与粉色爱心"
  },
  "character": {
    "description": "留着棕色短波波头的动漫少女，粉色眼睛，身穿白色连帽衫，面带温柔微笑"
  },
  "branding": {
    "main_logo": "{argument name=\"character name\" default=\"癒音ちー\"}",
    "sub_logo": "{argument name=\"character subtext\" default=\"ゆおんちー\"}"
  },
  "layout": {
    "sections": [
      {
        "type": "页眉横幅",
        "position": "顶部",
        "elements": ["大型主 Logo", "副 Logo", "樱花图案", "右侧角色肖像"]
      },
      {
        "type": "产品包装",
        "position": "中左",
        "elements": ["1 个带有心形透明窗口的方形包装盒，展示粉色心形糖果", "盒身角色插画", "2 个独立糖果包装纸", "5 颗散落的心形糖果"]
      },
      {
        "type": "宣传海报",
        "position": "中右",
        "elements": ["角色肖像", "心形糖果碗", "主 Logo", "文字 '4.26 NEW OPEN'", "文字 '{argument name=\"social handle\" default=\"@yuonchii\"}'"]
      },
      {
        "type": "水平网页横幅",
        "position": "中下",
        "elements": ["主 Logo", "樱花", "右侧角色肖像"]
      },
      {
        "type": "社交媒体个人资料样机",
        "position": "左下",
        "elements": ["带有 Logo 的页眉图片", "1 个圆形头像", "账号名 '{argument name=\"social handle\" default=\"@yuonchii\"}'", "1 个关注按钮", "模拟简介文本"]
      },
      {
        "type": "周边商品系列",
        "position": "右下",
        "count": 9,
        "items": ["1 件印有 Logo 的白色 T 恤", "1 个印有角色图案的白色马克杯", "4 枚圆形徽章", "1 个亚克力钥匙扣", "2 包糖果"]
      }
    ]
  }
}
```
<!-- SOURCE_PROMPT_END:all-087 -->

### Example 2

- `entry_id`: `all-089`
- Source title: `产品营销 - 18 面板吉祥物品牌识别文档`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-089 -->
```json
{
  "type": "18 面板品牌识别与角色设计文档",
  "brand": {
    "name": "{argument name=\"brand name\" default=\"沐阳 MUYANG TEA\"}",
    "industry": "{argument name=\"industry\" default=\"茶饮店\"}",
    "colors": ["{argument name=\"primary color\" default=\"黄色\"}", "{argument name=\"secondary color\" default=\"绿色\"}", "白色", "棕色", "深绿色"]
  },
  "subject": "{argument name=\"character description\" default=\"佩戴绿色围裙的 3D 渲染可爱柴犬吉祥物\"}",
  "layout": {
    "grid": "3 列 6 行",
    "sections": [
      {
        "title": "01 品牌 DNA 分析 / BRAND DNA ANALYSIS",
        "elements": ["Logo", "5 个色卡", "6 个图标", "目标受众图表"]
      },
      {
        "title": "02 概念构思 / CONCEPT MOODBOARD",
        "elements": ["5 张参考照片", "4 个情绪图标", "设计公式"]
      },
      {
        "title": "03 形态研究 / FORM STUDY",
        "elements": ["4 个 Logo 解构图标", "4 个演变步骤", "4 个轮廓图"]
      },
      {
        "title": "04 概念探索 / CONCEPT EXPLORATION",
        "elements": ["12 个角色线稿草图"]
      },
      {
        "title": "05 精细线稿 / REFINED LINE ART",
        "elements": ["3 行带有比例参考的正侧面线稿"]
      },
      {
        "title": "06 细节精修 / DETAIL REFINEMENT",
        "elements": ["2 个带标注的全身渲染图", "4 个圆形特写图"]
      },
      {
        "title": "07 表情设定 / EXPRESSION SHEET",
        "elements": ["11 个 3D 渲染头部表情"]
      },
      {
        "title": "08 姿势库 / POSE LIBRARY",
        "elements": ["9 个全身 3D 渲染姿势"]
      },
      {
        "title": "09 转身视图 / TURNAROUND VIEW",
        "elements": ["5 个全身 3D 渲染图", "5 个对应的线稿视图"]
      },
      {
        "title": "10 色彩开发 / COLOR DEVELOPMENT",
        "elements": ["5 行 5 色配色方案", "色彩心理学文字"]
      },
      {
        "title": "11 材质规格 / MATERIAL SPECIFICATION",
        "elements": ["5 个纹理色卡", "属性滑块", "4 个制造工艺图标"]
      },
      {
        "title": "12 色彩应用 / COLOR APPLICATION",
        "elements": ["4 个配色变体渲染图", "2 个明暗渲染图", "4 个对比度评分圆圈"]
      },
      {
        "title": "13 构造指南 / CONSTRUCTION GUIDE",
        "elements": ["2 个几何结构与网格线稿图"]
      },
      {
        "title": "14 设计系统规则 / DESIGN SYSTEM RULES",
        "elements": ["最小尺寸图标", "安全空间示意图", "4 个使用示例"]
      },
      {
        "title": "15 资产变体 / ASSET VARIANTS",
        "elements": ["3 个尺寸变体", "3 个线稿变体", "3 个简化扁平化头像"]
      },
      {
        "title": "16 数字应用 / DIGITAL APPLICATIONS",
        "elements": ["1 个 App 图标", "2 个社交媒体头像", "UI 元素", "3 帧动画循环"]
      },
      {
        "title": "17 实物应用 / PHYSICAL APPLICATIONS",
        "elements": ["毛绒玩具样机", "包装样机", "周边商品样机", "店面样机"]
      },
      {
        "title": "18 最终主视觉 / FINAL RENDERING",
        "elements": ["吉祥物手持茶饮的大尺寸高分辨率 3D 渲染图", "Logo", "文件格式列表"]
      }
    ]
  }
}
```
<!-- SOURCE_PROMPT_END:all-089 -->

### Example 3

- `entry_id`: `all-091`
- Source title: `产品营销 - Monochrome Infra 品牌工具包项目`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-091 -->
```json
{"type":"单色品牌工具包及周边展示项目","brand":{"name":"{argument name=\"brand name\" default=\"A16Z INFRA\"}","tagline":"我们支持构建者为 AI 时代打造基础架构。","campaign_line":"[ 从零开始，构建未来。 ]","version":"版本 1.0"},"style":{"overall":"简洁的瑞士风格品牌指南页，极简工业科技美学，仅限黑白灰，米白色纸张背景，清晰的摄影棚产品抠图，柔和阴影，精确网格布局，编辑级展示","mood":"专业、高端、未来感、聚焦基础设施"},"layout":{"header":{"left":"A16Z INFRA / 品牌工具包与周边","right":"版本 1.0","divider":"虚线水平分割线"},"sections":[{"title":"01 品牌识别","position":"左上","count":3,"labels":["大号标识","品牌宣言段落","括号内的活动口号"]},{"title":"02 色彩方案","position":"右上","count":4,"labels":["暖米白","黑色","炭灰色","柔和灰"]},{"title":"03 字体排版","position":"色彩方案下方右侧","count":2,"labels":["主字体 -- 等宽字体","副字体 -- 无衬线字体"]},{"title":"06 周边产品","position":"底部三分之二区域","count":16,"labels":["黑色连帽衫正面","黑色连帽衫背面","米白色 T 恤","黑色棒球帽","米白色托特包","6 款方形贴纸/卡片套装","黑色螺旋笔记本","黑色马克杯","黑色水瓶","黑色拉链收纳袋","手持复古游戏机","盒装微型积木套装","打开的键盘套件盒","云朵键帽徽章","堆叠立方体键帽徽章","长方形品牌贴片徽章"]}],"footer":{"left":"A16Z INFRA / 品牌工具包","right":"© 2024 A16Z INFRA. 保留所有权利。","divider":"虚线水平分割线"}},"identity":{"logotype":{"text":"{argument name=\"logo text\" default=\"A16Z INFRA\"}","appearance":"超大自定义几何块状文字标识，带有棱角切割，厚重黑色字体，分两行堆叠"}},"palette":{"swatches":[{"name":"暖米白","hex":"#F2EEE9","rgb":"243 238 233","cmyk":"4 4 6 0"},{"name":"黑色","hex":"#000000","rgb":"13 13 13","cmyk":"75 68 67 90"},{"name":"炭灰色","hex":"#3A3A3A","rgb":"58 58 58","cmyk":"63 53 51 27"},{"name":"柔和灰","hex":"#A6A6A6","rgb":"166 166 166","cmyk":"36 28 28 0"}]},"typography":{"primary":{"label":"主字体 -- 等宽字体","family":"{argument name=\"primary font\" default=\"Infra Mono\"}","sample":"ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 !@#$%^&*()_+-=[]{}`~;:'\",.<>/?"},"secondary":{"label":"副字体 -- 无衬线字体","family":"{argument name=\"secondary font\" default=\"Inter Regular\"}","sample":"ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 !@#$%^&*()_+-=[]{}`~;:'\",.<>/?"}} ,"swag":{"items":[{"name":"连帽衫正面","color":"黑色","print":"小号胸前 Logo"},{"name":"连帽衫背面","color":"黑色","print":"多行宣言列表，内容为 BUILDING THE INFRASTRUCTURE LAYER OF AI，配有虚线引导线及分类，包括 SYSTEMS、TOOLS、DATA、CLOUD、SECURITY、NETWORKS、DEVELOPER TOOLS"},{"name":"T 恤","color":"米白色","print":"居中大号 Logo"},{"name":"棒球帽","color":"黑色","print":"刺绣前标"},{"name":"托特包","color":"米白色","print":"堆叠宣言列表及底部口号 BUILDING WHAT'S NEXT."},{"name":"贴纸/卡片套装","count":6,"layout":"2x3 网格","labels":["A16Z INFRA","BUILDING THE INFRASTRUCTURE LAYER OF AI.","EARLY STAGE","SYSTEMS. TOOLS. PLATFORMS.","INFRA","BUILD","DEPLOY","SCALE"]},{"name":"螺旋笔记本","color":"黑色","print":"Logo 及 NOTES FOR BUILDING THE FUTURE"},{"name":"马克杯","color":"黑色","print":"白色 Logo"},{"name":"水瓶","color":"黑色","print":"竖排文字 BUILDING WHAT'S NEXT. FROM THE GROUND UP."},{"name":"拉链收纳袋","color":"黑色","print":"Logo、虚线网格图案、小字 SYSTEMS ONLINE."},{"name":"复古手持设备","color":"炭黑色","screen":"像素风城市/基础设施游戏界面，带有 BUILD DEPLOY SCALE 标签及关卡指示器 LEVEL 01"},{"name":"微型积木盒","color":"黑色","print":"A16Z INFRA, INFRASTRUCTURE MICRO BUILDS, COLLECT.CONNECT.SCALE.","contents":"盒前展示的黑、灰、白小型模块化建筑积木模型"},{"name":"键盘套件盒","color":"黑色","print":"A16Z INFRA KEYPAD SET BUILD. DEPLOY. SCALE.","keys":8,"labels":["INFRA","BUILD","DEPLOY","SCALE",">_","云朵图标","芯片/网格图标","网络图表图标"]},{"name":"云朵徽章","style":"带白色边框的小型黑色珐琅徽章"},{"name":"立方体徽章","style":"展示堆叠等距立方体的小型黑色珐琅徽章"},{"name":"品牌贴片徽章","style":"带有白色 Logo 的小型长方形黑色珐琅徽章"}]},"rendering":{"camera":"正视平铺与正投影产品项目构图结合","lighting":"柔和均匀的摄影棚灯光","background":"浅暖米色纸张","quality":"适用于专业品牌展示的高分辨率商业样机"}}
```
<!-- SOURCE_PROMPT_END:all-091 -->

## Preflight checklist

- [ ] Brand name, logo text, taglines, dates, and color values remain verbatim.
- [ ] Identity tokens and example applications are separated.
- [ ] Section, application, and asset counts agree with their lists.
- [ ] Usage rules do not conflict with required variants.
- [ ] No unsupported official token, legal line, certification, or platform claim has been invented.
- [ ] A separate-file deliverable has not been compressed into one board.
