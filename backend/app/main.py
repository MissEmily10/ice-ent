from contextlib import asynccontextmanager
import os
import re
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from uuid import UUID

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from .models import Application, ApplicationAnswer, ApplicationStatus, Base, FormField, Group, Position, User

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://ice:ice@localhost:5432/ice_bot")


def normalize_database_url(url: str) -> str:
    """Remove Supabase pooler flags that asyncpg does not accept as keywords."""
    url = re.sub(r"@\[([A-Za-z0-9.-]+)\](:\d+)?/", r"@\1\2/", url)
    parts = urlsplit(url)
    query = [(key, value) for key, value in parse_qsl(parts.query, keep_blank_values=True) if key != "pgbouncer"]
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


DATABASE_URL = normalize_database_url(DATABASE_URL)
engine = create_async_engine(DATABASE_URL, echo=False)
Session = async_sessionmaker(engine, expire_on_commit=False)


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title="ICE Community API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",") if origin.strip()],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def db() -> AsyncSession:
    async with Session() as session:
        yield session


async def current_user(x_telegram_init_data: str | None = Header(default=None)) -> User:
    # Production: validate Telegram WebApp initData before resolving this user.
    return User(id=UUID("00000000-0000-0000-0000-000000000001"), tg_id=0, full_name="Demo user", role="admin")


class AnswerIn(BaseModel):
    field_id: UUID
    value: str = ""


class ApplicationIn(BaseModel):
    position_id: UUID
    answers: list[AnswerIn] = Field(default_factory=list)


class StatusIn(BaseModel):
    status: ApplicationStatus


@app.get("/api/catalog")
async def catalog(scope: str = "all", group_id: UUID | None = None, position_id: UUID | None = None, is_open: bool | None = None, session: AsyncSession = Depends(db)):
    query = select(Position, Group).join(Group)
    if group_id:
        query = query.where(Position.group_id == group_id)
    if position_id:
        query = query.where(Position.id == position_id)
    if is_open is not None:
        query = query.where(Position.is_open == is_open)
    if scope == "channel":
        query = query.where(Group.is_channel_level.is_(True))
    if scope == "group":
        query = query.where(Group.is_channel_level.is_(False))
    rows = (await session.execute(query)).all()
    return [{"id": str(position.id), "title": position.title, "description": position.description, "is_open": position.is_open, "group": {"id": str(group.id), "title": group.title, "is_channel_level": group.is_channel_level}} for position, group in rows]


@app.get("/api/positions/{position_id}/form")
async def position_form(position_id: UUID, session: AsyncSession = Depends(db)):
    fields = (await session.scalars(select(FormField).where(FormField.position_id == position_id).order_by(FormField.order))).all()
    return [{"id": str(field.id), "type": field.type, "label": field.label, "options": field.options, "is_required": field.is_required} for field in fields]


@app.post("/api/applications")
async def submit_application(payload: ApplicationIn, user: User = Depends(current_user), session: AsyncSession = Depends(db)):
    position = await session.get(Position, payload.position_id)
    if not position or not position.is_open:
        raise HTTPException(400, "Position is closed")
    application = (await session.scalars(select(Application).where(Application.user_id == user.id, Application.position_id == payload.position_id))).first()
    if application is None:
        application = Application(user_id=user.id, position_id=payload.position_id)
        session.add(application)
        await session.flush()
    application.status = ApplicationStatus.pending
    await session.execute(ApplicationAnswer.__table__.delete().where(ApplicationAnswer.application_id == application.id))
    session.add_all([ApplicationAnswer(application_id=application.id, field_id=answer.field_id, value_text=answer.value) for answer in payload.answers])
    await session.commit()
    return {"id": str(application.id), "status": application.status}


@app.get("/api/applications/my")
async def my_applications(user: User = Depends(current_user), session: AsyncSession = Depends(db)):
    rows = (await session.execute(select(Application, Position, Group).join(Position).join(Group).where(Application.user_id == user.id).order_by(Application.created_at.desc()))).all()
    return [{"id": str(application.id), "status": application.status, "position": position.title, "group": group.title, "created_at": application.created_at} for application, position, group in rows]


@app.get("/api/admin/groups")
async def admin_groups(session: AsyncSession = Depends(db)):
    return [{"id": str(group.id), "title": group.title, "description": group.description, "is_channel_level": group.is_channel_level} for group in (await session.scalars(select(Group).order_by(Group.created_at))).all()]


@app.get("/api/admin/positions")
async def admin_positions(group_id: UUID | None = None, session: AsyncSession = Depends(db)):
    query = select(Position, Group).join(Group)
    if group_id:
        query = query.where(Position.group_id == group_id)
    return [{"id": str(position.id), "title": position.title, "is_open": position.is_open, "group": group.title} for position, group in (await session.execute(query)).all()]


@app.post("/api/admin/applications/{application_id}/status")
async def change_status(application_id: UUID, payload: StatusIn, session: AsyncSession = Depends(db)):
    application = await session.get(Application, application_id)
    if not application:
        raise HTTPException(404, "Application not found")
    application.status = payload.status
    await session.commit()
    return {"id": str(application.id), "status": application.status}
