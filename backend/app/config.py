from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key:           str = ""
    database_url:             str = ""
    supabase_url:             str = ""
    supabase_jwt_secret:      str = ""
    supabase_service_role_key: str = ""
    environment:              str = "development"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
