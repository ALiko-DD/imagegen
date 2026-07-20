# Commercial Copy Layout Template

## Purpose and use cases

Use for posters, thumbnails, social cards, single-canvas advertisements, product promotions, and key visuals whose marketing copy hierarchy is a primary constraint.

## Routing boundaries

- Use this family when headline, subheadline, CTA, price, badge, or promotional hierarchy controls the result.
- Route to `nonsequential-collection-grid` when several independent slots are presented side by side.
- Route to `ui-page-mockup` when components, navigation, and interface state dominate.
- Route to `single-frame-scene` for photography or illustration without a complex text hierarchy.

## Required inputs

- Channel, audience, and canvas ratio.
- Hero subject and placement.
- Every verbatim headline, subheadline, CTA, price, badge, and logo string.
- Text hierarchy, region, alignment, and reading order.
- Brand colors, typography direction, background, decoration, and prohibitions.

## Default native format

Use JSON by default so text regions and layout regions can be checked independently. A simple poster with one short title may use prose.

## Prompt structure

```json
{
  "type": "commercial copy layout",
  "use_case": "<channel and purpose>",
  "canvas": {
    "aspect_ratio": "<ratio>",
    "size": "<size or auto>"
  },
  "hero": {
    "subject": "<hero subject>",
    "position": "<region>",
    "scale": "<relative scale>"
  },
  "text_regions": [
    {
      "role": "<headline, subheadline, cta, price, or badge>",
      "text": "<verbatim text>",
      "position": "<region>",
      "hierarchy": 1,
      "visual_treatment": "<typographic and graphic treatment>"
    }
  ],
  "brand_system": {
    "colors": ["<color>"],
    "logo": "<verbatim logo text or none>"
  },
  "negative_constraints": [
    "<forbidden additions or errors>"
  ]
}
```

## Field guidance

- Record each text block separately and preserve language, case, punctuation, and price formatting.
- Use `hierarchy` for reading priority instead of vague instructions such as “make it stand out.”
- Require scannable QR codes or official store badges only when the user supplies the real assets.
- Do not invent discounts, sales figures, certifications, platform UI, or slogans.

## Writing guidance

- Lock the canvas and exact text before describing the hero and decoration.
- Check that the hero, edges, or badges do not obscure required copy.
- Load only typography, color, composition, medium, and negative-constraint modifiers that affect the result.
- Treat a thumbnail as a ratio and viewing-distance variant, not as a separate structure family.

## Verbatim source Prompt examples

### Example 1

- `entry_id`: `all-050`
- Source title: `YouTube 缩略图 - Q 版鲨鱼冒险电影海报`
- Native format: prose

<!-- SOURCE_PROMPT_START:all-050 -->
```text
一张明亮、充满活力的日式电影海报插画，采用精致的动漫 Q 版风格，背景设定在波光粼粼的热带海洋冒险场景中。画面中心为 2 个可爱的 Q 版儿童，他们骑着一只微笑的蓝色鲨鱼，正斜向跃出水面，周围环绕着旋转的海水和白色浪花特效。左侧的男孩留着黑色短发，有着巨大的亮蓝色眼睛，张嘴大笑，身穿黑色 T 恤、深色短裤和白色运动鞋，戴着浅蓝色鲨鱼连帽衫，带齿的兜帽环绕着他的脸庞；他一只手指向天空，另一只手抱着鲨鱼。右侧的女孩留着橘色头发，有着巨大的亮紫色眼睛，张嘴欢笑，身穿橘色连衣裙和粉色鞋子，戴着粉色鲨鱼连帽衫，同样带有带齿的兜帽；她一只手臂兴奋地张开，另一只手紧紧抓住鲨鱼。鲨鱼体型硕大且友好，身体圆润，有着浅色的腹部、小小的黑色眼睛和张开的大嘴。周围环绕着生动的海底与海面世界：成群的小型热带鱼，左侧有 1 只海龟，右侧有 1 只海豚，右侧有 1 只粉色章鱼，左下方有 1 只河豚，底部边缘布满珊瑚礁和海草，画面中散布着气泡，并有强烈的蓝色水流动态线。背景上方展现了阳光明媚的天空，戏剧性的阳光射入水中，云朵蓬松，有 2 只海鸥飞翔，左上方有一座长满棕榈树的岩石热带岛屿，右上方有一艘挂着白帆并带有可爱鲨鱼标志的海盗船。在主标题后方加入部分可见的船舵。采用紧凑、令人兴奋的日本儿童动漫宣传布局，搭配超大 3D 字体和爆炸特效。在顶部，放置巨大的日文标题文本 {argument name="headline text" default="サメなの ワクワク 大作戦"}，采用堆叠排列，使用亮蓝色、橘粉色和黄橘色渐变字体，配以粗白色轮廓、深蓝色阴影、水花和闪光效果。在标题下方，添加一行较小的弧形日文标语，白色字体配蓝色轮廓：{argument name="tagline" default="さあ、海のむこうへ！最高の冒険がはじまる！"}。在底部，放置巨大的日文上映信息 {argument name="release text" default="2026年 夏公開"}，采用醒目的红黄渐变 3D 字体，配以白蓝边缘，置于放射状的橘色光芒之上。在右下角，添加一个蓝色星形徽章，内含日文文本 {argument name="badge text" default="ドキドキ！ワクワク！いっしょに出発だ！"}，字体为白色和黄色。包含 2 个宝藏主题的角落道具：左下角是一个装满金币的打开的宝箱，右下角是一个指南针。整体风格应呈现出光泽感、高饱和度、适合家庭、奇幻、电影感和玩具般的质感，线条清晰，表情夸张，对比度高，采用适合海报的竖构图。拒绝写实风格，拒绝暗淡色彩，拒绝极简主义。
```
<!-- SOURCE_PROMPT_END:all-050 -->

### Example 2

- `entry_id`: `all-090`
- Source title: `产品营销 - 动漫武士游戏广告海报`
- Native format: prose

<!-- SOURCE_PROMPT_START:all-090 -->
```text
创作一张具有高冲击力的竖版手游广告海报，采用光泽感动漫动作风格，呈现极具戏剧性的赛博武士幻想美学，以及紧凑、高级的抽卡 RPG 推广构图。主画面展示了 2 名年轻男性战士，他们身穿现代黑色商务西装，在前景中呈进攻姿态蹲伏，每人都在向观众拔出武士刀。两人均留着时尚的金发，五官轮廓分明、英俊帅气，身穿白色衬衫，系着蓝色领带，动作姿势充满张力，近大远小的手部和剑身占据了下方前景。其中一把剑的护手附近系着一条蓝色丝带。在他们身后居中位置，放置 1 个巨大的装甲机甲武士，它拥有华丽的金色犄角、层叠的金属蓝黑色盔甲、发光的蓝色眼睛，背部横跨着一把收鞘的剑，宛如守护神一般。背景采用生动的霓虹城市和能量爆发效果，主色调为电光蓝、紫罗兰、洋红色和金色，并辅以光束、火花、花瓣、斩击特效和水墨爆炸纹理。在右上角添加 1 个竖向黑色笔触横幅，上面用醒目的白色日文写着「この刃で、未来を斬り拓け。」。在中下部区域，放置 1 个巨大的金色日文书法标题，带有厚重的笔触质感和黑色阴影，写着「切り捨て御免」，几乎横跨整个画面宽度。在左下角，嵌入 1 个带有金色边框的游戏截图面板，展示了红色日本寺庙庭院前的夜战场景，1 名可操作的剑客正在战斗，周围有多个敌人，漂浮的伤害数字包括 5324、5329 和 6132，左侧设有虚拟摇杆，底部及侧边共排列 5 个角色头像，右侧有 3 个圆形技能按钮，顶部 HUD 显示计时器约为 01:28 和 WAVE 3/3。在右下角，放置 1 个巨大的黑白二维码，置于白色方框内。在其下方和侧面，添加带有蓝色描边的白色粗体日文「今すぐダウンロード」。在最底部，包含 2 个官方风格的应用商店徽标：左侧为 App Store，右侧为 Google Play。整体外观：超精细、精致的关键视觉图、动态视角、金属高光、锐利的赛璐珞动漫渲染、高级手游营销海报、强烈的动作能量、电影级光影以及层级丰富的重 UI 推广布局。
```
<!-- SOURCE_PROMPT_END:all-090 -->

### Example 3

- `entry_id`: `all-110`
- Source title: `电商主图 - Green Tea Bottle Advertisement Poster`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-110 -->
```json
{"type": "promotional advertisement poster for a bottled green tea beverage", "product": {"type": "clear plastic PET bottle filled with yellow-green tea", "label": "white label with green typography, featuring the product name '{argument name=\"product name\" default=\"清風茶\"}', subtitle '緑茶 Seifucha', and vertical text '国産茶葉使用' and '香り豊か、後味さわやか'"}, "background": "bright, fresh, sunlit outdoor atmosphere with dynamic water splashes wrapping around the bottle and vibrant green tea leaves", "layout": {"sections": [{"title": "headline", "position": "top-left", "text": "{argument name=\"main headline\" default=\"新発売\"}", "style": "large red text with a gold underline and a small green leaf accent"}, {"title": "catchphrase", "position": "mid-left", "text": "{argument name=\"catchphrase\" default=\"毎日に、すっきり。\"}", "style": "dark green text"}, {"title": "features", "position": "lower-left", "count": 2, "labels": ["国産茶葉使用", "香り豊か、後味さわやか"], "style": "white pill-shaped banners with green leaf icons"}, {"title": "price_badge", "position": "top-right", "text": "今だけ!! 特別価格 {argument name=\"price\" default=\"128円\"} (税込)", "style": "red circular sticker with white and yellow text"}, {"title": "promo_banner", "position": "bottom-left", "text": "期間限定のお得価格!", "style": "angled red ribbon with yellow and white text"}, {"title": "footer", "position": "bottom-edge", "text": "{argument name=\"footer text\" default=\"全国のコンビニ・スーパーで発売中\"}", "style": "solid green horizontal bar with a white shopping cart icon"}]}}
```
<!-- SOURCE_PROMPT_END:all-110 -->

### Example 4

- `entry_id`: `validated-001`
- Source title: `Indoor Climbing Editorial Action Poster`
- Native format: JSON

```json
{"type":"commercial copy layout","use_case":"full-bleed editorial action poster for contemporary indoor climbing culture","canvas":{"aspect_ratio":"4:5 portrait","size":"auto"},"hero":{"subject":"an adult boulderer in a saturated cyan-blue technical top, deep neutral climbing pants, and climbing shoes, dynamically reaching for a hold on an overhanging indoor bouldering wall; a fluorescent-orange chalk bag is clipped at the waist","position":"extreme low-angle foreground, body and reaching arm cutting diagonally from lower left toward upper right; one foot and the raised hand are cropped by canvas edges","scale":"oversized and physically imposing, spanning most of the poster"},"scene":"A sunlit contemporary indoor bouldering gym with a tall off-white and pale concrete climbing wall, large geometric holds, high clerestory windows, visible clean blue sky through the upper windows, and a thick neutral crash mat below. The climber is caught at the instant of a powerful dyno move. Strong direct daylight enters from the high windows, casting crisp high-contrast shadows across the wall and climber.","camera_and_composition":"Close, low-angle wide-angle commercial sports photograph. One forceful diagonal gesture dominates, frozen movement at maximum extension, and multiple decisive edge crops. Alternate flat graphic type layers with real photographic depth; action first, type second, microcopy third.","text_regions":[{"role":"headline","text":"ASCENT","position":"behind the climber across the central and upper canvas","hierarchy":1,"visual_treatment":"huge warm-cream ultra-condensed uppercase sans-serif letters, filling more than half the canvas, cropped by outer edges and partly hidden by the climber; flat opaque ink, no logo treatment"},{"role":"editorial microcopy","text":"FIND THE HOLD / KEEP MOVING / WALL SESSION / ISSUE 01","position":"tight white editorial clusters at upper left and right edge, fixed to a strict grid","hierarchy":3,"visual_treatment":"compact, clearly legible white sans-serif microtype with fully specified copy"},{"role":"bottom information cluster","text":"BOULDER / 2026 / 04 / UPWARD MOTION","position":"bottom edge and lower right side edge","hierarchy":2,"visual_treatment":"large stacked warm-cream numerals and words, deliberately cropped at the edge, using only minimal hairline separators"},{"role":"accent mark","text":"+","position":"small mark at a lower-left grid intersection","hierarchy":3,"visual_treatment":"small generic warm-cream plus sign, never a brand logo or watermark"}],"brand_system":{"colors":["saturated cyan and sky-blue","warm cream typography","clean white microtype","deep neutral shadows","fluorescent orange only on the chalk bag and one small garment panel"],"logo":"none"},"visual_treatment":"High-contrast photoreal commercial sports photography with strong daylight and crisp shadows. Slight restrained printed grain is permitted only across the final poster surface. The environment remains blue, cream, and neutral; fluorescent orange is the sole vivid accent. Decoration is minimal: small marks, hairline rules, and separators only.","visual_integrity":{"global":["Preserve clean, continuous tonal transitions in skin, wall surfaces, shadows, and window sky without ripple-like bands, block boundaries, or dirty overlays.","Keep every photographic surface texture coherent with its material, scale, lighting, and viewing distance.","Concentrate resolved detail on the climber, chalk bag, holds, and nearest wall; allow natural detail falloff in secondary gym regions.","Use restrained local contrast and restrained sharpening on photographic regions, with clean edges and no halos or crunchy microcontrast.","Use physically plausible daylight with a single consistent direction, believable reflections, and contact shadows.","Preserve realistic skin, fabric, rubber shoe, chalk, foam mat, and climbing-hold material response instead of a universal glossy or waxy treatment.","Keep the requested printed grain subtle, irregular, and subordinate; do not introduce structured digital noise."],"scoped":[{"target":"text_regions","requirements":["Keep typography, microtype, marks, and hairline rules flat, crisp, and clean rather than photographic."]}]},"negative_constraints":["No real brand logos, real product logos, watermarks, QR codes, official badges, prices, or unprovided advertising claims.","No illustration, comic rendering, halftone, 3D rendering, dark studio treatment, soft muted palette, or small distant hero.","No unreadable gibberish text, extra posters, tiled artifacts, checkerboard artifacts, artificial glow, or visual clutter."]}
```

## Preflight checklist

- [ ] Every text block is verbatim.
- [ ] Text hierarchy, placement, and reading order are explicit.
- [ ] No headline, price, CTA, badge, or logo has been invented.
- [ ] The hero does not obscure required copy.
- [ ] The layout remains readable at the target size.
- [ ] The request is not actually a UI, collection grid, or single-frame scene.
