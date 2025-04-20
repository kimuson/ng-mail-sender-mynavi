# apply-manager-01

## 概要

PlaywrightをTypeScriptで実装し、Google Cloud Run上で動作するウェブスクレイピング・自動化サービスです。

## 機能

- ブラウザ自動化（Playwright）
- HTTPエンドポイント経由での自動化処理の実行
- Cloud Run上での動作に最適化
- Webhookによる柔軟なパラメーター指定

## 前提条件

- Node.js 18以上
- Docker（Cloud Runデプロイ用）
- Google Cloudアカウント（デプロイ用）

## セットアップ手順

### ローカル開発環境

```bash
# リポジトリをクローン
git clone [リポジトリURL]
cd apply-manager-01

# 依存関係をインストール
npm install

# Playwrightブラウザをインストール
npx playwright install

# 開発サーバーを起動
npm run dev
```

### 環境変数の設定

`.env`ファイルに必要な環境変数を設定してください：

```
PORT=8080
# その他の環境変数
```

## 使用方法

### エンドポイントの呼び出し

```bash
# ローカル環境
curl -X POST http://localhost:8080/ng-mail-sender-mynavi \
     -H "Content-Type: application/json"

# Cloud Run環境
curl -X POST https://apply-manager-mynavi-720184623101.asia-northeast1.run.app/apply-manager-mynavi  \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://tenshoku.mynavi.jp/d/c.cfm/c402574p1o2j1e41698560/"
  }'
```

### リクエストパラメーター

| パラメーター | 型     | 説明                                                |
| ------------ | ------ | --------------------------------------------------- |
| targetUrl    | string | アクセス先のURL（必須）                             |
| actions      | array  | 実行するアクション（オプション）                    |
| waitTime     | number | ページロード後の待機時間（ミリ秒）                  |
| auth         | object | 認証情報                                            |
| headers      | object | カスタムHTTPヘッダー                                |
| cookies      | array  | クッキー設定                                        |
| timeout      | number | 処理全体のタイムアウト（ミリ秒、デフォルト: 60000） |
| callbackUrl  | string | 処理完了後のコールバックURL                         |

#### アクションタイプ

| タイプ     | 説明                   | 必須パラメーター               |
| ---------- | ---------------------- | ------------------------------ |
| click      | 要素をクリック         | selector                       |
| type       | テキスト入力           | selector, value                |
| select     | セレクトボックス選択   | selector, value                |
| screenshot | スクリーンショット撮影 | selector, options (オプション) |

#### 使用例

```json
{
  "targetUrl": "https://example.com/login",
  "actions": [
    {
      "type": "type",
      "selector": "#username",
      "value": "user123"
    },
    {
      "type": "type",
      "selector": "#password",
      "value": "password123"
    },
    {
      "type": "click",
      "selector": "#login-button"
    },
    {
      "type": "screenshot",
      "selector": "body",
      "options": {
        "fullPage": true
      }
    }
  ],
  "waitTime": 2000,
  "timeout": 30000,
  "callbackUrl": "https://your-server.com/webhook"
}
```

### 認証が必要な場合

```bash
TOKEN=$(gcloud auth print-identity-token)
curl -X POST https://[CLOUD-RUN-URL]/apply-manager \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://example.com"
  }'
```

## Dockerでの実行

```bash
# Dockerイメージのビルド
docker build -t apply-manager-01 .

# コンテナ実行
docker run -p 8080:8080 apply-manager-01
```

## Cloud Runへのデプロイ

```bash
# イメージのビルドとプッシュ
docker buildx build --platform linux/amd64 -t gcr.io/agent-apply-management/ng-mail-sender-mynavi . --push

# Cloud Runへのデプロイ
gcloud run deploy ng-mail-sender-mynavi \
  --image gcr.io/agent-apply-management/ng-mail-sender-mynavi \
  --platform managed \
  --region asia-northeast1 \
  --memory 2Gi \
  --timeout 3600 \
  --allow-unauthenticated
```

### タイムアウト設定の変更

デフォルトのタイムアウト（60秒）を延長する場合：

```bash
gcloud run services update apply-manager-01 \
  --region asia-northeast1 \
  --timeout 3600
```

注意：Cloud Runのタイムアウトは最大3600秒（1時間）まで設定可能です。

## プロジェクト構造

```
apply-manager-01/
├── src/             # ソースコード
├── Dockerfile       # Dockerコンテナ設定
├── package.json     # 依存関係
├── tsconfig.json    # TypeScript設定
├── .env             # 環境変数（非Git管理）
├── README.md        # このファイル
```

## トラブルシューティング

### Playwrightブラウザが見つからない場合

```bash
npx playwright install
```

### その他の問題

- メモリ不足エラー：Cloud Runのメモリ割り当てを増やす（2GB以上推奨）
- タイムアウト：Cloud Run実行時間の制限を確認する
- ブラウザクラッシュ：コンテナ内のリソース制限を確認する

## 参考リンク

- [Playwright公式ドキュメント](https://playwright.dev/)
- [Cloud Run公式ドキュメント](https://cloud.google.com/run/docs)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)

## データベース登録方法

### Postmanを使用したデータ登録

1. 以下のエンドポイントにPOSTリクエストを送信します：

```bash
curl -X POST http://localhost:8080/register-one
```

2. リクエストヘッダーの設定：

```
Content-Type: application/json
```

3. リクエストボディ（JSON形式）：

```json
{
    "tableName": "APPLY_TRANSACTION",
    "columnName": "登録したいカラム名"
}
```

4. 成功時のレスポンス：

```json
{
    "success": true,
    "data": "登録されたデータ"
}
```

### 登録データの確認方法

登録されたデータを確認するには、以下のエンドポイントにGETリクエストを送信します：

```bash
curl -X GET http://localhost:8080/table-data/APPLY_TRANSACTION
```

### トラブルシューティング

エラー: "new row violates row-level security policy for table"が発生した場合

このエラーはRow Level Security (RLS)ポリシーが設定されていないことが原因です。Supabaseダッシュボードで以下の設定を行ってください：

1. Supabaseダッシュボードにログイン
2. 該当プロジェクトを選択
3. 「Authentication」→「Policies」を選択
4. 対象テーブルに適切なRLSポリシーを設定
