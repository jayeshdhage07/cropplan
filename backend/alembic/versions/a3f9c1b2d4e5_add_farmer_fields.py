"""add farmer fields and language preference

Revision ID: a3f9c1b2d4e5
Revises: 128be0a252e1
Create Date: 2026-05-17 08:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3f9c1b2d4e5'
down_revision: Union[str, None] = '128be0a252e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add farmer-specific fields and language preference to users table.
    
    Uses server_default to safely add columns without breaking existing rows.
    """
    # Add preferred_language with default 'en' for existing users
    op.add_column(
        'users',
        sa.Column('preferred_language', sa.String(5), nullable=False, server_default='en')
    )

    # Add village field
    op.add_column(
        'users',
        sa.Column('village', sa.String(200), nullable=True)
    )

    # Add primary crops (comma-separated text)
    op.add_column(
        'users',
        sa.Column('primary_crops', sa.Text(), nullable=True)
    )

    # Add land size in acres
    op.add_column(
        'users',
        sa.Column('land_size_acres', sa.Numeric(8, 2), nullable=True)
    )


def downgrade() -> None:
    """Remove farmer-specific fields from users table."""
    op.drop_column('users', 'land_size_acres')
    op.drop_column('users', 'primary_crops')
    op.drop_column('users', 'village')
    op.drop_column('users', 'preferred_language')
