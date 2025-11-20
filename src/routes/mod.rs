use axum::Router;
use axum::routing::get;
use crate::routes::health::health_check;

mod health;

pub fn routes() -> Router {
    Router::new().route("/health", get(health_check))
}