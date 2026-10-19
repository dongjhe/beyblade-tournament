# 第一階段：Email／密碼登入與角色權限

## Firebase Console 必要設定
1. Authentication → Sign-in method：啟用 **Email/Password**，保留 **Anonymous**（家長免登入報名）。
2. Firestore Database → Rules：將此分支 `firestore.rules` 的完整內容發布到 Firebase。
3. 開啟管理後台，使用「建立帳號」註冊第一個管理者。系統會建立 `staff/{uid}` 文件，預設 `role: "pending"`，**不會自動給管理權限**。
4. 在 Firebase Console → Firestore → `staff` → 找到該帳號 UID，**由專案擁有者手動將 role 改為 `admin`**。這是首次安全開通程序，勿在客戶端開放自行升級 admin。
5. 返回網頁按「重新檢查權限」，管理者即可建立賽事、管理報名名單及核准裁判。
6. 裁判自行以 Email／密碼建立帳號，管理者在「裁判帳號管理」按「設為裁判」。

## 舊賽事資料
- 如果舊賽事是使用目前瀏覽器的 Firebase 匿名 UID 建立，**請先在原瀏覽器按「建立帳號」**：系統嘗試使用 `linkWithCredential` 升級原匿名身分並保留 UID，之後再由 Firebase Console 開通 admin。
- 若已用其他帳號登入或匿名 UID 遺失，原賽事的 `ownerUid` 不會自動轉移。請由專案擁有者審核後透過管理程序遷移，勿在前端開放修改 `ownerUid`。
- `?event=...` 參賽者頁面仍採匿名驗證，不需 Email 登入。
- 第二階段才會實作裁判場次指派與可寫入比分的裁判權限；**目前裁判角色只有帳號與審核功能**。

## 安全
- `staff/{uid}` 的一般註冊只能建立 `pending` 文件。
- 管理者只能核准／停用 `judge`，不能透過前端建立其他 admin。
- 賽事建立要求 admin；賽事更新及賽程寫入仍以 `ownerUid` 限制。
- 不要把 Firebase Admin SDK 私鑰或服務帳號金鑰放在 Angular 前端。
