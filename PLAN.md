# PLAN.md — 分步實作計畫

規則同 fh6-telemetry:每 Step 先提方案、驗收通過才進下一步。

---

## Step 0 — 骨架 + 首次部署

**產出**:Vite + React 19 + TS strict + Tailwind 骨架;vitest + smoke test;push 到 GitHub、接 Vercel、拿到線上 URL。

**驗收**:線上 URL 打得開(placeholder 頁);`npm run test` 綠燈。

> 部署放 Step 0 是刻意的:部署問題要在專案最小時解決,不要累積到最後。

---

## Step 1 — 資料模型 + 初始匯入

**產出**:
1. `src/types.ts` + zod schema(Car / Recommendation,枚舉照 CLAUDE.md)
2. `scripts/import-tierlist.ts`:解析 fh6-tier-list 的 `seed.py` → 產出 `data/*.json`(一次性腳本,保留在 repo 供追溯)
3. `npm run validate`:schema 全檢 + 引用完整性(recommendation.carId 必須存在於 cars)
4. 頁尾 attribution(MIT 署名)

**驗收**:validate 綠燈;抽查 5 筆推薦與 fh6-tier-list 原始資料一致;每筆有 source + updatedAt。

---

## Step 2 — 查詢 UI

**產出**:
- 主畫面:discipline × class 兩個選擇器(手機優先,大按鈕)→ 推薦卡片列表(排名、車名、調校碼一鍵複製、seasonNotes、來源與日期)
- 空狀態:該組合無資料時明確顯示「無資料」,不要空白
- 資料日期超過 60 天:卡片顯示「可能過時」標記

**驗收**:手機瀏覽器實際操作順暢;調校碼複製可用;無資料組合不出錯。

---

## Step 3 — 資料維護流程(Cowork 接手點)

**產出**:`docs/UPDATING.md`,內容:
1. 更新來源清單(攻略站、社群 tier list、fh6-tier-list repo)
2. 資料編輯規則:只改 `data/*.json`,新增/修改必附 source + updatedAt,過時項目標記而非刪除
3. 更新後必跑 `npm run validate`,開 PR 不直接 push main
4. 給 Cowork 的任務模板(可直接貼的 prompt)

**驗收**:模擬一次完整更新流程(改一筆資料 → validate → PR → merge → Vercel 自動部署)走通。

---

## Step 4(選配)— 個人化

我的車庫標記(localStorage:標記已擁有的車,推薦列表優先顯示已擁有)、常用組合捷徑。開工前重新評估。

---

## 里程碑

| Step | 得到什麼 |
|---|---|
| 0 | 線上網址(作品集連結從第一天存在) |
| 2 | 每天可用的選車工具 |
| 3 | 維護交給 Cowork,你只審 PR |
