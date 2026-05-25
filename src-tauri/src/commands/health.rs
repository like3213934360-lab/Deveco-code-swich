use serde::Serialize;
use tauri::State;
use crate::db::{queries, DbState};

#[derive(Debug, Serialize)]
pub struct HealthResult {
    pub provider_id: String,
    pub provider_name: String,
    pub status: String,
    pub latency_ms: Option<u64>,
    pub error: Option<String>,
}

#[tauri::command]
pub async fn check_all_health(db: State<'_, DbState>) -> Result<Vec<HealthResult>, String> {
    let providers = {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        queries::list_providers(&conn).map_err(|e| e.to_string())?
    };

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();

    for provider in providers {
        let start = std::time::Instant::now();
        let url = format!("{}/models", provider.base_url.trim_end_matches('/'));

        let mut req = client.get(&url);
        if let Some(ref key) = provider.api_key {
            req = req.header("Authorization", format!("Bearer {}", key));
        }

        let result = match req.send().await {
            Ok(resp) => {
                let elapsed = start.elapsed().as_millis() as u64;
                if resp.status().is_success() || resp.status().as_u16() == 401 {
                    HealthResult {
                        provider_id: provider.id.clone(),
                        provider_name: provider.name.clone(),
                        status: "healthy".to_string(),
                        latency_ms: Some(elapsed),
                        error: None,
                    }
                } else {
                    HealthResult {
                        provider_id: provider.id.clone(),
                        provider_name: provider.name.clone(),
                        status: "degraded".to_string(),
                        latency_ms: Some(elapsed),
                        error: Some(format!("HTTP {}", resp.status())),
                    }
                }
            }
            Err(e) => HealthResult {
                provider_id: provider.id.clone(),
                provider_name: provider.name.clone(),
                status: "down".to_string(),
                latency_ms: None,
                error: Some(e.to_string()),
            },
        };

        results.push(result);
    }

    Ok(results)
}

#[tauri::command]
pub fn get_health_history(db: State<DbState>, provider_id: String) -> Result<serde_json::Value, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT status, latency_ms, last_check_at, consecutive_failures, circuit_state, error_message
         FROM endpoint_health WHERE provider_id = ?1"
    ).map_err(|e| e.to_string())?;

    let result = stmt.query_row(rusqlite::params![provider_id], |row| {
        Ok(serde_json::json!({
            "status": row.get::<_, String>(0)?,
            "latency_ms": row.get::<_, Option<i64>>(1)?,
            "last_check_at": row.get::<_, Option<i64>>(2)?,
            "consecutive_failures": row.get::<_, i32>(3)?,
            "circuit_state": row.get::<_, String>(4)?,
            "error_message": row.get::<_, Option<String>>(5)?,
        }))
    }).map_err(|e| e.to_string())?;

    Ok(result)
}
