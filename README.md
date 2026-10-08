# 好食光 MealWise

兼具享受美食與智慧管理的生活態度。

規劃一週菜單、自動產生採購與備料清單，吃飯時只要打個勾就能記錄飲食、飲水與營養。

## 開發

```bash
npm install
npm run dev      # 本機開發
npm run build    # 打包
```

## 部署

推送到 `main` 後，GitHub Actions 會自動部署到 GitHub Pages。
第一次需要到 **Settings → Pages → Source** 選擇 **GitHub Actions**。

規劃細節請見 [docs/PLAN.md](docs/PLAN.md)。

## 發佈新版本

1. 在 `src/data/changelog.json` 最上面加一筆新版本（版號、日期、標題、更新內容）
2. 同步修改 `package.json` 的 `version`
3. 推送到 `main`，使用者在「我的 → 檢查更新」就會看到新版本

## 素材來源

- 圖示：[Google Material Symbols](https://fonts.google.com/icons)（Apache 2.0）
- 食物插圖：[Microsoft Fluent Emoji 3D](https://github.com/microsoft/fluentui-emoji)（MIT，見 `public/food/LICENSE.txt`）
