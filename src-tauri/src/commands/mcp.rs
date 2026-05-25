use tauri::State;
use crate::db::{models::McpServer, queries, DbState};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct CreateMcpInput {
    pub name: String,
    pub server_type: Option<String>,
    pub command: Vec<String>,
    pub env: Option<serde_json::Value>,
    pub description: Option<String>,
    pub homepage: Option<String>,
}

#[tauri::command]
pub fn list_mcp_servers(db: State<DbState>) -> Result<Vec<McpServer>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    queries::list_mcp_servers(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_mcp_server(db: State<DbState>, input: CreateMcpInput) -> Result<McpServer, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().timestamp();

    let server = McpServer {
        id: Uuid::new_v4().to_string(),
        name: input.name,
        server_type: input.server_type.unwrap_or_else(|| "local".to_string()),
        command: serde_json::to_string(&input.command).unwrap_or_default(),
        args: "[]".to_string(),
        env: input.env.map(|v| v.to_string()).unwrap_or_else(|| "{}".to_string()),
        enabled: true,
        description: input.description,
        homepage: input.homepage,
        created_at: now,
    };

    queries::insert_mcp_server(&conn, &server).map_err(|e| e.to_string())?;
    Ok(server)
}

#[tauri::command]
pub fn toggle_mcp_server(db: State<DbState>, id: String, enabled: bool) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    queries::toggle_mcp_server(&conn, &id, enabled).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn remove_mcp_server(db: State<DbState>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    queries::delete_mcp_server(&conn, &id).map_err(|e| e.to_string())
}
