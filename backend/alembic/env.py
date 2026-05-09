"""
Alembic environment configuration.
Configures Alembic to use the application's database settings and models.
"""

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.base import Base
from app.core.config import settings

# Import all models so they register with Base.metadata
from app.models.user import User
from app.models.crop import Crop
from app.models.mandi_price import MandiPrice
from app.models.prediction import Prediction
from app.models.expense import Expense

# Alembic Config object
config = context.config

# Override database URL from settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Setup logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Target metadata for auto-generation
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
