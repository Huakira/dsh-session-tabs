# dsh-session-tabs

> 个人自用插件，代码和文档由 AI 参与编写，不承诺维护。使用前请先备份 DSH 配置。

DeepSeek Harness（DSH Web GUI）的会话标签页插件：在会话标题上方加一条浏览器式标签条，可在多个会话之间快速切换。默认把当前会话作为第一个标签页。

## 功能

- **顶部标签条**：矮小独立行，位于会话标题上方，横向居中；磨砂玻璃风格
- **状态点**：每个标签带状态指示（红=出错 / 橙=待交互 / 蓝=运行中带脉冲 / 绿=完成未读），配色与官方会话库一致
- **自动跟随**：切换会话时自动把它加入标签条；关闭当前标签自动切到相邻标签
- **标题同步**：显示会话最新标题（支持改名后同步），超长自动省略号
- **设置开关**：设置 → 插件 → 会话标签页 → "启用会话标签页"，改完点保存即时生效
- **入口**：侧栏会话行 hover 按钮和 "..." 菜单里的"在标签页中打开"

## 安装

在 DSH profile 的 `package.json` 依赖里加：

```json
"@huakirax/session-tabs": "^1.3.0"
```

并在 profile 的 `cordis.patch.yml` 加一行：

```yaml
- id: session-tabs
  name: "@huakirax/session-tabs"
  config:
    enabled: true
```

重启 DSH web 后生效。

## 依赖

- `@deepseek-ai/schemastery`（安装时自动拉取）

AI-assisted. MIT License. 个人自用，使用前请先备份。
