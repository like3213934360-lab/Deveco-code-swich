pub mod models;
pub mod queries;

use rusqlite::Connection;
use std::path::Path;
use std::sync::Mutex;

pub struct DbState(pub Mutex<Connection>);

pub fn init(path: &Path) -> Result<Mutex<Connection>, rusqlite::Error> {
    let conn = Connection::open(path)?;
    conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
    run_migrations(&conn)?;
    Ok(Mutex::new(conn))
}

fn run_migrations(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            applied_at INTEGER NOT NULL
        );"
    )?;

    let migrations = [
        (1, "001_initial", include_str!("../../migrations/001_initial.sql")),
        (2, "002_request_logs", include_str!("../../migrations/002_request_logs.sql")),
        (3, "003_mcp_skills", include_str!("../../migrations/003_mcp_skills.sql")),
    ];

    for (id, name, sql) in migrations {
        let applied: bool = conn
            .query_row(
                "SELECT COUNT(*) > 0 FROM _migrations WHERE id = ?1",
                [id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if !applied {
            conn.execute_batch(sql)?;
            conn.execute(
                "INSERT INTO _migrations (id, name, applied_at) VALUES (?1, ?2, unixepoch())",
                rusqlite::params![id, name],
            )?;
        }
    }

    Ok(())
}
