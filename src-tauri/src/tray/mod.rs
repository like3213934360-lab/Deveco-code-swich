use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

pub fn setup(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let switch_item = MenuItemBuilder::with_id("switch", "切换 Provider").build(app)?;
    let dashboard_item = MenuItemBuilder::with_id("dashboard", "打开面板").build(app)?;
    let quit_item = MenuItemBuilder::with_id("quit", "退出").build(app)?;

    let menu = MenuBuilder::new(app)
        .items(&[&switch_item, &dashboard_item, &quit_item])
        .build()?;

    TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("DevEco Switch")
        .on_menu_event(move |app, event| match event.id().as_ref() {
            "dashboard" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.unminimize();
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.unminimize();
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)?;

    Ok(())
}
