# NOTICE · 来源、署名与免责声明

## 1. 这是什么

本仓库把 [keleus/deepseek-pet](https://github.com/keleus/deepseek-pet) 的角色素材，
重新合成为 **Codex 桌面端原生桌宠** 可识别的雪碧图格式，方便直接使用。

这**不是**上游项目的官方移植，也不是 Codex / OpenAI 的官方作品。

## 2. 上游来源与许可

| 项 | 内容 |
| --- | --- |
| 仓库 | https://github.com/keleus/deepseek-pet |
| 许可 | MIT License |
| 版权 | Copyright (c) 2026 keleus <jen.hs@outlook.com> |
| 固定版本 | commit `65d02e17097a5b34ee52cf985657b37989a5ca34`（main，2026-09-27） |
| 贡献者 | keleus、chs、makuralymi、AetherNo2332 |

上游许可全文见 [LICENSE-upstream](./LICENSE-upstream)。按 MIT 的要求，
本仓库保留了原始版权声明与许可全文。

**本仓库所用的全部角色图像素材均来自上游仓库**，包含：
`src/client/assets/*.webp`（30 张透明姿势图，420×420）。

## 3. 本仓库做了哪些改动（衍生作品说明）

- 把上游的静态姿势图缩放、合成、重排为 `1536×2288`、8 列 × 11 行的图集
  （单元格 192×208），即 `pets/deepseek/spritesheet.png`；
- 在静态图上叠加呼吸、摆动、挤压、位移等几何变换，以凑齐 Codex 要求的每行动画帧数；
- 新增 `pet.json` 清单、生成与校验脚本、安装脚本与预览页。

**没有**使用上游的任何源代码。上游是 DeepSeek Harness 的 Web 插件，
本仓库是面向 Codex 的全新适配层。

图集是上游素材的**衍生作品**，其版权仍归上游作者及贡献者所有，
在本仓库中继续适用上游的 MIT 许可。本仓库新增的脚本与文档由本仓库作者以 MIT 许可发布。

## 4. 商标声明

- **DeepSeek** 及相关标识（角色所使用的蓝鲸标志、马克杯与笔记本上的图案）
  是杭州深度求索人工智能基础技术研究有限公司的商标。
- **Codex**、**OpenAI** 是 OpenAI 的商标。

MIT 许可**不授予商标权**。本仓库对上述名称与标识的使用属于描述性 / 指明来源的合理使用，
不代表任何形式的授权、合作或背书。

## 5. 免责声明

- 本项目为**非官方**粉丝作品，与 DeepSeek、OpenAI 均无关联，未获其授权或认可。
- 上游未说明素材的创作方式。若素材由 AI 图像模型生成，其可版权性与可授权性在
  不同司法辖区存在不确定性，本仓库无法对此作出保证。
- 若你是权利人，认为本仓库侵犯了你的权益，请提 Issue 或联系仓库作者，我们会
  立即下架相关内容。

## 6. 转载 / 二次分发须知

再分发时请一并保留：本 NOTICE、[LICENSE](./LICENSE) 与 [LICENSE-upstream](./LICENSE-upstream)，
并保留对 keleus 及上游贡献者的署名。

---

# NOTICE (English)

This repository re-composes character art from
[keleus/deepseek-pet](https://github.com/keleus/deepseek-pet) into the spritesheet format
used by the **Codex desktop app's built-in pets**, so it can be used as a custom pet.

- **Upstream**: https://github.com/keleus/deepseek-pet — MIT License,
  Copyright (c) 2026 keleus <jen.hs@outlook.com>, pinned at commit
  `65d02e17097a5b34ee52cf985657b37989a5ca34`.
- **All character artwork originates from the upstream repository.**
  This project only rescales, repositions and re-times it into a `1536x2288`
  8-column x 11-row atlas, and adds a small amount of procedural motion
  (breathing, sway, squash, offset) so each animation row has the required frame count.
- **No upstream source code is used.** Upstream is a DeepSeek Harness web plugin;
  this is a separate adapter for Codex.
- The atlas is a **derivative work** of upstream artwork and remains subject to the
  upstream MIT License. New scripts and docs in this repository are MIT licensed.

**Trademarks.** "DeepSeek" and its logos are trademarks of Hangzhou DeepSeek.
"Codex" and "OpenAI" are trademarks of OpenAI. The MIT License grants no trademark
rights; references here are descriptive only and imply no affiliation or endorsement.

**Disclaimer.** This is an unofficial fan project, not affiliated with or endorsed by
DeepSeek or OpenAI. Upstream does not document how the artwork was produced; if it was
AI-generated, its copyrightability and licensability vary by jurisdiction and cannot be
guaranteed here. Rights holders may open an issue to request removal, and we will comply.
