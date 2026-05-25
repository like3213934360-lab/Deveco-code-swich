use serde::Deserialize;
use tauri::State;
use crate::db::DbState;
use crate::services::proxy_service::{ProxyConfig, ProxyStatus};

pub struct ProxyState(pub tokio::sync::Mutex<crate::services::proxy_service::ProxyServer>);

#[derive(Debug, Deserialize)]
pub struct ProxyConfigInput {
    pub listen_address: Option<String>,
    pub listen_port: Option<u16>,
    pub auto_failover: Option<bool>,
    pub max_retries: Option<u32>,
    pub streaming_first_byte_timeout_s: Option<u64>,
    pub non_streaming_timeout_s: Option<u64>,
}

#[tauri::command]
pub async fn start_proxy(db: State<'_, DbState>, proxy: State<'_, ProxyState>) -> Result<(), String> {
    let config = {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT listen_address, listen_port, auto_failover, max_retries,
                    streaming_first_byte_timeout_s, non_streaming_timeout_s
             FROM proxy_config WHERE id = 1",
            [],
            |row| {
                Ok(ProxyConfig {
                    listen_address: row.get(0)?,
                    listen_port: row.get::<_, i32>(1)? as u16,
                    auto_failover: row.get::<_, i32>(2)? != 0,
                    max_retries: row.get::<_, i32>(3)? as u32,
                    streaming_first_byte_timeout_s: row.get::<_, i32>(4)? as u64,
                    non_streaming_timeout_s: row.get::<_, i32>(5)? as u64,
                })
            },
        ).unwrap_or_default()
    };

    let db_path = dirs_data_dir().join("deveco-switch.db");
    let proxy_conn = rusqlite::Connection::open(&db_path).map_err(|e| e.to_string())?;
    proxy_conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;").map_err(|e| e.to_string())?;
    let proxy_db = std::sync::Arc::new(std::sync::Mutex::new(proxy_conn));

    let mut server = proxy.0.lock().await;
    server.start(proxy_db, config).await
}

#[tauri::command]
pub async fn stop_proxy(proxy: State<'_, ProxyState>) -> Result<(), String> {
    let mut server = proxy.0.lock().await;
    server.stop().await
}

#[tauri::command]
pub async fn get_proxy_status(proxy: State<'_, ProxyState>) -> Result<ProxyStatus, String> {
    let server = proxy.0.lock().await;
    Ok(server.get_status().await)
}

#[tauri::command]
pub fn update_proxy_config(db: State<DbState>, input: ProxyConfigInput) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    if let Some(addr) = input.listen_address {
        conn.execute("UPDATE proxy_config SET listen_address = ?1 WHERE id = 1", rusqlite::params![addr])
            .map_err(|e| e.to_string())?;
    }
    if let Some(port) = input.listen_port {
        conn.execute("UPDATE proxy_config SET listen_port = ?1 WHERE id = 1", rusqlite::params![port as i32])
            .map_err(|e| e.to_string())?;
    }
    if let Some(failover) = input.auto_failover {
        conn.execute("UPDATE proxy_config SET auto_failover = ?1 WHERE id = 1", rusqlite::params![failover as i32])
            .map_err(|e| e.to_string())?;
    }
    if let Some(retries) = input.max_retries {
        conn.execute("UPDATE proxy_config SET max_retries = ?1 WHERE id = 1", rusqlite::params![retries as i32])
            .map_err(|e| e.to_string())?;
    }
    if let Some(t) = input.streaming_first_byte_timeout_s {
        conn.execute("UPDATE proxy_config SET streaming_first_byte_timeout_s = ?1 WHERE id = 1", rusqlite::params![t as i32])
            .map_err(|e| e.to_string())?;
    }
    if let Some(t) = input.non_streaming_timeout_s {
        conn.execute("UPDATE proxy_config SET non_streaming_timeout_s = ?1 WHERE id = 1", rusqlite::params![t as i32])
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

fn dirs_data_dir() -> std::path::PathBuf {
    #[cfg(target_os = "macos")]
    {
        let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
        std::path::PathBuf::from(home).join("Library/Application Support/com.deveco-switch.app")
    }
    #[cfg(target_os = "windows")]
    {
        let appdata = std::env::var("APPDATA").unwrap_or_else(|_| "C:\\".to_string());
        std::path::PathBuf::from(appdata).join("com.deveco-switch.app")
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
        std::path::PathBuf::from(home).join(".local/share/com.deveco-switch.app")
    }
}
