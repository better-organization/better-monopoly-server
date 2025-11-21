mod routes;

use crate::routes::routes;
use axum::Router;
use std::env;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .nest("/api", routes())
        .layer(CorsLayer::permissive());

    let host = env::var("HOST").unwrap_or("0.0.0.0".to_string());
    let port = env::var("PORT").unwrap_or("8080".to_string());

    let addr = format!("{}:{}", host, port);

    println!("Server running on http://{}", addr);
    let listener = TcpListener::bind(&addr)
        .await
        .expect("Failed to bind address");

    axum::serve(listener, app).await.expect("Server failed");
}
