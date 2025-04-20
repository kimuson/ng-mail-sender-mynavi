import { addTestData, fetchData } from './supabase';
import { supabase } from '../lib/supabase';

/**
 * 特定のテーブルとカラムに「1」という数値を登録する
 * @param tableName テーブル名
 * @param columnName カラム名
 * @returns 登録結果
 */
export async function registerOne(tableName: string, columnName: string) {
  try {
    const result = await addTestData(tableName, columnName);
    console.log(`Successfully registered '1' to ${tableName}.${columnName}`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`Failed to register '1' to ${tableName}.${columnName}:`, error);
    return { success: false, error };
  }
}

interface TableDataFilter {
  status_category?: string;
  apply_status?: string;
}

/**
 * 特定のテーブルからすべてのデータを取得する
 * @param tableName テーブル名
 * @returns テーブルデータ
 */
export async function getTableData(filter: TableDataFilter) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('status_category', filter.status_category)
      .eq('apply_status', filter.apply_status);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { success: false, error };
  }
}

// 以下の関数はスクレイピング用で、ここでは使用しない
export async function saveScrapingResult(data: any) {
  // この関数の中身は空にして、スクレイピング処理から切り離す
  console.log('saveScrapingResult is disabled');
  return null;
}

export async function getScrapingResults() {
  // この関数の中身は空にして、スクレイピング処理から切り離す
  console.log('getScrapingResults is disabled');
  return [];
}
