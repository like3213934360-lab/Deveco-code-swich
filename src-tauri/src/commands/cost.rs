use tauri::State;
use crate::db::{models::RequestLog, models::DailyUsage, models::CostSummary, queries, DbState};
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct DateRange {
    pub start: String,
    pub end: String,
}

#[derive(Debug, Deserialize)]
pub struct LogFilter {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub provider_id: Option<String>,
    pub model: Option<String>,
}

#[tauri::command]
pub fn get_cost_summary(db: State<DbState>, range: DateRange) -> Result<CostSummary, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    let daily = queries::get_daily_usage(&conn, &range.start, &range.end)
        .map_err(|e| e.to_string())?;

    let mut total_requests: i64 = 0;
    let mut total_input: i64 = 0;
    let mut total_output: i64 = 0;
    let mut total_cost: f64 = 0.0;

    for d in &daily {
        total_requests += d.request_count;
        total_input += d.input_tokens;
        total_output += d.output_tokens;
        total_cost += d.total_cost_cny;
    }

    Ok(CostSummary {
        total_requests,
        total_input_tokens: total_input,
        total_output_tokens: total_output,
        total_cost_cny: total_cost,
        by_provider: vec![],
        by_model: vec![],
    })
}

#[tauri::command]
pub fn get_request_logs(db: State<DbState>, filter: LogFilter) -> Result<Vec<RequestLog>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let limit = filter.limit.unwrap_or(50);
    let offset = filter.offset.unwrap_or(0);
    queries::get_request_logs(&conn, limit, offset).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_daily_usage(db: State<DbState>, range: DateRange) -> Result<Vec<DailyUsage>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    queries::get_daily_usage(&conn, &range.start, &range.end).map_err(|e| e.to_string())
}
