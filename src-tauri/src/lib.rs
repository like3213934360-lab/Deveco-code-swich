mod commands;
mod db;
mod services;
mod tray;
mod utils;

use tauri::Manager;
use commands::proxy::ProxyState;
use services::proxy_service::ProxyServer;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let app_handle = app.handle().clone();
            let db_path = app_handle
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir")
                .join("deveco-switch.db");

            std::fs::create_dir_all(db_path.parent().unwrap()).ok();

            let pool = db::init(&db_path).expect("failed to initialize database");
            app.manage(db::DbState(pool));

            app.manage(ProxyState(tokio::sync::Mutex::new(ProxyServer::new())));

            tray::setup(&app_handle)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::provider::list_providers,
            commands::provider::create_provider,
            commands::provider::update_provider,
            commands::provider::delete_provider,
            commands::provider::switch_provider,
            commands::provider::test_provider,
            commands::version::get_current_version,
            commands::version::list_available_versions,
            commands::version::install_version,
            commands::config::read_config,
            commands::config::write_config,
            commands::config::get_config_path,
            commands::cost::get_cost_summary,
            commands::cost::get_request_logs,
            commands::cost::get_daily_usage,
            commands::mcp::list_mcp_servers,
            commands::mcp::add_mcp_server,
            commands::mcp::toggle_mcp_server,
            commands::mcp::remove_mcp_server,
            commands::skill::list_skills,
            commands::skill::install_skill,
            commands::skill::toggle_skill,
            commands::health::check_all_health,
            commands::health::get_health_history,
            commands::proxy::start_proxy,
            commands::proxy::stop_proxy,
            commands::proxy::get_proxy_status,
            commands::proxy::update_proxy_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
