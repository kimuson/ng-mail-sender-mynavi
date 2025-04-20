import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 環境変数を読み込む
dotenv.config();

// Supabaseの設定
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bqtmsxtrerpehzdjyfeg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdG1zeHRyZXJwZWh6ZGp5ZmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyOTYzMDAsImV4cCI6MjA1ODg3MjMwMH0.uEu4gQy5QIkQOLSWpgAN6KuUhfpQMCQU3MSyF6v1J48';

// Supabaseクライアントの作成
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * テストデータとして数値「1」をテーブルに追加する
 * @param tableName 追加先のテーブル名
 * @param columnName 数値1を追加するカラム名
 * @returns 追加されたデータの結果
 */
export async function addTestData(tableName: string, columnName: string) {
  try {
    // 指定されたテーブルとカラムに1を追加
    const data = { [columnName]: "test" };
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Data inserted successfully:', result);
    return result;
  } catch (error) {
    console.error('Error adding test data:', error);
    throw error;
  }
}

/**
 * Supabaseテーブルからデータを取得
 * @param tableName テーブル名
 * @returns テーブルのデータ
 */
export async function fetchData(tableName: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
