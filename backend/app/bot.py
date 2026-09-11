import os

from aiogram import Bot, Dispatcher, Router
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo

router = Router()
MINI_APP_URL = os.getenv("MINI_APP_URL", "https://example.com")


@router.message(CommandStart())
async def start(message: Message) -> None:
    await message.answer(
        "Добро пожаловать в ICE Community. Здесь можно выбрать роль и отправить заявку.",
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[[InlineKeyboardButton(text="Открыть каталог", web_app=WebAppInfo(url=MINI_APP_URL))]]
        ),
    )


async def notify_new_application(bot: Bot, admin_chat_id: int, application_id: str, position_title: str) -> None:
    deep_link = f"{MINI_APP_URL}?application_id={application_id}"
    await bot.send_message(
        admin_chat_id,
        f"Новая заявка на должность: {position_title}",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="Подробнее", url=deep_link)]]),
    )


async def notify_status_change(bot: Bot, telegram_user_id: int, position_title: str, status: str) -> None:
    labels = {"pending": "На рассмотрении", "accepted": "Принята", "rejected": "Отклонена"}
    await bot.send_message(telegram_user_id, f"Заявка на «{position_title}»: {labels.get(status, status)}")


def create_dispatcher() -> Dispatcher:
    dispatcher = Dispatcher()
    dispatcher.include_router(router)
    return dispatcher


def bot_token() -> str:
    token = os.getenv("BOT_TOKEN")
    if not token:
        raise RuntimeError("BOT_TOKEN is not set. Add it to .env before starting the bot.")
    return token
