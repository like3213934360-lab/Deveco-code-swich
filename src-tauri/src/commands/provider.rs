use serde::Deserialize;
use tauri::State;
use uuid::Uuid;

use crate::db::{models::Provider, queries, DbState};
use crate::services::config_service;

#[derive(Debug, Deserialize)]
pub struct CreateProviderInput {
    pub name: String,
    pub provider_type: String,
    pub base_url: String,
    pub api_key: Option<String>,
    pub npm_package: Option<String>,
    pub models: Option<Vec<CreateModelInput>>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateModelInput {
    pub model_id: String,
    pub display_name: Option<String>,
    pub tool_call: Option<bool>,
    pub context_limit: Option<i64>,
    pub output_limit: Option<i64>,
    pub input_modalities: Option<Vec<String>>,
    pub output_modalities: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProviderInput {
    pub name: Option<String>,
    pub base_url: Option<String>,
    pub api_key: Option<String>,
    pub npm_package: Option<String>,
    pub notes: Option<String>,
    pub priority: Option<i32>,
}

#[tauri::command]
pub fn list_providers(db: State<DbState>) -> Result<Vec<Provider>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    queries::list_providers(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_provider(db: State<DbState>, input: CreateProviderInput) -> Result<Provider, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().timestamp();

    let provider = Provider {
        id: Uuid::new_v4().to_string(),
        name: input.name,
        provider_type: input.provider_type,
        base_url: input.base_url,
        api_key: input.api_key,
        npm_package: input.npm_package,
        is_active: false,
        in_failover_queue: false,
        priority: 0,
        cost_multiplier: 1.0,
        limit_daily_cny: None,
        limit_monthly_cny: None,
        settings_json: "{}".to_string(),
        notes: input.notes,
        icon: None,
        created_at: now,
        updated_at: now,
    };

    queries::insert_provider(&conn, &provider).map_err(|e| e.to_string())?;
    Ok(provider)
}

#[tauri::command]
pub fn update_provider(db: State<DbState>, id: String, input: UpdateProviderInput) -> Result<Provider, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    let mut provider = queries::get_provider(&conn, &id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Provider not found".to_string())?;

    if let Some(name) = input.name { provider.name = name; }
    if let Some(url) = input.base_url { provider.base_url = url; }
    if let Some(key) = input.api_key { provider.api_key = Some(key); }
    if let Some(pkg) = input.npm_package { provider.npm_package = Some(pkg); }
    if let Some(notes) = input.notes { provider.notes = Some(notes); }
    if let Some(priority) = input.priority { provider.priority = priority; }
    provider.updated_at = chrono::Utc::now().timestamp();

    queries::update_provider(&conn, &provider).map_err(|e| e.to_string())?;
    Ok(provider)
}

#[tauri::command]
pub fn delete_provider(db: State<DbState>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    queries::delete_provider(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn switch_provider(db: State<DbState>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    let provider = queries::get_provider(&conn, &id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Provider not found".to_string())?;

    let models = queries::list_models_for_provider(&conn, &id)
        .map_err(|e| e.to_string())?;

    queries::set_active_provider(&conn, &id).map_err(|e| e.to_string())?;

    config_service::write_provider_to_config(&provider, &models)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn test_provider(db: State<'_, DbState>, id: String) -> Result<String, String> {
    let provider = {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        queries::get_provider(&conn, &id)
            .map_err(|e| e.to_string())?
            .ok_or_else(|| "Provider not found".to_string())?
    };

    let client = reqwest::Client::new();
    let start = std::time::Instant::now();

    let mut req = client.post(format!("{}/chat/completions", provider.base_url.trim_end_matches('/')));

    if let Some(ref key) = provider.api_key {
        req = req.header("Authorization", format!("Bearer {}", key));
    }

    req = req.json(&serde_json::json!({
        "model": "test",
        "messages": [{"role": "user", "content": "hi"}],
        "max_tokens": 1
    }));

    match req.send().await {
        Ok(resp) => {
            let elapsed = start.elapsed().as_millis();
            Ok(format!("Status: {} | Latency: {}ms", resp.status(), elapsed))
        }
        Err(e) => Err(format!("Connection failed: {}", e)),
    }
}
