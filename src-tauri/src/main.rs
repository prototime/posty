// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use once_cell::sync::OnceCell;
use twitter_v2::TwitterApi;
use twitter_v2::authorization::Oauth1aToken;
use dotenv::dotenv;
use serde::{Serialize, Deserialize};

// Global Twitter client with Oauth1aToken as the authorization type
static TWITTER_CLIENT: OnceCell<TwitterApi<Oauth1aToken>> = OnceCell::new();

fn initialize_twitter_client() -> Result<TwitterApi<Oauth1aToken>, String> {
    let api_key = std::env::var("PUBLIC_TWITTER_API_KEY")
        .map_err(|_| "Missing PUBLIC_TWITTER_API_KEY environment variable".to_string())?;
    let api_secret = std::env::var("PUBLIC_TWITTER_API_KEY_SECRET")
        .map_err(|_| "Missing PUBLIC_TWITTER_API_KEY_SECRET environment variable".to_string())?;
    let access_token = std::env::var("PUBLIC_TWITTER_ACCESS_TOKEN")
        .map_err(|_| "Missing PUBLIC_TWITTER_ACCESS_TOKEN environment variable".to_string())?;
    let access_token_secret = std::env::var("PUBLIC_TWITTER_ACCESS_TOKEN_SECRET")
        .map_err(|_| "Missing PUBLIC_TWITTER_ACCESS_TOKEN_SECRET environment variable".to_string())?;

    // Create OAuth1a token
    let oauth1a_token = Oauth1aToken::new(
        api_key,
        api_secret,
        access_token,
        access_token_secret,
    );

    Ok(TwitterApi::new(oauth1a_token))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FilePayload {
    buffer: Vec<u8>,
    type_: String,  // Using type_ because 'type' is a reserved keyword
}

#[derive(Debug, Serialize)]
pub struct Tweet {
    id: String,
    text: String,
}

#[tauri::command]
async fn post_tweet(message: String, files: Vec<FilePayload>) -> Result<Tweet, String> {
    // Get the initialized client
    let twitter_client = TWITTER_CLIENT.get()
        .ok_or("Twitter client not initialized")?;

    // TODO: Need to upload media first and then reference it here

    let response = twitter_client.post_tweet()
        .text(message)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let tweet_data = response.data
        .as_ref()
        .ok_or("No tweet data received")?;

    Ok(Tweet {
        id: tweet_data.id.to_string(),
        text: tweet_data.text.clone(),
    })
}

fn main() {
    // Load .env file
    dotenv().ok();

    // Initialize Twitter client
    let twitter_client = initialize_twitter_client()
        .expect("Failed to initialize Twitter client");
    TWITTER_CLIENT.set(twitter_client)
        .expect("Failed to set Twitter client");

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![post_tweet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
