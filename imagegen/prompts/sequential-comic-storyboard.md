# Sequential Comic and Storyboard Template

## Purpose and use cases

Use for comic pages, four-panel comics, storyboards, and other single-canvas narratives with explicit reading order, causality, dialogue, and character continuity.

## Routing boundaries

- Panels must express ordered story beats.
- Route to `nonsequential-collection-grid` when slots have no causal or reading sequence.
- Route to `character-asset-reference` when the output only compares views, poses, or expressions.
- Route to `multi-image-series` when the deliverable consists of separate pages or files.

## Required inputs

- Panel count, layout, and reading direction.
- Beginning, development, turn, and ending.
- Character identity anchors and cross-panel continuity.
- Scene, action, expression, dialogue, and sound effects for every panel.
- Page title, aspect ratio, style, and prohibitions.

## Default native format

Use JSON by default. The `panels` array length must equal the declared panel count.

## Prompt structure

```json
{
  "type": "sequential comic or storyboard",
  "page": {
    "panel_count": 4,
    "layout": "<rows and columns>",
    "reading_direction": "<reading direction>",
    "title": "<verbatim title>"
  },
  "character_anchors": [
    {
      "id": "<character id>",
      "identity": "<fixed traits>"
    }
  ],
  "panels": [
    {
      "panel": 1,
      "story_beat": "<narrative function>",
      "scene": "<scene>",
      "action": "<action>",
      "characters": ["<character id>"],
      "dialogue": ["<verbatim dialogue>"],
      "sound_effects": ["<verbatim sound effect>"]
    }
  ],
  "continuity_constraints": ["<cross-panel invariant>"],
  "output": {
    "aspect_ratio": "<ratio>",
    "size": "<size or auto>"
  }
}
```

## Field guidance

- State each panel's narrative function instead of listing visuals alone.
- Keep dialogue, narration, and sound effects separate.
- Preserve clothing, props, injuries, time, and spatial state across panels.
- Stop when the panel count and array disagree; do not silently remove story beats.

## Writing guidance

- Define story beats before adding scene detail.
- Repeat character anchors instead of relying on the model to infer continuity.
- Load only relevant medium, composition, typography, atmosphere, and negative-constraint modifiers.
- Keep promotional comics in this family when narrative continuity remains the primary contract.

## Verbatim source Prompt examples

### Example 1

- `entry_id`: `all-070`
- Source title: `漫画 / 故事板 - 温馨四格夫妻漫画`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-070 -->
```json
{"type":"四格浪漫漫画插画","style":"干净的手绘动漫线条，采用温暖的米色和浅棕色单色调，奶油色背景，简约阴影，营造舒适温柔的氛围，具有社交媒体帖子的美感","format":"方形 2x2 漫画布局，带有细棕色边框","headline":{"text":"{argument name=\"headline text\" default=\"夫妇の日\"}","position":"顶部居中","decorations":{"count":2,"items":["左侧小爱心","右侧小爱心"]}},"panels":[{"panel":1,"count":2,"scene":"年轻夫妻的站立肖像","composition":"丈夫站在妻子身后，一只手搭在她的肩上，两人神情平静且充满爱意","characters":[{"role":"man","appearance":"凌乱的浅棕色头发，戴眼镜，奶油色连帽衫，身材高挑纤细"},{"role":"woman","appearance":"浅棕色头发扎成松散的低发髻，几缕发丝垂在脸侧，白色长袖衬衫，暖棕色针织背心，可见肩包背带"}],"text":["今日は","夫婦の日！"],"decorations":{"count":3,"items":["小爱心","小爱心","小爱心"]}},{"panel":2,"count":2,"scene":"夫妻在室内坐在一起，手持马克杯，相视而笑","characters":[{"role":"man","appearance":"同样的眼镜和连帽衫，手持柔和的绿色马克杯"},{"role":"woman","appearance":"同样的发型和装束，手持浅色马克杯"}],"speech_bubble":{"speaker":"man","text":"いつもありがとう。 一緒にいられることが、 いちばんの幸せだよ。"},"decorations":{"count":4,"items":["小闪光","小闪光","小圆点簇","小圆点簇"]}},{"panel":3,"count":2,"scene":"夫妻在厨房一起做饭，两人都在搅拌锅里的食物","background":"简单的架子和盆栽，以柔和的草图细节呈现","characters":[{"role":"man","appearance":"同样的眼镜和连帽衫"},{"role":"woman","appearance":"同样的发髻和叠穿装束"}],"speech_bubble":{"speaker":"man","text":"これからも、 笑い合って、支え合って、 一緒にいろんな景色を 見ていこうね。"}},{"panel":4,"count":2,"scene":"亲密的拥抱，丈夫亲吻妻子的额头，同时扶着她的肩膀","characters":[{"role":"man","appearance":"同样的眼镜和连帽衫"},{"role":"woman","appearance":"同样的发型和装束，靠在他怀里"}],"speech_bubble":{"speaker":"man","text":"大好きだよ。 これからも、 よろしくね！"},"decorations":{"count":3,"items":["小爱心","小爱心","小爱心"]}}],"footer":{"text":"{argument name=\"footer text\" default=\"いつもそばにいてくれて、ありがとう。\"}","position":"底部居中","decorations":{"count":1,"items":["小爱心"]}},"character_design":{"count":2,"items":[{"role":"husband","hair color":"{argument name=\"hair color\" default=\"light brown\"}","expression":"和蔼、温柔、深情"},{"role":"wife","hair color":"{argument name=\"hair color\" default=\"light brown\"}","expression":"温柔微笑、充满爱意、略带羞涩"}]},"rendering_notes":"保持所有文字为日文手写体，使用大量留白，保留夫妻纪念帖所需的甜蜜氛围，线条处理应略显随性，呈现草图感而非精细墨线"}
```
<!-- SOURCE_PROMPT_END:all-070 -->

### Example 2

- `entry_id`: `all-081`
- Source title: `漫画 / 故事板 - 8 格 GPT-Image-2 漫画宣传页`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-081 -->
```json
{"type":"8 格漫画风格宣传页","theme":"GPT-Image-2 发布公告","language":"葡萄牙语","style":{"rendering":"黑白漫画，带有网点阴影、速度线、光泽高光、粗线条勾勒，干净的数字漫画质感","mood":"令人兴奋、信息丰富、乐观、科技感强","page_format":"单页，分为 8 个矩形格子，采用 2 列 4 行网格布局，带有细边框"},"characters":[{"id":"host girl","role":"主要主持人","appearance":"可爱的动漫女孩，留着长长的深色头发，大而有神的眼睛，穿着印有 OpenAI 结形标志的深色连帽衫","count":1},{"id":"robot mascot","role":"友好的助手吉祥物","appearance":"小型圆形机器人，黑色面部屏幕，发光的眼睛，简单的白色身体，细小的手臂，表情欢快","count":1},{"id":"creator group","role":"受众示例","appearance":"4 位不同的年轻创作者：一位设计师、一位拿着平板电脑的开发者、一位拿着相机的摄影师、一位穿着连帽衫带着笔记本电脑的人","count":4}],"layout":{"sections":[{"title":"CHEGOU! GPT-IMAGE-2","position":"左上","count":1,"description":"戏剧性的英雄登场格，动漫女孩向观众伸出一只手，身后有放射状速度线","text":["CHEGOU!","GPT-IMAGE-2","A NOVA GERAÇÃO DE IMAGENS POR IA DA OPENAI!","MAIS CRIATIVIDADE, MAIS PRECISÃO, MAIS POSSIBILIDADES!"]},{"title":"O QUE É O GPT-IMAGE-2?","position":"右上","count":1,"description":"女孩半身姿势，指向星空科技背景上发光的图像图标","text":["O QUE É O GPT-IMAGE-2?","É nosso novo modelo de geração de imagens, mais inteligente, mais fiel ao que você imagina e com qualidade surpreendente!"]},{"title":"MAIS REALISMO. MAIS DETALHES.","position":"中左（第 2 行）","count":1,"description":"对比格，并排展示 2 张山地湖泊风景图，左侧标注为旧模型，右侧标注为具有更丰富真实感的新模型","subsections":[{"label":"ANTES (DALL·E 3)","count":1},{"label":"AGORA (GPT-IMAGE-2)","count":1}],"text":["MAIS REALISMO. MAIS DETALHES.","ANTES (DALL·E 3)","AGORA (GPT-IMAGE-2)","TEXTURAS MAIS RICAS, LUZ MAIS NATURAL, DETALHES INCRÍVEIS!"]},{"title":"COMPREENSÃO MELHOR, RESULTADOS MELHORES.","position":"中右（第 2 行）","count":1,"description":"女孩双手合十，旁边是一个带框的提示词示例，机器人吉祥物指向斜上方","text":["COMPREENSÃO MELHOR, RESULTADOS MELHORES.","O GPT-IMAGE-2 entende melhor objetos, textos, composições e instruções complexas!","EXEMPLO DE PROMPT:","\"Uma cafeteria futurista no topo de uma montanha nevada ao entardecer, com letreiro de néon ‘CAFÉ DO AMANHÃ’ e pessoas tomando café.\""]},{"title":"CRIATIVIDADE SEM LIMITES.","position":"下左（第 3 行）","count":1,"description":"女孩在 2x2 的 4 种艺术生成变体展示图旁进行讲解","subsections":[{"label":"gothic castle scene","count":1},{"label":"modern city street at night","count":1},{"label":"anime character portrait","count":1},{"label":"abstract geometric composition","count":1}],"text":["CRIATIVIDADE SEM LIMITES.","De estilos artísticos a layouts profissionais, do realista ao abstrato: suas ideias, do seu jeito!"]},{"title":"TEXTO NA IMAGEM? AGORA É MUITO MELHOR!","position":"下右（第 3 行）","count":1,"description":"机器人吉祥物展示海报排版的对比效果，两张设计之间有一个粗箭头","subsections":[{"label":"ANTES","count":1},{"label":"AGORA","count":1}],"text":["TEXTO NA IMAGEM? AGORA É MUITO MELHOR!","Geração de texto mais precisa, legível e integrada ao design!","ANTES","AGORA","AVENTURA COMEÇA AQUI","A AVENTURA COMEÇA AQUI"]},{"title":"PARA TODOS OS CRIADORES.","position":"左下","count":1,"description":"合影，主持人女孩与 4 位代表不同职业的创作者并排站立","text":["PARA TODOS OS CRIADORES.","Designers, desenvolvedores, educadores, marketers, artistas e curiosos: todo mundo pode criar mais e melhor!"]},{"title":"GPT-IMAGE-2 JÁ ESTÁ DISPONÍVEL!","position":"右下","count":1,"description":"结尾英雄格，女孩眨眼并竖起大拇指，机器人吉祥物在旁，伴有明亮的庆祝光芒和闪光","text":["GPT-IMAGE-2 JÁ ESTÁ DISPONÍVEL!","IMAGINE. CRIE. INSPIRE.","O FUTURO DA CRIAÇÃO É AGORA. ❤"]}],"panel_count":8},"composition":{"reading_order":"从左到右，从上到下","camera_variety":"混合了特写英雄镜头、中景主持人镜头、对比图表和群体合影","graphic_elements":["对话气泡","带有白色大写字母的圆形黑色标题横幅","闪光","速度线","星空科技背景","对比箭头","带框示例卡片"]},"text_style":"葡萄牙语全大写漫画字体，粗体标题，清晰的对话气泡，宣传信息图与漫画的混合风格","quality":"高分辨率编辑漫画海报，清晰的排版，平衡的格子间距，强烈的对比度","prompt":"创建一个灰度漫画风格的 8 格宣传漫画页，用于发布 {argument name=\"product name\" default=\"GPT-IMAGE-2\"}。使用单页 2 列 4 行布局，包含 8 个不同的格子，全文使用葡萄牙语。主角为一名开朗的动漫女孩，留着 {argument name=\"hair color\" default=\"深棕色\"} 长发，穿着印有 OpenAI 标志的深色连帽衫，以及一个友好的小型机器人吉祥物。第 1 格：戏剧性的发布揭幕，女孩向镜头伸出手，放射状速度线，标题 \"CHEGOU! {argument name=\"headline name\" default=\"GPT-IMAGE-2\"}\" 以及关于新一代 AI 图像的发布文案。第 2 格：解释性格子，女孩指向星空数字背景上发光的图像图标，标题 \"O QUE É O GPT-IMAGE-2?\"，对话气泡描述其为更智能的图像生成模型。第 3 格：真实感对比，包含 2 张并排的山地湖泊风景图，分别标注 \"ANTES (DALL·E 3)\" 和 \"AGORA (GPT-IMAGE-2)\"。第 4 格：理解力提升格，女孩和机器人，包含一个带框的提示词示例，使用 {argument name=\"example prompt\" default=\"Uma cafeteria futurista no topo de uma montanha nevada ao entardecer, com letreiro de néon ‘CAFÉ DO AMANHÃ’ e pessoas tomando café.\"}。第 5 格：创意展示，包含 4 个缩略图：哥特式城堡、夜间城市街道、动漫角色肖像、抽象几何艺术。第 6 格：文本渲染对比，包含 2 个海报变体，标注 \"ANTES\" 和 \"AGORA\"，展示改进后的排版，对比 \"AVENTURA COMEÇA AQUI\" 的原始与修正版本。第 7 格：受众格，4 位来自不同领域的创作者站在一起。第 8 格：最终庆祝行动号召，女孩眨眼并竖起大拇指，机器人吉祥物欢呼，结尾标语为 {argument name=\"closing slogan\" default=\"IMAGINE. CRIE. INSPIRE.\"}。页面需充满活力、精致、高度易读，带有粗黑色标题栏、白色大写字母、对话气泡、闪光、网点阴影以及强烈的漫画宣传海报美学。"}
```
<!-- SOURCE_PROMPT_END:all-081 -->

### Example 3

- `entry_id`: `all-086`
- Source title: `漫画 / 故事板 - Moon Mark 冒险漫画页面`
- Native format: JSON

<!-- SOURCE_PROMPT_START:all-086 -->
```json
{"type":"四格动漫漫画页面","style":"可爱的奇幻漫画插图，精致的 gpt-image-2 动漫渲染，色彩鲜艳，线条清晰，柔和的绘画式阴影，奇幻的魔法氛围","page":{"background":"白色页面，黑色边框","title":"{argument name=\"headline text\" default=\"月之印记大冒险\"}","title_position":"顶部居中","decorations":["标题周围有金色小火花","标题右侧有新月图标"],"panel_count":4,"reading_direction":"从上到下"},"character":{"appearance":"年轻的动漫少女冒险家，留着长长的波浪形银发，皮肤白皙，大而有神的眼睛，身材苗条","outfit":["带有荷叶边装饰的黑白奇幻连衣裙","新月发饰","新月项圈","露肩袖","棕色皮质背包","深色过膝袜"],"theme":"服装和道具中贯穿月亮主题"},"panels":[{"position":"顶部","scene":"蓝天白云下的阳光山间小径和草地，右侧是森林，蜿蜒的小路通向远方，左侧有一个木制路标","action":"少女站在那里，拿着并阅读一张古老的藏宝图，面向前方","props":["古老的地图","木制路标","背包"],"text":{"sign":"冒险的开始","speech":"{argument name=\"panel 1 speech\" default=\"发现地图了！今天是大冒险！\"}"}},{"position":"中上","scene":"郁郁葱葱的丛林遗迹入口，黑暗的洞穴口由刻有新月符号并覆盖着藤蔓的古老石柱构成","action":"少女从后方四分之三视角小心翼翼地靠近，同时阅读着地图","props":["地图","废弃的洞穴入口","茂密的植物"],"text":{"speech":"{argument name=\"panel 2 speech\" default=\"宝藏应该就在前面……！\"}","sound_effect":"沙沙声"}},{"position":"中下","scene":"洞穴遗迹内部，光线昏暗，中央有一个石祭坛或解谜台","action":"少女跪在点亮的灯笼旁，伸手去触碰一个解谜装置，而不是旁边的锁孔，一只圆滚滚的黑色猫咪吉祥物在旁边注视着","props":["发出温暖光芒的灯笼","刻有圆形符号的石制解谜板","桌上的小金钥匙","带有新月标记和珠子项圈的黑猫生物"],"text":{"speech":"{argument name=\"panel 3 speech\" default=\"不是钥匙，而是要解开机关！\"}","sound_effect":"闪光"}},{"position":"底部","scene":"宝藏室，洞穴墙壁上镶嵌着水晶，周围漂浮着火花","action":"少女闭着眼睛，在打开的宝箱旁灿烂地微笑，举起一张纸质邀请函","props":["带有新月徽章的打开的木制宝箱","宝箱内发光的指南针","写着“通往下一场冒险”的纸卡","蓝色和紫色的水晶"],"text":{"speech":"{argument name=\"panel 4 speech\" default=\"宝藏是……通往下一场冒险的邀请函！\"}","tag":"未完待续？"}}]}
```
<!-- SOURCE_PROMPT_END:all-086 -->

## Preflight checklist

- [ ] Panel count and panel array length agree.
- [ ] Reading direction and story beats are explicit.
- [ ] Character, clothing, props, and time state remain continuous.
- [ ] Dialogue, narration, and sound effects remain verbatim.
- [ ] A nonsequential collection has not been rewritten as a story.
- [ ] A multi-page request has not been reduced to one comic canvas.
