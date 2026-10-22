from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AliasChoices, Field
from typing import Optional


class Settings(BaseSettings):
    # AI Provider: 'auto', 'digitalocean', 'kimi_direct', or 'mock'
    ai_provider: str = "auto"

    # DigitalOcean Serverless Inference Settings
    digitalocean_inference_key: Optional[str] = ""
    digitalocean_model: str = "kimi-k3"  # Kimi K3 on DigitalOcean Inference
    digitalocean_inference_url: str = "https://inference.do-ai.run/v1/chat/completions"

    # Direct Kimi / Moonshot API Settings (if using direct Moonshot key)
    kimi_api_key: Optional[str] = Field(
        default="",
        validation_alias=AliasChoices("MOONSHOT_API_KEY", "KIMI_API_KEY")
    )
    kimi_base_url: str = Field(
        default="https://api.moonshot.ai/v1/chat/completions",
        validation_alias=AliasChoices("MOONSHOT_API_BASE_URL", "KIMI_BASE_URL")
    )
    kimi_model: str = Field(
        default="kimi-k3",
        validation_alias=AliasChoices("MOONSHOT_MODEL", "KIMI_MODEL")
    )

    # Credit Optimization & Token Safeguards
    enable_ai_explanations: bool = True
    max_ai_tokens: int = 600
    max_per_scan_ai_calls: int = 3
    request_timeout_seconds: float = 15.0

    # Service & Storage
    host: str = "127.0.0.1"
    port: int = 8000
    environment: str = "development"
    max_upload_size_mb: int = 10
    # Allow normal sized repositories while keeping archive extraction bounded.
    max_extracted_files: int = 500

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

    def get_resolved_provider(self) -> str:
        """
        Determines the active AI provider based on configuration.
        Honesty guarantee: Returns 'digitalocean', 'kimi_direct', or 'mock'.
        """
        if self.ai_provider == "digitalocean" and self.digitalocean_inference_key and not self.digitalocean_inference_key.startswith("your_"):
            return "digitalocean"
        if self.ai_provider == "kimi_direct" and self.kimi_api_key and not self.kimi_api_key.startswith("your_"):
            return "kimi_direct"
        
        # Auto-detect if set to auto
        if self.ai_provider == "auto":
            if self.kimi_api_key and not self.kimi_api_key.startswith("your_"):
                return "kimi_direct"
            if self.digitalocean_inference_key and not self.digitalocean_inference_key.startswith("your_"):
                return "digitalocean"
        
        return "mock"


settings = Settings()
