# ImageGen Skill

面向 Codex 的图像生成与实验性图像编辑 Skill。它不是一条固定提示词，而是一套完整工作流：先诊断请求、保留用户约束，再从 13 类结构模板中选择唯一的 Prompt 骨架，按需组合视觉噪声控制与修饰器，最后完成 Prompt 校验、图像生成和 PNG 验证。

## 核心能力

- 保留用户给出的文字、名称、事实、数字、日期、价格、颜色、数量、比例和禁止项，不擅自补写。
- 根据最终交付物选择结构模板，而不是把所有需求塞进同一种 Markdown 提示词。
- 原生支持严格 JSON、自然语言和 Markdown 三种 Prompt 格式。
- 提供 4 组可组合的视觉噪声控制，用于抑制网格、波纹、脏点、塑料感、过度锐化和编辑污染等问题。
- 提供 11 个视觉修饰维度，并带有适用范围、冲突和依赖规则。
- 支持单图生成、参考图编辑和多图系列规划。
- 优先使用当前 Codex 会话中真实可调用的图像生成工具；不可用或发生技术故障时，可使用 Node.js / Python 脚本走已配置的 Responses API 兼容端点。
- 对 Prompt、输入图片、输出路径、SSE 响应和最终 PNG 进行本地校验。

## 安装与更新

> [!IMPORTANT]
> “安装”和“更新”执行完全相同的覆盖流程：先确认本仓库中的 `imagegen/SKILL.md` 存在，再删除 `~/.codex/skills/.system/imagegen` 和 `~/.codex/skills/imagegen` 中已有的旧副本，最后把本仓库的整个 `imagegen` 文件夹复制到 `~/.codex/skills/imagegen`。如果两个位置都没有旧副本，则直接安装。

这样可以避免 `.system` 与用户目录同时存在两个同名 Skill，导致版本不确定、旧模板残留或重复触发。不要把新文件与旧目录合并，必须完整替换。

### 让 Codex 执行

下载或克隆本仓库后，可以直接对 Codex 说：

```text
请安装或更新当前仓库中的 imagegen skill。

无论这是首次安装还是更新：
1. 先确认仓库根目录下的 imagegen/SKILL.md 存在；
2. 删除 ~/.codex/skills/.system/imagegen 和 ~/.codex/skills/imagegen 中已有的旧副本，路径不存在时跳过；
3. 将仓库根目录下的整个 imagegen 文件夹复制到 ~/.codex/skills/imagegen；
4. 不要合并旧文件；
5. 完成后检查 SKILL.md、agents、prompts、references、scripts 是否齐全。
```

### Windows PowerShell

在本仓库根目录执行：

```powershell
$source = (Resolve-Path ".\imagegen" -ErrorAction Stop).Path
$skillsRoot = Join-Path $HOME ".codex\skills"
$systemCopy = Join-Path $skillsRoot ".system\imagegen"
$target = Join-Path $skillsRoot "imagegen"

if (-not (Test-Path -LiteralPath (Join-Path $source "SKILL.md"))) {
    throw "源目录不是有效的 imagegen Skill：$source"
}

if ($source -in @($systemCopy, $target)) {
    throw "请从独立下载或克隆的仓库目录执行，不能把已安装目录作为更新源。"
}

New-Item -ItemType Directory -Force -Path $skillsRoot | Out-Null

@($systemCopy, $target) | ForEach-Object {
    if (Test-Path -LiteralPath $_) {
        Remove-Item -LiteralPath $_ -Recurse -Force
    }
}

Copy-Item -LiteralPath $source -Destination $target -Recurse -Force

if (-not (Test-Path -LiteralPath (Join-Path $target "SKILL.md"))) {
    throw "安装校验失败：$target"
}

Write-Host "ImageGen 已安装到：$target"
```

### macOS / Linux

在本仓库根目录执行：

```bash
set -eu

source_dir="$(cd "./imagegen" && pwd)"
skills_root="$HOME/.codex/skills"
system_copy="$skills_root/.system/imagegen"
target="$skills_root/imagegen"

test -f "$source_dir/SKILL.md"

if [ "$source_dir" = "$system_copy" ] || [ "$source_dir" = "$target" ]; then
  printf '%s\n' '请从独立下载或克隆的仓库目录执行，不能把已安装目录作为更新源。' >&2
  exit 1
fi

mkdir -p "$skills_root"
rm -rf -- "$system_copy" "$target"
cp -R "$source_dir" "$target"
test -f "$target/SKILL.md"

printf 'ImageGen 已安装到：%s\n' "$target"
```

安装完成后建议开启一个新的 Codex 任务；如果 Skill 未出现在可用列表中，再重启 Codex。

## 快速开始

显式调用：

```text
使用 $imagegen 生成一张 1:1 的护肤品主视觉。
瓶身标签必须准确显示“LUMINA”，背景保持干净的浅灰色，
不要添加价格、认证标识或未提供的宣传语。
```

参考图编辑：

```text
使用 $imagegen 编辑我附加的产品图。
只移除瓶盖左侧的强反光，保留瓶身文字、颜色、比例、背景和阴影，
不要重新设计包装。
```

多图系列：

```text
使用 $imagegen 规划并生成 3 张独立的 9:16 户外广告图。
三张图保持同一产品、品牌色和标题字样，但场景分别为清晨、正午和夜晚。
```

`agents/openai.yaml` 已允许隐式触发，但在需要确定使用本 Skill 时，推荐明确写出 `$imagegen`。

## 工作流程

1. **诊断请求**：判断是单图生成、参考图编辑还是多输出任务；复杂请求会进入双重独立诊断流程。
2. **提取请求合同**：记录用途、受众、主体、精确文字、事实、数量、布局、风格、尺寸、禁止项和编辑边界。
3. **选择结构模板**：从 13 个互斥结构家族中选择一个；编辑加系列任务会拆成两个阶段。
4. **选择原生格式**：根据可验证性使用 JSON、自然语言或 Markdown，不为了统一外观强制转换格式。
5. **组合视觉控制**：先选择视觉噪声控制，再只加载真正需要的修饰维度。
6. **语义与结构审查**：检查事实、数量、文字、布局、保存边界、冲突、占位符和 JSON 语法。
7. **执行一次授权生成**：内置工具优先；回退脚本只负责一次命令，并最多进行一次符合条件的技术重试。
8. **验证并报告**：校验 PNG 签名与尺寸，检查可见污染或误编辑，报告真实限制后停止。

详细规则见 [`imagegen/SKILL.md`](imagegen/SKILL.md)。

## 13 类结构模板

| 模板 | 适用场景 |
| --- | --- |
| [`single-frame-scene`](imagegen/prompts/single-frame-scene.md) | 单帧摄影、插画、动漫场景、环境画面或产品主视觉 |
| [`commercial-copy-layout`](imagegen/prompts/commercial-copy-layout.md) | 海报、缩略图、社交卡片、广告及文案层级主导的商业视觉 |
| [`nonsequential-collection-grid`](imagegen/prompts/nonsequential-collection-grid.md) | 贴纸表、产品目录、独立概念或无叙事顺序的多格集合 |
| [`sequential-comic-storyboard`](imagegen/prompts/sequential-comic-storyboard.md) | 漫画、分镜和需要阅读顺序、因果关系及角色连续性的画面 |
| [`character-asset-reference`](imagegen/prompts/character-asset-reference.md) | 角色转面、表情、姿势、服装和可复用资产参考板 |
| [`infographic-chart-explainer`](imagegen/prompts/infographic-chart-explainer.md) | 信息图、图表、时间线、流程、比较和知识解释 |
| [`technical-annotated-diagram`](imagegen/prompts/technical-annotated-diagram.md) | 爆炸图、装配图、剖面图、零件图及引线标注；当前为 provisional |
| [`map-spatial-guide`](imagegen/prompts/map-spatial-guide.md) | 地图、路线、园区导览、空间分区、地标和图例；当前为 provisional |
| [`print-document-form`](imagegen/prompts/print-document-form.md) | 表单、账单、证书、工作表及固定纸张字段结构 |
| [`ui-page-mockup`](imagegen/prompts/ui-page-mockup.md) | App、网站、落地页、产品页、直播界面和仪表盘 |
| [`brand-design-system`](imagegen/prompts/brand-design-system.md) | 品牌识别板、视觉系统、包装家族、周边和应用规范 |
| [`reference-image-edit`](imagegen/prompts/reference-image-edit.md) | 移动、移除、替换、添加、合成、保留身份或风格转换 |
| [`multi-image-series`](imagegen/prompts/multi-image-series.md) | 多个独立文件、页面或幻灯片共享统一约束；当前为 provisional |

每个模板包含适用边界、必要输入、默认格式、合法骨架、字段说明、写作规则、来源示例和检查清单。模板中的来源示例只用于证明结构，不应直接复制成用户 Prompt。

## Prompt 控制系统

### 视觉噪声控制

入口：[`imagegen/prompts/visual-noise-control/INDEX.md`](imagegen/prompts/visual-noise-control/INDEX.md)

| 控制 | 作用 |
| --- | --- |
| [`image-integrity`](imagegen/prompts/visual-noise-control/image-integrity.md) | 默认抑制非预期网格、波纹、色块、脏点和过度处理 |
| [`photographic-rendering`](imagegen/prompts/visual-noise-control/photographic-rendering.md) | 约束可信的光学、光照、材质、景深、肤质和色彩 |
| [`clean-rendering`](imagegen/prompts/visual-noise-control/clean-rendering.md) | 保持纯净背景、平滑色域、清晰边缘和干净负空间 |
| [`edit-integrity`](imagegen/prompts/visual-noise-control/edit-integrity.md) | 限制编辑范围、保护未修改区域并清理编辑伪影 |

这些控制可以组合，也可以只作用于 Prompt 中已经定义的角色或区域。用户明确要求的胶片颗粒、纸张纤维、旧化、半色调、织物纹理等内容不会被全局“清理”规则误删。

### 视觉修饰器

入口：[`imagegen/prompts/modifiers/INDEX.md`](imagegen/prompts/modifiers/INDEX.md)

共 11 个维度：

- 媒介与风格
- 镜头与取景
- 光照与阴影
- 色彩与色调
- 材质与纹理
- 构图倾向
- 字体与图形处理
- 年代、地域与文化语言
- 氛围与视觉效果
- 质量与技术控制
- 负面约束

修饰器只负责视觉细化，不能替代主体、事实、精确文字、布局、编辑动作或输出要求。每个条目都记录适用范围、强度、冲突、依赖、极性和来源。

## 运行环境

- 首选 Node.js 18 或更高版本：`imagegen/scripts/imagegen.mjs`
- Node.js 不可用或版本过低时，使用 Python 3.8 或更高版本：`imagegen/scripts/imagegen.py`
- 两个运行时均不要求安装第三方依赖。
- Prompt 文件必须是严格 UTF-8、无 BOM；包含中文等非 ASCII 内容时，只通过 `--prompt-file` 传入。
- 默认输出目录为当前工作目录下的 `outputs/`。

### 命令

以下示例使用 Node.js；改用 Python 时将命令头替换为 `python imagegen/scripts/imagegen.py`。

```bash
# 检查运行环境和配置
node imagegen/scripts/imagegen.mjs preflight

# 只检查 Prompt，不发起网络请求
node imagegen/scripts/imagegen.mjs prompt-check \
  --prompt-file ./prompt.json \
  --mode generate

# 检查完整请求形状，但不发起网络请求
node imagegen/scripts/imagegen.mjs generate \
  --prompt-file ./prompt.json \
  --size 1024x1024 \
  --out-dir ./outputs \
  --dry-run

# 生成
node imagegen/scripts/imagegen.mjs generate \
  --prompt-file ./prompt.json \
  --size 1024x1024 \
  --out-dir ./outputs

# 编辑；多个输入图按 --image 的顺序传入
node imagegen/scripts/imagegen.mjs edit \
  --prompt-file ./edit-prompt.md \
  --image ./input-1.png \
  --image ./input-2.webp \
  --size auto \
  --out-dir ./outputs

# 验证已有 PNG
node imagegen/scripts/imagegen.mjs verify \
  --file ./outputs/result.png
```

`prompt-check` 只做结构校验，返回的 `semantic_review_required: true` 表示仍需人工或 Agent 完成语义审查。`--dry-run` 不是生成结果。

### 支持尺寸

| 方向或比例 | 参数 |
| --- | --- |
| 未指定或无法可靠映射 | `auto` |
| 1:1 | `1024x1024` |
| 2:3 竖图 | `1024x1536` |
| 3:2 横图 | `1536x1024` |
| 9:16 竖图 | `941x1672` |
| 16:9 横图 | `1672x941` |

不应为了匹配尺寸而擅自裁剪；没有清晰映射时使用 `auto`。

## 回退 API 配置

只有在使用仓库内的 Node.js / Python 回退脚本时，才需要配置这一部分。脚本只读取 `~/.codex/config.toml` 中当前 `model_provider` 对应的配置：

```toml
model_provider = "your_provider"

[model_providers.your_provider]
base_url = "https://your-compatible-provider.example"
experimental_bearer_token = "replace-with-your-token"
```

运行时会请求：

```text
{base_url}/backend-api/codex/responses
```

该回退路径要求服务端兼容本 Skill 的流式 Responses 请求和 `image_generation` 工具约定，并固定使用脚本中声明的模型与请求结构。不要假设任意 OpenAI API Key、普通 REST 端点或第三方服务都能直接兼容；先执行 `preflight` 和 `--dry-run`，再进行真实请求。

> [!CAUTION]
> 不要提交真实的 `experimental_bearer_token`，不要在问题、日志、截图或 Prompt 中泄露令牌。运行时会尽量隐藏令牌、授权头、完整配置和完整 Prompt，但仓库发布者仍应自行检查提交内容。

## 编辑限制

- 回退 API 的图片编辑路径是实验性能力。
- 一次接受 1–16 张 PNG、JPEG 或 WebP，单个文件最大 50 MiB。
- 输入图顺序会被保留，Prompt 文本位于所有输入图片之后。
- 不应在没有真实服务商测试的情况下宣称第三方编辑兼容。
- 不承诺无损编辑、完全无伪影或绝对保持所有像素；完成后必须检查输出并如实报告限制。

## 项目结构

```text
.
├── README.md
└── imagegen/
    ├── SKILL.md
    ├── agents/
    │   └── openai.yaml
    ├── prompts/
    │   ├── *.md
    │   ├── modifiers/
    │   └── visual-noise-control/
    ├── references/
    │   ├── prompt-system.md
    │   ├── request-diagnosis.md
    │   └── runtime-contract.md
    └── scripts/
        ├── imagegen.mjs
        └── imagegen.py
```

## 设计原则

- 用户提供的内容优先于模板、控制项和默认值。
- 不发明品牌、产品、人物、标签、文案、路线、部件、UI 内容或私有意图。
- 一个 Prompt 只选择一个结构家族，除非编辑与多图系列明确拆成两个阶段。
- JSON 保持为严格 JSON；自然语言和 Markdown 只在各自适合的场景使用。
- 视觉控制按实际角色限定范围，不使用空泛的 `8K`、`masterpiece`、`HDR` 等质量词堆叠。
- 不使用 SVG、HTML、Canvas、Pillow 或程序绘图伪造图像生成结果。
- 不通过回退路由绕过安全、内容、权限或政策拒绝。
- 每次用户授权只执行一次生成或编辑命令；失败后不会自动换运行时、改 Prompt 或重新发起另一轮。

## 本地验证

准备真实生成前，可使用同一份有效 Prompt 分别检查两个运行时：

```bash
node imagegen/scripts/imagegen.mjs prompt-check \
  --prompt-file ./your-prompt.md \
  --mode generate

python imagegen/scripts/imagegen.py prompt-check \
  --prompt-file ./your-prompt.md \
  --mode generate
```

`prompt-check` 不会发起真实图像 API 请求。修改 `SKILL.md`、目录结构或元数据后，还应使用 Codex 的 `skill-creator` 快速验证器检查 frontmatter、Skill 名称和目录规范。
