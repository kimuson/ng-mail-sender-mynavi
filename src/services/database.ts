import { addTestData, fetchData } from './supabase';
import { supabase } from '../lib/supabase';
import { ApplyStatus } from '../lib/saveToSupabase';

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

interface GetTableDataParams {
  status_category: string;
  apply_status: ApplyStatus;
  created_before?: Date;
  apply_route?: string;
}

/**
 * 特定のテーブルからすべてのデータを取得する
 * @param tableName テーブル名
 * @returns テーブルデータ
 */
export async function getTableData({ status_category, apply_status, created_before, apply_route = 'マイナビ' }: GetTableDataParams) {
  try {
    let query = supabase
      .from('applications')
      .select('*')
      .eq('status_category', status_category)
      .eq('apply_status', apply_status)
      .eq('apply_route', apply_route);
    
    if (created_before) {
      query = query.lt('created_at', created_before.toISOString());
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました'
    };
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
