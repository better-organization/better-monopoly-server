use crate::routes::health::health_check;
use axum::Router;
use axum::routing::get;

mod health;

pub fn routes() -> Router {
    Router::new().route("/health", get(health_check))
}
