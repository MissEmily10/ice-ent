from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, BigInteger, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class UserRole(str, Enum):
    user = "user"
    admin = "admin"


class ApplicationStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class FieldType(str, Enum):
    text = "text"
    textarea = "textarea"
    select = "select"
    file = "file"


class User(Base):
    __tablename__ = "users"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    tg_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True)
    username: Mapped[str | None] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    language: Mapped[str] = mapped_column(String(2), default="ru")
    role: Mapped[UserRole] = mapped_column(default=UserRole.user)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Group(Base):
    __tablename__ = "groups"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    tg_chat_id: Mapped[int | None] = mapped_column(BigInteger)
    is_channel_level: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    positions: Mapped[list["Position"]] = relationship(back_populates="group", cascade="all, delete-orphan")


class AdminPermission(Base):
    __tablename__ = "admin_permissions"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    group_id: Mapped[UUID | None] = mapped_column(ForeignKey("groups.id", ondelete="CASCADE"))
    scope: Mapped[str] = mapped_column(String(30), default="group_only")


class Position(Base):
    __tablename__ = "positions"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    group_id: Mapped[UUID] = mapped_column(ForeignKey("groups.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    is_open: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    group: Mapped[Group] = relationship(back_populates="positions")
    form_fields: Mapped[list["FormField"]] = relationship(back_populates="position", cascade="all, delete-orphan", order_by="FormField.order")


class FormField(Base):
    __tablename__ = "form_fields"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    position_id: Mapped[UUID] = mapped_column(ForeignKey("positions.id", ondelete="CASCADE"))
    order: Mapped[int] = mapped_column(Integer)
    type: Mapped[FieldType] = mapped_column(default=FieldType.text)
    label: Mapped[str] = mapped_column(String(255))
    options: Mapped[list[str] | None] = mapped_column(JSON)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True)
    position: Mapped[Position] = relationship(back_populates="form_fields")


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (UniqueConstraint("user_id", "position_id", name="uq_application_user_position"),)
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    position_id: Mapped[UUID] = mapped_column(ForeignKey("positions.id", ondelete="CASCADE"))
    status: Mapped[ApplicationStatus] = mapped_column(default=ApplicationStatus.pending)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ApplicationAnswer(Base):
    __tablename__ = "application_answers"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    application_id: Mapped[UUID] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"))
    field_id: Mapped[UUID] = mapped_column(ForeignKey("form_fields.id", ondelete="CASCADE"))
    value_text: Mapped[str | None] = mapped_column(Text)
    value_file_id: Mapped[str | None] = mapped_column(Text)
