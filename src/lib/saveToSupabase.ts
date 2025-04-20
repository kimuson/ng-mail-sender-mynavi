import { supabase } from './supabase';

export enum ApplyStatus {
  INITIAL_CONTACT = "初回接触",
  DOCUMENT_SCREENING = "書類選考中",
  DOCUMENT_PASSED = "書類選考通過",
  DOCUMENT_REJECTED = "書類選考不合格",
  FIRST_SCHEDULING_IN_PROGRESS = "一次面接日程調整中",
  FIRST_INTERVIEW_SCHEDULED = "一次面接予定",
  FIRST_INTERVIEW_COMPLETED = "一次面接完了",
  FIRST_INTERVIEW_REJECTED = "一次面接不合格",
  SECOND_SCHEDULING_IN_PROGRESS = "二次面接日程調整中",
  SECOND_INTERVIEW_SCHEDULED = "二次面接予定",
  SECOND_INTERVIEW_COMPLETED = "二次面接完了",
  SECOND_INTERVIEW_REJECTED = "二次面接不合格",
  OFFER_NEGOTIATION = "オファー交渉中",
  OFFER_ACCEPTED = "内定承諾",
  OFFER_DECLINED = "内定辞退",
  JOINED = "入社完了",
  NO_RESPONSE = "応答なし",
  CANDIDATE_WITHDREW = "候補者辞退",
  SCHEDULING_IN_PROGRESS = "日程調整中",
  ON_HOLD = "保留中",
  BACKGROUND_CHECK = "経歴確認中"
}

interface UpdateStatusParams {
  apply_id: string;
  newStatus: ApplyStatus;
  status_category: string;
  updated_by?: string;
}

export async function updateApplicationStatus({
  apply_id,
  newStatus,
  status_category,
  updated_by = 'system'
}: UpdateStatusParams): Promise<void> {
  try {
    const now = new Date();

    const { error } = await supabase
      .from('applications')
      .update({
        apply_status: newStatus,
        status_category: status_category,
        updated_at: now.toISOString(),
        updated_by: updated_by
      })
      .eq('apply_id', apply_id);

    if (error) {
      console.error('Error updating application status:', error);
      throw error;
    }

    console.log(`Application with apply_id ${apply_id} status updated to ${newStatus}`);

  } catch (error) {
    console.error('Status update failed:', error);
    throw error;
  }
} 