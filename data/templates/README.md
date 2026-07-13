# 新模板放置目录

将每套模板的 JSON 文件放在此目录下，按 slug 命名：

```
items/
├── .gitkeep
└── <template-slug>/
    └── template.json
```

模板图片放在：

```
public/templates/<template-slug>/
├── cover.webp
├── preview-01.webp
├── preview-02.webp
└── reference-01.webp
```

JSON 中使用 Web 路径 `/templates/<template-slug>/cover.webp`。

添加新模板后，在 `data/templates/index.ts` 中导入并注册。