from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr
from typing import Optional


class Settings(BaseSettings):
    digitalocean_inference_key: Optional[SecretStr] = None
    digitalocean_model: str = "kimi-k3"  # Default recommended model on DO Inference
    digitalocean_inference_url: str = "https://inference.do-ai.run/v1/chat/completions"
    moonshot_api_key: Optional[SecretStr] = None
    moonshot_api_base_url: str = "https://api.moonshot.ai/v1"
    moonshot_model: str = "kimi-k3"
    
    # Credit Optimization Controls
    enable_ai_explanations: bool = True
    max_ai_tokens: int = 500
    max_per_scan_ai_calls: int = 3
    
    # Service settings
    host: str = "127.0.0.1"
    port: int = 8000
    environment: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    @property
    def moonshot_configured(self) -> bool:
        return _is_configured(self.moonshot_api_key)

    @property
    def digitalocean_configured(self) -> bool:
        return _is_configured(self.digitalocean_inference_key)


def _is_configured(secret: Optional[SecretStr]) -> bool:
    if secret is None:
        return False
    value = secret.get_secret_value().strip()
    return bool(value) and not value.startswith("your_")


settings = Settings()
