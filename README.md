# Tiishka

E-commerce с AI-генерацией дизайнов. Курсовая ИС (ИТМО).

## Быстрый старт

### 1. Установка
```bash
make install
make config
```

Отредактируй `.env`, `ai-gateway/.env`, `.env.helios` (подставь свои данные)

### 2. SSH Config
Добавь в `~/.ssh/config`:
```
Host tiishka-helios
    HostName se.ifmo.ru
    User s409858
    Port 2222
```
(Замени `s409858` на свой логин)

### 3. Запуск (4 терминала)

**Терминал 1 — AI Gateway туннель**
```bash
make tunnel
```

**Терминал 2 — Обратный туннель для Helios**
```bash
make tunnel-reverse
```

**Терминал 3 — Backend туннель**
```bash
make helios-tunnel
```

**Терминал 4 — Frontend**
```bash
make frontend
```

Открой http://localhost:3000

### 4. Деплой на Helios
```bash
make deploy-helios
ssh tiishka-helios
cd coursework && ./start.sh
```

## Что где слушает
- `3000` — Frontend (у тебя)
- `8080` — Backend через туннель (Helios:31337 → localhost:8080)
- `9999` — AI Gateway через туннель (VPS → localhost:9999)

## Если порт занят
Измени `HELIOS_REVERSE_PORT` в `.env` (по умолчанию 33334)
