import express from 'express';
import { chromium, Browser } from 'playwright';
import dotenv from 'dotenv';
// import { createClient } from '@supabase/supabase-js';
// import { supabase } from './supabase';
import { saveScrapingResult, getScrapingResults, registerOne, getTableData } from './services/database';
import { updateApplicationStatus, ApplyStatus } from './lib/saveToSupabase';
import cors from 'cors';

// 環境変数を読み込む
dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '8080', 10);

// 明示的にすべてのリクエストを許可するCORS設定
app.use(cors());

// グローバル変数の定義
interface ScreeningResult {
  result: string;
  category: string;
}

let currentScreeningResult: ScreeningResult = {
  result: '',
  category: ''
};


// JSONリクエストを解析
app.use(express.json());

// メインエンドポイント
app.post('/ng-mail-sender-mynavi', async (req, res) => {
  const { } = req.body;


  let hasResponded = false;  // レスポンス送信フラグ
  let results: Array<{ apply_id: string; status: string; error?: string }> = [];

  const isLocal = process.env.NODE_ENV === 'development';

  try {
    // Supabaseから対象データを取得
    const targetApplications = await getTableData({
      status_category: '年齢対象外(メール未送信)',
      apply_status: ApplyStatus.DOCUMENT_REJECTED,
      created_before: new Date(Date.now() - 300 * 60 * 60 * 1000) // 48時間前の時刻
    });
    console.log(targetApplications);

    if (!targetApplications.success || !targetApplications.data || targetApplications.data.length === 0) {
      return res.json({
        message: "対象者が見つかりませんでした",
        status: "success",
        data: []
      });
    }

    for (const application of targetApplications.data) {
      let browser: Browser | null = null;
      try {
        browser = await chromium.launch({
          headless: false,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-extensions'
          ]
        });

        const context = await browser.newContext();
        const page = await context.newPage();
        // 各応募者に対してメール送信処理を実行
        // 対象URLにアクセス
        console.log(application.url);
        await page.goto(application.url);
        // ログインフォームの入力（ローカル環境の場合のみタイムアウトを設定）
        const inputOptions = isLocal ? { timeout: 5000 } : undefined;
        // フォームに入力
        await page.fill('input[name="ap_login_id"]', 'wkd86');
        await page.fill('input[name="ap_password"]', 'Waswas2525!');
        // ログインボタンのクリック
        await page.click('#loginBtn');
        // ログイン後のページ読み込みを待機
        await page.waitForLoadState('networkidle');
        // ログイン後のページ読み込みを待機
        await page.waitForTimeout(10000);  // 10秒待機

        // 最初のボタンをクリック
        await page.click('button.newmes.btn.edit.high >> nth=0');
        await page.waitForTimeout(10000);  // 10秒待機

        // テンプレート選択部分が表示されるまで待機
        await page.waitForSelector('#message-template .css-yk16xz-control', { state: 'visible' });
        await page.click('#message-template .css-yk16xz-control');

        // 特定の選択肢をテキストで選択する
        await page.click('text="24. 【書類選考NGのお知らせ】"');

        // 面接日程調整セクション内の三番目のラジオボタンを選択
        await page.click('h1:has-text("面接日程調整") + div .MuiFormControlLabel-root >> nth=2');

        // 送信日時セクションの最初のラジオボタンを選択
        await page.click('#send-time input[name="sendTimeType"][value="0"]');

        // メールアドレスを入力
        // メールアドレスを入力（より具体的なセレクター）
        await page.fill('#reminder input[name="reminder"]', 'test@wasolutions.co.jp');
        await page.waitForTimeout(1000);

        await page.click('button.btn.high:has-text("プレビューして送信")');
        await page.waitForTimeout(5000);

        await page.waitForSelector('#sendMessage');
        await page.click('#sendMessage');
        await page.waitForTimeout(5000);


        // DB側の選考ステータスをNGに更新する
        await updateApplicationStatus({
          apply_id: application.apply_id,
          newStatus: ApplyStatus.DOCUMENT_REJECTED,
          status_category: '年齢対象外(メール送信済)',
          updated_by: 'system'
        });

        results.push({
          apply_id: application.apply_id,
          status: 'success'
        });
      } catch (error) {
        results.push({
          apply_id: application.apply_id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    }

    // すべての処理が完了した後に1回だけレスポンスを送信
    if (!hasResponded) {
      hasResponded = true;
      return res.json({
        message: "メール送信処理が完了しました",
        status: "success",
        data: results
      });
    }
  } catch (err) {
    const error = err as Error;
    console.error('Error:', error.message);
    // エラー時も1回だけレスポンスを送信
    if (!hasResponded) {
      hasResponded = true;
      return res.status(500).json({
        error: error.message,
        status: "error",
        data: results
      });
    }
  }
});

// ヘルスチェック用エンドポイント
app.get('/', (req, res) => {
  res.status(200).send('Apply Manager is running');
});

// サーバー起動部分の修正
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});