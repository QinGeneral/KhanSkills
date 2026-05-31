# MovieFinder Output Format

## Markdown

Search output starts with:

```markdown
# 搜索结果：<keyword>

- 来源：rrdynb
- 搜索页：[打开](...)
- 结果数：N
- 缓存：命中|未命中|过期缓存兜底
- 警告：live refresh failed: ...
```

Each movie result includes a metadata table, synopsis, and cloud-drive resource table:

```markdown
## 1. 《标题》

| 字段 | 值 |
| --- | --- |
| 分类 | movie |
| 发布日期 | 2026-05-29 |
| 豆瓣评分 | 9.0 |
| IMDB 评分 | 8.1 |
| IMDb ID | tt0244316 |
| 详情页 | [打开](https://...) |
| 海报 | [打开](https://...) |

### 简介

...

### 网盘资源

| 平台 | 地址 | 提取码 | URL 密码 |
| --- | --- | --- | --- |
| 百度网盘 | [打开](https://pan.baidu.com/s/...) | abcd | - |
```

## JSON

Top-level keys:

- `keyword`
- `source`
- `source_url`
- `total`
- `items`
- `errors`
- `cache`

Each `items[]` entry includes:

- `title`
- `detail_url`
- `category`
- `published_at`
- `summary`
- `intro`
- `douban_score`
- `imdb_score`
- `imdb_id`
- `poster_url`
- `resources`
- `source`

Each `resources[]` entry includes:

- `platform`
- `url`
- `label`
- `access_code`
- `url_password`

## Cache Semantics

- `cache.hit=true`: exact fresh cache hit.
- `cache.stale=true`: stale cache was returned because live search failed.
- `cache.fallback=true`: a larger cached result set was sliced to satisfy the requested limit.
- `cache.warning`: live search or repair failed; report this to the user.
