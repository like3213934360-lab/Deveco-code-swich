use tauri::State;
use crate::db::{models::Skill, queries, DbState};

#[tauri::command]
pub fn list_skills(db: State<DbState>) -> Result<Vec<Skill>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    queries::list_skills(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn install_skill(repo: String, name: String) -> Result<String, String> {
    let cmd = format!("npx skills add {}/{}", repo, name);
    let output = tokio::process::Command::new("/bin/zsh")
        .args(["-lc", &cmd])
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub fn toggle_skill(db: State<DbState>, id: String, enabled: bool) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE skills SET enabled = ?2 WHERE id = ?1",
        rusqlite::params![id, enabled],
    ).map_err(|e| e.to_string())?;
    Ok(())
}
