use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Provider {
    pub id: String,
    pub name: String,
    pub provider_type: String,
    pub base_url: String,
    pub api_key: Option<String>,
    pub npm_package: Option<String>,
    pub is_active: bool,
    pub in_failover_queue: bool,
    pub priority: i32,
    pub cost_multiplier: f64,
    pub limit_daily_cny: Option<f64>,
    pub limit_monthly_cny: Option<f64>,
    pub settings_json: String,
    pub notes: Option<String>,
    pub icon: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Model {
    pub id: String,
    pub provider_id: String,
    pub model_id: String,
    pub display_name: Option<String>,
    pub tool_call: bool,
    pub context_limit: i64,
    pub output_limit: i64,
    pub input_modalities: String,
    pub output_modalities: String,
    pub input_price_per_mtok: f64,
    pub output_price_per_mtok: f64,
    pub is_default: bool,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Version {
    pub id: i64,
    pub version: String,
    pub install_path: Option<String>,
    pub is_active: bool,
    pub npm_tag: Option<String>,
    pub installed_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EndpointHealth {
    pub provider_id: String,
    pub status: String,
    pub latency_ms: Option<i64>,
    pub last_check_at: Option<i64>,
    pub last_success_at: Option<i64>,
    pub last_failure_at: Option<i64>,
    pub consecutive_failures: i32,
    pub circuit_state: String,
    pub circuit_opened_at: Option<i64>,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestLog {
    pub id: String,
    pub provider_id: Option<String>,
    pub model: Option<String>,
    pub input_tokens: i64,
    pub output_tokens: i64,
    pub cache_read_tokens: i64,
    pub cache_creation_tokens: i64,
    pub total_cost_cny: f64,
    pub latency_ms: Option<i64>,
    pub first_token_ms: Option<i64>,
    pub status_code: Option<i32>,
    pub error_message: Option<String>,
    pub session_id: Option<String>,
    pub is_streaming: bool,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DailyUsage {
    pub date: String,
    pub provider_id: Option<String>,
    pub model: Option<String>,
    pub request_count: i64,
    pub input_tokens: i64,
    pub output_tokens: i64,
    pub total_cost_cny: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpServer {
    pub id: String,
    pub name: String,
    pub server_type: String,
    pub command: String,
    pub args: String,
    pub env: String,
    pub enabled: bool,
    pub description: Option<String>,
    pub homepage: Option<String>,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Skill {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub directory: Option<String>,
    pub repo_owner: Option<String>,
    pub repo_name: Option<String>,
    pub repo_branch: String,
    pub enabled: bool,
    pub content_hash: Option<String>,
    pub installed_at: i64,
    pub updated_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostSummary {
    pub total_requests: i64,
    pub total_input_tokens: i64,
    pub total_output_tokens: i64,
    pub total_cost_cny: f64,
    pub by_provider: Vec<ProviderCost>,
    pub by_model: Vec<ModelCost>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderCost {
    pub provider_id: String,
    pub provider_name: String,
    pub request_count: i64,
    pub total_cost_cny: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelCost {
    pub model: String,
    pub request_count: i64,
    pub total_cost_cny: f64,
}
