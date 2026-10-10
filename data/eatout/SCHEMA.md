# 外食天地資料格式

每個來源一個檔案：`data/eatout/<brandId>.json`

```json
{
  "brand": { "id": "mcd", "name": "麥當勞", "kind": "fastfood", "site": "https://..." },
  "source": "https://官方營養資訊頁或開放資料網址",
  "fetchedAt": "2026-10-09",
  "items": [
    {
      "id": "mcd-big-mac",
      "name": "大麥克",
      "category": "漢堡",
      "serving": "1 個（213g）",
      "kcal": 530, "protein": 25, "carbs": 46, "fat": 27,
      "fiber": 3, "sugar": 9, "sodium": 940,
      "source": "此品項的來源網址（可省略，預設用上面的 source）"
    }
  ]
}
```

- kind：fastfood（速食）、cafe（咖啡早午餐）、asian（中式日式連鎖）、drink（手搖飲）、convenience（便利商店）、bakery（麵包店）、generic（一般小吃，衛福部資料）
- 數字是每份；protein/carbs/fat/fiber/sugar 單位 g，sodium 單位 mg；不知道的欄位省略，不要猜
- 一定要是官方公開的數字或政府開放資料，不可自己估算
- `scripts/eatout/<brandId>.mjs`（選擇性）：能自動重抓最新資料的程式，`export default async function fetchBrand()` 回傳上面同樣格式；抓不到就丟錯，更新流程會保留舊資料
