# UPDATING.md — 資料維護流程

給人工或 Cowork 定期更新 `data/*.json` 用。改程式邏輯(`.ts` / `.tsx`)不是這份文件的範圍——那要照 [CLAUDE.md](../CLAUDE.md) 的工作紀律走一般的 Step 流程。

## 1. 資料任務優先序

### ① 調校碼收集(最高優先)

截至 2026-07-07,**76 筆推薦裡 0 筆有真實 `tuneCode`**——全部只有 `tuneSearchHint` 提示文字。初始匯入的 `adolphin8/fh6-tier-list` seed.py 裡雖然有 `TUNE_CODES` 範例(Peel P50、Alfa Romeo 8C Competizione、Ferrari J50),但這 3 台車完全不在我們匯入的 55 台車單裡(比對過精確、去年份、模糊子字串三種方式都對不上),所以一筆都沒能自動配對上。這是目前產品缺口最大的地方,排第一順位。

真實查碼管道(來自 seed.py 的 `CODE_LINKS`):

- Dexerto — 熱門調校碼:https://www.dexerto.com/wikis/forza-horizon-6/best-tuning-codes-forza-horizon-6/
- Dexerto — 車庫分享碼:https://www.dexerto.com/wikis/forza-horizon-6/garage-share-codes/
- ForzaFire — 依車型/等級/賽事瀏覽所有 FH6 調校:https://www.forzafire.com/builds
- CODMunity — 經測試過的 FH6 調校資料庫:https://codmunity.gg/forza
- JSR Chronic FH6 Tunes(Forza Forums 試算表 + Discord):https://forums.forza.net/t/jsr-chronic-fh6-tunes-spreadsheet-share-codes-discord/826030
- r/ForzaHorizon — 社群在每次每週賽事更新後會貼新調校:https://www.reddit.com/r/ForzaHorizon/

**找到碼之後,必須先在遊戲內實際套用測試過,同時核對兩項——① 用途分類是否吻合(road/drag/drift/dirt/xc)② 套用後的實際 class/PI 是否落在該筆推薦的等級——兩項都對得上才能寫進 `tuneCode`。不可以照抄網路上未經查證的用途標注,那不算驗證。** CLAUDE.md 已經記錄「不造假調校碼」是這個專案的硬性原則,seed.py 作者自己也是因為這個理由才沒有把網路碼照單全收。

> **反面教材(2026-07-07)**:曾經從 Dexerto 的調校碼頁面找到一筆「Mazda MX-5 Miata 'Forza Edition'(1994)」代碼 `159 766 283`,網頁標注用途是「Drag」,車名/年份也跟我們 `drag`/`S2`/rank2 的推薦完全吻合,看起來是穩妥的配對,就先寫進了 `tuneCode`(PR #2)。結果人工在遊戲內實測後發現:這個碼其實是 VraelJSP 的 **Offroad** 調校,套用後是 **R 995**——用途跟 class 兩項都不符(需求是 drag/S2)。網頁上的「車名 + 年份 + 用途文字」三者吻合,完全不能取代遊戲內實測;**遊戲內實測是唯一判準**,而且要同時核對用途分類跟套用後 class 兩項,少查一項都可能誤放假碼。這筆最後退回 `tuneSearchHint`。

找到真碼並實測通過後的動作:把對應 recommendation 的 `tuneSearchHint` 換成 `tuneCode`(兩者互斥,見 `src/components/RecommendationCard.tsx` 的渲染邏輯),`source` 加上這個碼的出處,`updatedAt` 改成驗證日期。如果實測沒過,維持 `tuneSearchHint` 不動,不要留半成品的 `tuneCode`。

### ② touge 專門資料

目前 `touge`(1v1 山道對決)完全沒有資料——來源只有 `drift`(甩尾計分),兩者調校目標不同,故意沒有互相頂替(見 CLAUDE.md 領域知識段落的決策記錄)。如果之後找到真正針對 touge 玩法的攻略,才補進 `discipline: "touge"`。

### ③ drag 的 C、A 級缺口

目前 `drag` 只有 B/D/R/S1/S2,沒有 C、A 級推薦(來源 seed.py 本身就沒收錄這兩級)。找到來源就補。

### ④ 既有筆數例行複查

`recommendation.updatedAt` 超過 60 天,卡片會自動顯示「可能過時」標記(`src/lib/filter.ts` 的 `isStale`)。可以定期用這個當複查清單,逐筆確認車輛/調校在目前版本的 meta 裡還站得住腳。

## 2. 更新來源清單

**一般推薦來源**(車輛排名、優缺點):PC Gamer、Game8、Dexerto、grindout、gamingpromax、Switchblade、IGN、fh6guide、fandomwire、forza.guide、GAMES.gg、skycoach、forzatune.com、JSR Chronic tune sheet。

**調校碼專門來源**:見上面「① 調校碼收集」的六個連結。

**Upstream repo**:[adolphin8/fh6-tier-list](https://github.com/adolphin8/fh6-tier-list)(MIT)。如果這個 repo 有新的 commit,可以重新 vendor `scripts/vendor/fh6-tier-list-seed.py` 並重跑 `npm run import-tierlist` 取得最新資料(注意:這會整個覆蓋 `data/*.json`,任何手動加的 `tuneCode` 等資料要另外備份、匯入後再補回去)。

## 3. 資料編輯規則

1. **只改 `data/*.json`,不要動 `.ts` / `.tsx`**(CLAUDE.md 工作紀律 #2:資料與程式分離)
2. 新增或修改任何一筆,必須附結構化 `source` 陣列(`{ name, url? }[]`,不可以把多個引用逗號串成一個字串)與 `updatedAt`
3. 過時的項目用標記處理(例如靠 `isStale` 自然浮現「可能過時」),不要直接刪除——刪除會讓歷史判斷依據消失
4. `touge` 不可以拿 `drift` 資料頂替;`road` / `street` 在沒有專門資料前,兩邊要嘛都補、要嘛都不補並用 `derived` 標記,不能只補一邊造成不一致
5. **⚠️ 如果新增了 `touge` 或 `drag` 的 `C`、`A` 級資料**,`src/lib/filter.test.ts` 裡有幾個測試案例是硬編碼「這些組合目前是空的」(對應現有資料事實),新增資料後這些測試會變紅——這是資料驅動測試的正常後果,不是 bug,記得同步修正對應測試案例的期望值

## 4. 更新流程

```bash
git checkout -b data/<描述你要更新的內容>
# 編輯 data/*.json
npm run validate   # 必須綠燈
npm run test       # 必須綠燈(有動到假設請見上面規則 5)
git add data/ && git commit -m "..."
git push -u origin data/<分支名>
gh pr create        # 不要直接 push main
```

**開完 PR 後就停下,等待人工在 GitHub 上審核並按下合併。** 合併權限只在人工——不管是 Cowork 還是任何自動化流程,都不可以自己執行 `gh pr merge` 或其他形式的自我合併。原因:tuneCode 這類欄位需要人工(有遊戲的人)在遊戲內實際核對過才算數,PR 審核是這個查核發生的地方,跳過等於跳過查核本身。

Merge 到 `main` 後 Vercel 會自動部署,幾十秒內線上網址會是新版本。

## 5. 給 Cowork 的任務模板

複製以下 prompt,填空後直接貼給 Cowork:

```
幫我更新 fh6-car-picker(C:\Projects\fh6-car-picker)的資料。

任務:[例如:從 CODMunity 找 <discipline>/<class> 排名前幾名車款的真實調校碼]

規則:
- 只改 data/*.json,不要碰 .ts/.tsx
- 每筆修改都要有 source(結構化陣列 { name, url? })跟 updatedAt
- 調校碼一定要是有查證出處的真碼,不要照抄未驗證的網路碼,查不到就維持 tuneSearchHint
- 改完跑 npm run validate 和 npm run test,兩個都要綠燈
- 開分支 + PR,不要直接 push main
- **開完 PR 就停下,不要自己合併(`gh pr merge`)——合併權限只在人工,我要親自審核才能按合併**
- 完成後列出改了哪幾筆、source 是什麼,讓我驗收
```
