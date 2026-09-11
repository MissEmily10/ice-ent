# ICE Community Bot + Mini App

MVP для набора на должности уровня канала и связанных групп.

## Структура

- `backend/app/models.py` — SQLAlchemy схема `users`, `admin_permissions`, `groups`, `positions`, `form_fields`, `applications`, `application_answers`.
- `backend/app/main.py` — FastAPI endpoints из ТЗ. Слой валидации Telegram `initData` отмечен в `current_user`.
- `src/` — React Mini App интерфейс: каталог, карточка должности, динамическая форма, заявки и admin workspace.
- `docker-compose.yml` — PostgreSQL 16 для локального запуска.

## Запуск

Нужны Node.js 20+ и Python 3.11+.

```bash
docker compose up -d
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cp .env.example .env
uvicorn backend.app.main:app --reload
```

В `.env` вставь токен, который выдал `@BotFather`, в переменную `BOT_TOKEN`. Сам файл `.env` игнорируется git.

Для отдельного frontend-хостинга задай `CORS_ORIGINS` равным адресу Mini App, а `DATABASE_URL` — строке подключения к PostgreSQL на хостинге.

Запуск бота в отдельном терминале из корня проекта:

```bash
source .venv/bin/activate
PYTHONPATH=backend python backend/run_bot.py
```

В отдельном терминале:

```bash
npm install
npm run dev
```

Перед production необходимо заменить demo-пользователя на проверку Telegram WebApp `initData` и связать уведомления о новых заявках со статусами в API.
