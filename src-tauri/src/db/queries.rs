use rusqlite::{params, Connection};
use crate::db::models::*;

pub fn list_providers(conn: &Connection) -> Result<Vec<Provider>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, name, provider_type, base_url, api_key, npm_package,
                is_active, in_failover_queue, priority, cost_multiplier,
                limit_daily_cny, limit_monthly_cny, settings_json, notes, icon,
                created_at, updated_at
         FROM providers ORDER BY priority ASC, name ASC"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Provider {
            id: row.get(0)?,
            name: row.get(1)?,
            provider_type: row.get(2)?,
            base_url: row.get(3)?,
            api_key: row.get(4)?,
            npm_package: row.get(5)?,
            is_active: row.get(6)?,
            in_failover_queue: row.get(7)?,
            priority: row.get(8)?,
            cost_multiplier: row.get(9)?,
            limit_daily_cny: row.get(10)?,
            limit_monthly_cny: row.get(11)?,
            settings_json: row.get(12)?,
            notes: row.get(13)?,
            icon: row.get(14)?,
            created_at: row.get(15)?,
            updated_at: row.get(16)?,
        })
    })?;

    rows.collect()
}

pub fn get_provider(conn: &Connection, id: &str) -> Result<Option<Provider>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, name, provider_type, base_url, api_key, npm_package,
                is_active, in_failover_queue, priority, cost_multiplier,
                limit_daily_cny, limit_monthly_cny, settings_json, notes, icon,
                created_at, updated_at
         FROM providers WHERE id = ?1"
    )?;

    let mut rows = stmt.query_map(params![id], |row| {
        Ok(Provider {
            id: row.get(0)?,
            name: row.get(1)?,
            provider_type: row.get(2)?,
            base_url: row.get(3)?,
            api_key: row.get(4)?,
            npm_package: row.get(5)?,
            is_active: row.get(6)?,
            in_failover_queue: row.get(7)?,
            priority: row.get(8)?,
            cost_multiplier: row.get(9)?,
            limit_daily_cny: row.get(10)?,
            limit_monthly_cny: row.get(11)?,
            settings_json: row.get(12)?,
            notes: row.get(13)?,
            icon: row.get(14)?,
            created_at: row.get(15)?,
            updated_at: row.get(16)?,
        })
    })?;

    Ok(rows.next().transpose()?)
}

pub fn insert_provider(conn: &Connection, p: &Provider) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO providers (id, name, provider_type, base_url, api_key, npm_package,
            is_active, in_failover_queue, priority, cost_multiplier,
            limit_daily_cny, limit_monthly_cny, settings_json, notes, icon,
            created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17)",
        params![
            p.id, p.name, p.provider_type, p.base_url, p.api_key, p.npm_package,
            p.is_active, p.in_failover_queue, p.priority, p.cost_multiplier,
            p.limit_daily_cny, p.limit_monthly_cny, p.settings_json, p.notes, p.icon,
            p.created_at, p.updated_at
        ],
    )?;
    Ok(())
}

pub fn update_provider(conn: &Connection, p: &Provider) -> Result<(), rusqlite::Error> {
    conn.execute(
        "UPDATE providers SET name=?2, provider_type=?3, base_url=?4, api_key=?5,
            npm_package=?6, is_active=?7, in_failover_queue=?8, priority=?9,
            cost_multiplier=?10, limit_daily_cny=?11, limit_monthly_cny=?12,
            settings_json=?13, notes=?14, icon=?15, updated_at=?16
         WHERE id=?1",
        params![
            p.id, p.name, p.provider_type, p.base_url, p.api_key, p.npm_package,
            p.is_active, p.in_failover_queue, p.priority, p.cost_multiplier,
            p.limit_daily_cny, p.limit_monthly_cny, p.settings_json, p.notes, p.icon,
            p.updated_at
        ],
    )?;
    Ok(())
}

pub fn delete_provider(conn: &Connection, id: &str) -> Result<(), rusqlite::Error> {
    conn.execute("DELETE FROM providers WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn set_active_provider(conn: &Connection, id: &str) -> Result<(), rusqlite::Error> {
    conn.execute("UPDATE providers SET is_active = 0", [])?;
    conn.execute("UPDATE providers SET is_active = 1 WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn list_models_for_provider(conn: &Connection, provider_id: &str) -> Result<Vec<Model>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, provider_id, model_id, display_name, tool_call, context_limit,
                output_limit, input_modalities, output_modalities,
                input_price_per_mtok, output_price_per_mtok, is_default, created_at
         FROM models WHERE provider_id = ?1"
    )?;

    let rows = stmt.query_map(params![provider_id], |row| {
        Ok(Model {
            id: row.get(0)?,
            provider_id: row.get(1)?,
            model_id: row.get(2)?,
            display_name: row.get(3)?,
            tool_call: row.get(4)?,
            context_limit: row.get(5)?,
            output_limit: row.get(6)?,
            input_modalities: row.get(7)?,
            output_modalities: row.get(8)?,
            input_price_per_mtok: row.get(9)?,
            output_price_per_mtok: row.get(10)?,
            is_default: row.get(11)?,
            created_at: row.get(12)?,
        })
    })?;

    rows.collect()
}

pub fn list_mcp_servers(conn: &Connection) -> Result<Vec<McpServer>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, name, server_type, command, args, env, enabled, description, homepage, created_at
         FROM mcp_servers ORDER BY name"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(McpServer {
            id: row.get(0)?,
            name: row.get(1)?,
            server_type: row.get(2)?,
            command: row.get(3)?,
            args: row.get(4)?,
            env: row.get(5)?,
            enabled: row.get(6)?,
            description: row.get(7)?,
            homepage: row.get(8)?,
            created_at: row.get(9)?,
        })
    })?;

    rows.collect()
}

pub fn insert_mcp_server(conn: &Connection, s: &McpServer) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO mcp_servers (id, name, server_type, command, args, env, enabled, description, homepage, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)",
        params![s.id, s.name, s.server_type, s.command, s.args, s.env, s.enabled, s.description, s.homepage, s.created_at],
    )?;
    Ok(())
}

pub fn toggle_mcp_server(conn: &Connection, id: &str, enabled: bool) -> Result<(), rusqlite::Error> {
    conn.execute("UPDATE mcp_servers SET enabled = ?2 WHERE id = ?1", params![id, enabled])?;
    Ok(())
}

pub fn delete_mcp_server(conn: &Connection, id: &str) -> Result<(), rusqlite::Error> {
    conn.execute("DELETE FROM mcp_servers WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn list_skills(conn: &Connection) -> Result<Vec<Skill>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, name, description, directory, repo_owner, repo_name, repo_branch,
                enabled, content_hash, installed_at, updated_at
         FROM skills ORDER BY name"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Skill {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            directory: row.get(3)?,
            repo_owner: row.get(4)?,
            repo_name: row.get(5)?,
            repo_branch: row.get(6)?,
            enabled: row.get(7)?,
            content_hash: row.get(8)?,
            installed_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })?;

    rows.collect()
}

pub fn get_request_logs(conn: &Connection, limit: i64, offset: i64) -> Result<Vec<RequestLog>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, provider_id, model, input_tokens, output_tokens,
                cache_read_tokens, cache_creation_tokens, total_cost_cny,
                latency_ms, first_token_ms, status_code, error_message,
                session_id, is_streaming, created_at
         FROM request_logs ORDER BY created_at DESC LIMIT ?1 OFFSET ?2"
    )?;

    let rows = stmt.query_map(params![limit, offset], |row| {
        Ok(RequestLog {
            id: row.get(0)?,
            provider_id: row.get(1)?,
            model: row.get(2)?,
            input_tokens: row.get(3)?,
            output_tokens: row.get(4)?,
            cache_read_tokens: row.get(5)?,
            cache_creation_tokens: row.get(6)?,
            total_cost_cny: row.get(7)?,
            latency_ms: row.get(8)?,
            first_token_ms: row.get(9)?,
            status_code: row.get(10)?,
            error_message: row.get(11)?,
            session_id: row.get(12)?,
            is_streaming: row.get(13)?,
            created_at: row.get(14)?,
        })
    })?;

    rows.collect()
}

pub fn get_daily_usage(conn: &Connection, start_date: &str, end_date: &str) -> Result<Vec<DailyUsage>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT date, provider_id, model, request_count, input_tokens, output_tokens, total_cost_cny
         FROM usage_daily WHERE date >= ?1 AND date <= ?2 ORDER BY date"
    )?;

    let rows = stmt.query_map(params![start_date, end_date], |row| {
        Ok(DailyUsage {
            date: row.get(0)?,
            provider_id: row.get(1)?,
            model: row.get(2)?,
            request_count: row.get(3)?,
            input_tokens: row.get(4)?,
            output_tokens: row.get(5)?,
            total_cost_cny: row.get(6)?,
        })
    })?;

    rows.collect()
}
