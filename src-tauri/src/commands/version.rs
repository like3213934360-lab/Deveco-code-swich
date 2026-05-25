use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct VersionInfo {
    pub version: String,
    pub tag: Option<String>,
    pub is_current: bool,
}

fn shell_command(cmd: &str) -> tokio::process::Command {
    let mut c = tokio::process::Command::new("/bin/zsh");
    c.args(["-lc", cmd]);
    c
}

#[tauri::command]
pub async fn get_current_version() -> Result<String, String> {
    let output = shell_command("deveco --version")
        .output()
        .await
        .map_err(|e| format!("Failed to run deveco: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err("DevEco Code not installed or not in PATH".to_string())
    }
}

#[tauri::command]
pub async fn list_available_versions() -> Result<Vec<VersionInfo>, String> {
    let output = shell_command("npm view @deveco-test/deveco-code versions --json --registry=https://registry.npmjs.org")
        .output()
        .await
        .map_err(|e| format!("Failed to query npm: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let versions: Vec<String> = serde_json::from_slice(&output.stdout)
        .map_err(|e| e.to_string())?;

    let current = get_current_version().await.unwrap_or_default();

    let infos: Vec<VersionInfo> = versions
        .into_iter()
        .rev()
        .map(|v| {
            let is_current = v == current;
            VersionInfo { version: v, tag: None, is_current }
        })
        .collect();

    Ok(infos)
}

#[tauri::command]
pub async fn install_version(version: String) -> Result<String, String> {
    let cmd = format!("npm install -g @deveco-test/deveco-code@{} --registry=https://registry.npmjs.org", version);
    let output = shell_command(&cmd)
        .output()
        .await
        .map_err(|e| format!("Failed to install: {}", e))?;

    if output.status.success() {
        Ok(format!("Installed @deveco-test/deveco-code@{}", version))
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
