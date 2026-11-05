# 个人简历项目

这是一个纯前端的个人简历展示项目，采用 Vue 2 + Element UI 构建，支持简历信息加密展示、访问校验、PDF/图片导出等功能。

[DEMO](https://chenglong.fj.cn) 作为演示可以输入 `hr@example.com` 查看到 `resume_data.json` 里面信息的显示效果。

此项目的页面样式和部分功能实现使用了AI辅助（阿里千问），但整个方案是自己写的……防止别有用心之人在文件中查到AI水印。

## 功能概览

- 个人信息、求职期望、工作经历、项目经历、教育经历等内容展示
- 访问权限验证：页面会要求输入求职者邮箱，只有校验通过后才显示简历内容
- 数据加密：原始简历数据保存在 `resume_data.json`，运行脚本后会生成按邮箱命名的加密文件
- 导出能力：支持一键保存为 PDF 和图片
- 响应式布局：适配桌面端与移动端浏览器
- 适合用于候选人简历分享、内部招聘筛选等场景

## 项目结构

```text
resume/
├── README.md
├── index.html             # 简历页面入口
├── encrypt_resume.js      # 加密脚本
├── resume_data.json       # 原始简历 JSON 数据
└── resume/
    └── <md5(email)>.json # 生成的加密简历文件
```

## 运行方式

由于页面通过 `fetch('/resume/<md5>.json')` 方式加载加密数据，建议使用本地 HTTP 服务方式打开，而不是直接双击打开 `index.html`。

### 1. 准备原始数据

编辑 `resume_data.json`，填写你的简历内容。示例字段包括：

- `basic` 个人基础信息
- `lastUpdated` 简历最后更新的时间
- `siteName` 存放WEB简历的网站名称
- `siteUrl` 存放WEB简历的网站地址
- `title` 网站标题
- `contact` 联系方式，我这边默认微信、钉钉等使用相同的手机号
- `skills` 技能列表，百分制，但只用五颗星表示
- `work` 工作经历
- `education` 教育经历
- `training` 培训经历
- `projects` 项目经历

### 2. 生成加密数据

使用脚本为指定邮箱地址生成对应的加密文件保存到 `resume/` 目录下：

```bash
# 默认：自动读取 resume_data.json
node encrypt_resume.js hr@example.com

# 指定自定义源文件（相对路径）
node encrypt_resume.js hr@example.com --file ./resume_data.json

# 指定自定义源文件（绝对路径）
node encrypt_resume.js hr@example.com --file /path/to/resume_data.json
```

如果没有传入 `--file` 参数，脚本会默认读取当前项目根目录下的 `resume_data.json`。

用这个加密方案，你可以用多个不同的邮箱生成多份内容不同的简历。

### 3. 架设网站

将`index.html`和`resume/`目录下生成的内容，直接上传到需要展示简历信息的目录中。

推荐可以用腾讯云的EdgeOne Pages、阿里云的OSS、Cloudflare Worker、netlify、Vercel等应用托管平台部署，然后绑定你需要的域名。

通过域名地址访问页面，输入匹配的邮箱后页面会自动解密并展示简历的内容。

## encrypt_resume.js 使用说明

`encrypt_resume.js` 是整个项目的关键脚本，作用是把原始简历数据加密成前端可以直接读取的 JSON 文件。

### 命令格式

```bash
node encrypt_resume.js <目标邮箱地址> [--file <path>]
```

其中：

- `--file` 可选参数：指定需要加密的 JSON 文件
- 不传 `--file` 时，默认使用 `resume_data.json`
- `path` 支持相对路径与绝对路径

### 示例

```bash
# 默认加密 resume_data.json
node encrypt_resume.js hr@company.com

# 使用相对路径
node encrypt_resume.js hr@company.com --file ./my_resume.json

# 使用绝对路径
node encrypt_resume.js hr@company.com --file /Users/username/project/my_resume.json
```

### 生成结果

脚本执行成功后，会输出类似信息：

```text
✅ 加密成功！
📁 目标邮箱: hr@company.com
🔑 MD5 (文件名): 6f7d4b1d7a5cb7f2...
🔒 文件已保存至: .../resume/6f7d4b1d7a5cb7f2....json
```

### 加密原理

前端和后端使用相同的规则：

- `MD5(email)` 用于文件名
- `SHA1(email)` 用于 3DES Key 的生成
- `MD5(email)` 反转后取前 16 个字符用于 IV
- 数据采用 `3DES-CBC` 加密并进行 Base64 编码

这样可以保证：

- 只有输入正确邮箱时，页面才可读取对应的内容
- 简历原始数据不会直接暴露在前端中

## 怎么用？

- 其实这个项目只提供一种加密解密简历信息放在公网上避免泄密的方法，页面样式和功能都可以根据你自己的喜好调整的。
- 当然加密时用的邮件地址也可以用招聘者的，如果那些大企业是通过公开的招聘邮箱收集简历的话。
- 你可以对A企业改一改简历信息，使用A企业的招聘邮箱地址来加密。然后再为B企业改一改简历信息，生成另一个加密的简历信息。这样A企业访问时只能回答自己的邮件地址，查看到你专门给A企业的简历……

## 注意事项

- 仅支持在本地 HTTP 服务中访问或者直接部署后访问，否则 `fetch` 可能无法正常加载 JSON 文件
- `resume_data.json` 是原始数据源，建议保留在本地，不要直接暴露给访问者
- 该项目是前端静态项目，适合做演示、内部展示、简历加密分享等用途

## 适用场景

- 个人简历在线展示
- 招聘筛选专用页面
- 加密版简历分享
- 公司内部候选人资料展示

## License

Licensed under the MIT License.