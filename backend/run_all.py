import asyncio
import os
from pathlib import Path

import uvicorn
from aiogram import Bot
from dotenv import load_dotenv

from app.bot import bot_token, create_dispatcher
from app.main import app

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


async def run_bot() -> None:
    bot = Bot(token=bot_token())
    try:
        await bot.delete_webhook(drop_pending_updates=True)
        await create_dispatcher().start_polling(bot)
    finally:
        await bot.session.close()


async def run_api() -> None:
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        proxy_headers=True,
        log_level="info",
    )
    await uvicorn.Server(config).serve()


async def main() -> None:
    await asyncio.gather(run_api(), run_bot())


if __name__ == "__main__":
    asyncio.run(main())
