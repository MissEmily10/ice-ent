import asyncio
from pathlib import Path

from dotenv import load_dotenv
from aiogram import Bot

from app.bot import bot_token, create_dispatcher

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


async def main() -> None:
    bot = Bot(token=bot_token())
    dispatcher = create_dispatcher()
    await bot.delete_webhook(drop_pending_updates=True)
    await dispatcher.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
