# CLAUDE.md — FH6 Car Picker

**專案絕對路徑:`C:\Projects\fh6-car-picker`**(曾誤放 OneDrive 桌面的 `fh6 new`,2026-07-06 已遷移訂正——動工前先確認在這個路徑下)。

## 專案是什麼

FH6 選車查詢器:選 `discipline × class`,回傳社群 meta 推薦車種 + 調校碼,使用者進遊戲買車、下載調校、開跑。純前端靜態站,部署 Vercel,兼作作品集。

**不是什麼**:不碰遙測、不讀遊戲、不做調校計算。資料全部來自社群 meta 的人工整理。姊妹專案 `C:\Projects\fh6-telemetry`(已凍結)負責個人遙測,兩者不共用程式碼。

## 技術棧

- Vite + React 19 + TypeScript strict + Tailwind(與 AquaWatch 同棧)
- **無後端、無資料庫**:資料是 repo 內的 JSON 檔,build 時打包,client-side 過濾。資料量 <1000 筆,這是正確規模
- 資料驗證:zod schema,`npm run validate` 必須在 CI/commit 前通過
- 部署:Vercel,push main 自動部署
- 測試:vitest(資料驗證邏輯 + 過濾邏輯;UI 不強求覆蓋)

## 資料模型(核心)

```
data/
├── cars.json            # 車種主檔
├── recommendations.json # discipline × class → 排名推薦
└── meta.json            # 資料版本、更新日期、來源清單
```

- `Car`: { id, name, year?, classes: Class[], notes? }
- `Recommendation`: { discipline, class, rank, carId, tuneCode?, tuneSearchHint?, seasonNotes?, source, updatedAt, confidence?, acquisition?, priceCr?, strengths?: string[], weaknesses?: string[], derived? }
- `tuneCode` 是遊戲內調校分享碼;沒有碼時給 `tuneSearchHint`(遊戲內搜尋關鍵字,如調校作者名)
- `confidence` 枚舉:`Strong / Moderate / Tentative`——來源對這筆推薦的把握程度,誠實呈現不確定性
- `derived`:{ reason, note } ——標記這筆推薦是從別的分類衍生而來(目前唯一值:`"road-street-merged"`,見下方領域知識)。機器可辨識,不要把衍生原因藏進 `source` 文字裡

## 領域知識(已查證)

- Discipline 枚舉:`road / street / dirt / xc / touge / drag / drift`(dirt 混合路面、xc 全越野、touge 1v1 山道對決、drift 甩尾計分——touge 與 drift 概念不同,不可互相頂替資料)
- Class 枚舉:`D C B A S1 S2 R X`——R 是 FH6 新增(賽道原型車)、X 是 PI 999 特殊級
- **PI 數字不能反推 class**(實測三次證明,如 PI 483 = C),資料模型不做 PI→class 換算
- 賽事另有車輛主題限制(非 class),v1 不建模,recommendation.notes 用文字註記
- 季節每週輪替、影響抓地力,但社群 meta 無逐季粒度 → season 只做 `seasonNotes` 文字欄位,**不做硬過濾維度**(誠實面對資料粒度,別造假資料)
- 遊戲內下載調校:車輛 Upgrade and Tune 選單 → 依讚數排序 → 套用;調校 PI 超過賽事上限會被鎖,推薦時 class 必須精確
- **road/street 資料合併決策**:初始匯入來源(fh6-tier-list)只給「Road & Street」一個合併分類,沒有拆分。決定兩邊都匯入相同推薦內容,並用 `recommendation.derived = { reason: "road-street-merged", note }` 標記——之後拿到專門的 street 資料時,靠這個欄位整批篩選取代,不用人工翻找;UI 也要把這個註記顯示給使用者看,不是只藏在 JSON 裡
- **touge 留空決策**:來源沒有 touge(1v1 山道對決)資料,只有 Drift(甩尾計分,調校目標完全不同)。沒有拿 Drift 頂替 touge——兩者是不同用途,硬塞是用錯誤資料冒充覆蓋率,比誠實的空狀態傷害更大。touge 目前是真的沒資料,Step 2 空狀態要明確顯示,可以附一句「可參考 Drift 分類」引導,但資料層兩者嚴格分開

## 資料來源與授權

- 初始匯入:`adolphin8/fh6-tier-list` 的 `forza/seed.py`(MIT,**頁尾必須署名attribution**);vendor 快照存於 `scripts/vendor/fh6-tier-list-seed.py`,`scripts/import-tierlist.ts` 為一次性匯入腳本(保留在 repo 供追溯,可重跑)
- 後續更新:人工/Cowork 定期整理攻略站與社群(見 docs/UPDATING.md)
- 每筆 recommendation 必須有 `source` 與 `updatedAt`——meta 會過時,沒有日期的推薦是負資產
- `source` 是結構化陣列,不是自由字串:`{ name: string; url?: string }[]`。多個引用來源拆成多個陣列項,不准逗號串在一個字串裡(如 "Game8, PC Gamer" 這種寫法禁止),否則以後沒法按來源批次篩選/更新。`"manual"` 也是合法的 `name`

## 工作紀律

1. 先方案後動手:每 Step 先列檔案清單 + 介面 + 測試計畫,確認後實作
2. 資料與程式分離:改資料不碰 .ts/.tsx,改 UI 不碰 data/
3. zod schema 是資料的 spec:validate 不過不准 commit
4. conventional commits;UI 調整遵循「只改 className 不動邏輯」
5. 每 Step 交驗收清單,使用者親驗後才進下一步

## 指令

```bash
npm run dev
npm run validate         # zod 驗證 data/*.json
npm run import-tierlist  # 一次性:重新從 vendor 的 seed.py 產出 data/*.json
npm run test
npm run build
```
