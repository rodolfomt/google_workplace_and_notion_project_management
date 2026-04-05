use hmac::{Hmac, Mac};
use hmac::digest::KeyInit;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sha2::Sha256;
use tauri::{AppHandle, Manager};
use tauri_plugin_global_shortcut::GlobalShortcutExt;

type HmacSha256 = Hmac<Sha256>;

// ── Configuration (loaded from env or config file at startup) ──────

const DEFAULT_MCP_ENDPOINT: &str = "https://script.google.com/macros/s/DEPLOYMENT_ID/exec";
const DEFAULT_AGENT_ID: &str = "quick_capture";

fn get_config(key: &str, default: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| default.to_string())
}

// ── HMAC signing ───────────────────────────────────────────────────

fn sign_request(body: &str, secret: &str) -> String {
    let mut mac =
        HmacSha256::new_from_slice(secret.as_bytes()).expect("HMAC accepts any key length");
    mac.update(body.as_bytes());
    hex::encode(mac.finalize().into_bytes())
}

// ── MCP JSON-RPC request ───────────────────────────────────────────

#[derive(Serialize)]
struct JsonRpcRequest {
    jsonrpc: String,
    method: String,
    params: serde_json::Value,
    id: u32,
}

#[derive(Deserialize)]
struct JsonRpcResponse {
    result: Option<serde_json::Value>,
    error: Option<serde_json::Value>,
}

async fn call_mcp_tool(
    client: &Client,
    tool_name: &str,
    params: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let endpoint = get_config("BOARD_MCP_ENDPOINT", DEFAULT_MCP_ENDPOINT);
    let secret = get_config("BOARD_MCP_SECRET", "");
    let agent_id = get_config("BOARD_MCP_AGENT_ID", DEFAULT_AGENT_ID);

    let rpc = JsonRpcRequest {
        jsonrpc: "2.0".into(),
        method: tool_name.into(),
        params: serde_json::json!({
            "agent_id": agent_id,
            "args": params,
        }),
        id: 1,
    };

    let body = serde_json::to_string(&rpc).map_err(|e| e.to_string())?;
    let signature = sign_request(&body, &secret);

    let resp = client
        .post(&endpoint)
        .header("Content-Type", "application/json")
        .header("X-MCP-Signature", signature)
        .body(body)
        .send()
        .await
        .map_err(|e| format!("HTTP error: {e}"))?;

    let rpc_resp: JsonRpcResponse = resp.json().await.map_err(|e| format!("Parse error: {e}"))?;

    if let Some(err) = rpc_resp.error {
        return Err(format!("MCP error: {err}"));
    }

    rpc_resp
        .result
        .ok_or_else(|| "Empty MCP response".to_string())
}

// ── Tauri commands ─────────────────────────────────────────────────

/// Tier 1: Create a task directly via board_create_task MCP tool.
/// Called when the frontend NLP parser is confident enough.
#[tauri::command]
async fn create_task_direct(
    title: String,
    project_id: Option<String>,
    epic_id: Option<String>,
    priority: Option<String>,
    due_date: Option<String>,
    scheduled_date: Option<String>,
    tags: Vec<String>,
    assignee: Option<String>,
    effort_h: Option<f64>,
) -> Result<String, String> {
    let client = Client::new();
    let mut params = serde_json::Map::new();
    params.insert("title".into(), serde_json::Value::String(title.clone()));

    if let Some(v) = project_id {
        params.insert("project_id".into(), serde_json::Value::String(v));
    }
    if let Some(v) = epic_id {
        params.insert("epic_id".into(), serde_json::Value::String(v));
    }
    if let Some(v) = priority {
        params.insert("priority".into(), serde_json::Value::String(v));
    }
    if let Some(v) = due_date {
        params.insert("due_date".into(), serde_json::Value::String(v));
    }
    if let Some(v) = scheduled_date {
        params.insert("scheduled_date".into(), serde_json::Value::String(v));
    }
    if !tags.is_empty() {
        params.insert("tags".into(), serde_json::Value::String(tags.join(",")));
    }
    if let Some(v) = assignee {
        params.insert("assignee".into(), serde_json::Value::String(v));
    }
    if let Some(v) = effort_h {
        params.insert(
            "effort_h".into(),
            serde_json::Value::Number(serde_json::Number::from_f64(v).unwrap()),
        );
    }

    let result = call_mcp_tool(
        &client,
        "board_create_task",
        serde_json::Value::Object(params),
    )
    .await?;

    // Return the task_id from the response
    result
        .get("task_id")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| format!("Task created but no task_id in response: {result}"))
}

/// Tier 2: Send raw natural-language input to an agent endpoint.
/// The agent (Claude/GPT via MCP) parses the input and creates the task.
#[tauri::command]
async fn create_task_via_agent(raw_input: String) -> Result<String, String> {
    let client = Client::new();

    // The agent endpoint receives raw text and uses the Board MCP
    // tools to parse and create the task. This could be:
    // 1. A dedicated Apps Script function that calls an LLM (Gemini)
    // 2. A separate agent service that has Board MCP access
    // 3. An NLP-parse endpoint on the Board MCP itself

    let params = serde_json::json!({
        "raw_text": raw_input,
        "source": "quick_capture",
    });

    let result = call_mcp_tool(&client, "board_parse_and_create_task", params).await?;

    // Return human-readable confirmation
    let task_id = result
        .get("task_id")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown");
    let title = result
        .get("title")
        .and_then(|v| v.as_str())
        .unwrap_or("(untitled)");

    Ok(format!("{title} ({task_id})"))
}

/// Hide the window (called on Escape or after task creation).
#[tauri::command]
async fn hide_window(app: AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.hide();
    }
}

// ── App setup ──────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            create_task_direct,
            create_task_via_agent,
            hide_window,
        ])
        .setup(|app| {
            // Register the global shortcut: Ctrl+Shift+T (Cmd+Shift+T on macOS)
            use tauri_plugin_global_shortcut::ShortcutState;

            let handle = app.handle().clone();
            app.global_shortcut().on_shortcut(
                "CmdOrCtrl+Shift+T",
                move |_app, shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        let _ = shortcut; // suppress unused warning
                        if let Some(w) = handle.get_webview_window("main") {
                            if w.is_visible().unwrap_or(false) {
                                let _ = w.hide();
                            } else {
                                let _ = w.show();
                                let _ = w.set_focus();
                            }
                        }
                    }
                },
            )?;

            // Start hidden — the window only appears on shortcut
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.hide();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
