# Tiishka

E-commerce с AI-генерацией дизайнов. Курсовая ИС (ИТМО).

## Запуск

### 1. Установка
```bash
make install
make config
# Отредактировать .env, ai-gateway/.env, .env.helios
```

### 2. Туннели (3 терминала)

**Терминал 1 — AI Gateway**
```bash
make tunnel
make tunnel-reverse
```

**Терминал 2 — Backend**
```bash
make helios-tunnel
```

**Терминал 3 — Frontend**
```bash
make frontend
```

### 3. Деплой на Helios
```bash
make deploy-helios
ssh -p 2222 USER@se.ifmo.ru
cd coursework && ./start.sh
```

## Порты
- 3000 — Frontend
- 8080 — Backend (туннель)
- 9999 — AI Gateway (туннель)
