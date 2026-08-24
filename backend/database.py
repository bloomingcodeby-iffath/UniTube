import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

# Reads DATABASE_URL from environment (set this on Render).
# Falls back to local MySQL for local development.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:@localhost/unitube_db"
)

# Hosted MySQL providers (e.g. Aiven) require SSL. Only add the
# connect_args when we're NOT talking to plain localhost.
connect_args = {}
if "localhost" not in DATABASE_URL and "127.0.0.1" not in DATABASE_URL:
    connect_args = {"ssl": {"ssl_mode": "REQUIRED"}}

engine = create_engine(
    DATABASE_URL,
    echo=True,
    connect_args=connect_args,
)


SessionLocal = sessionmaker(

    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()
