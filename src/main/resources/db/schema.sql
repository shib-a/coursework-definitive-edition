CREATE TABLE IF NOT EXISTS tiishka_users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    authority VARCHAR(50) NOT NULL DEFAULT 'USER',
    registered_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE
);

-- Аккаунты (логин/пароль)
CREATE TABLE IF NOT EXISTS tiishka_accounts (
    account_id SERIAL PRIMARY KEY,
    login VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES tiishka_users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Профили пользователей
CREATE TABLE IF NOT EXISTS tiishka_user_profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES tiishka_users(user_id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    bio TEXT,
    birthdate DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Токены подтверждения
CREATE TABLE IF NOT EXISTS tiishka_confirm_tokens (
    token_id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES tiishka_users(user_id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Запросы на сброс пароля
CREATE TABLE IF NOT EXISTS tiishka_reset_password_requests (
    request_id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES tiishka_users(user_id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Социальные сети
CREATE TABLE IF NOT EXISTS tiishka_social_network_auth (
    social_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES tiishka_users(user_id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

CREATE TABLE IF NOT EXISTS tiishka_ai_models (
    model_id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    api_endpoint TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Темы генерации
CREATE TABLE IF NOT EXISTS tiishka_generation_themes (
    theme_id SERIAL PRIMARY KEY,
    theme_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Запросы на генерацию
CREATE TABLE IF NOT EXISTS tiishka_generation_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES tiishka_users(user_id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    model_id INTEGER REFERENCES tiishka_ai_models(model_id),
    theme_id INTEGER REFERENCES tiishka_generation_themes(theme_id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Дизайны
CREATE TABLE IF NOT EXISTS tiishka_designs (
    design_id SERIAL PRIMARY KEY,
    design_name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INTEGER REFERENCES tiishka_users(user_id) ON DELETE SET NULL,
    request_id INTEGER REFERENCES tiishka_generation_requests(request_id) ON DELETE SET NULL,
    theme_id INTEGER REFERENCES tiishka_generation_themes(theme_id),
    prompt TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Изображения (base64 data)
CREATE TABLE IF NOT EXISTS tiishka_image_data (
    image_id SERIAL PRIMARY KEY,
    design_id INTEGER NOT NULL REFERENCES tiishka_designs(design_id) ON DELETE CASCADE,
    image_base64 TEXT NOT NULL,
    image_format VARCHAR(10) DEFAULT 'png',
    image_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ссылки на изображения
CREATE TABLE IF NOT EXISTS tiishka_image_links (
    link_id SERIAL PRIMARY KEY,
    design_id INTEGER NOT NULL REFERENCES tiishka_designs(design_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Страны
CREATE TABLE IF NOT EXISTS tiishka_countries (
    country_id SERIAL PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL,
    country_code VARCHAR(3) UNIQUE NOT NULL
);

-- Товары
CREATE TABLE IF NOT EXISTS tiishka_products (
    product_id SERIAL PRIMARY KEY,
    design_id INTEGER NOT NULL REFERENCES tiishka_designs(design_id) ON DELETE CASCADE,
    product_type VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Корзина
CREATE TABLE IF NOT EXISTS tiishka_cart_items (
    cart_item_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES tiishka_users(user_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES tiishka_products(product_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Адреса доставки
CREATE TABLE IF NOT EXISTS tiishka_addresses (
    address_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES tiishka_users(user_id) ON DELETE CASCADE,
    country_id INTEGER REFERENCES tiishka_countries(country_id),
    city VARCHAR(100),
    street VARCHAR(255),
    building VARCHAR(50),
    apartment VARCHAR(50),
    postal_code VARCHAR(20),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Заказы
CREATE TABLE IF NOT EXISTS tiishka_orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES tiishka_users(user_id) ON DELETE CASCADE,
    address_id INTEGER REFERENCES tiishka_addresses(address_id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Позиции заказа
CREATE TABLE IF NOT EXISTS tiishka_order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES tiishka_orders(order_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES tiishka_products(product_id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Избранное
CREATE TABLE IF NOT EXISTS tiishka_user_favourites (
    favourite_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES tiishka_users(user_id) ON DELETE CASCADE,
    design_id INTEGER NOT NULL REFERENCES tiishka_designs(design_id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, design_id)
);

-- Тикеты поддержки
CREATE TABLE IF NOT EXISTS tiishka_support_tickets (
    ticket_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES tiishka_users(user_id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(50) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP
);

-- Сообщения в тикетах
CREATE TABLE IF NOT EXISTS tiishka_ticket_messages (
    message_id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tiishka_support_tickets(ticket_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES tiishka_users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_staff_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Рейтинги тикетов
CREATE TABLE IF NOT EXISTS tiishka_ticket_ratings (
    rating_id SERIAL PRIMARY KEY,
    ticket_id INTEGER UNIQUE NOT NULL REFERENCES tiishka_support_tickets(ticket_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES tiishka_users(user_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON tiishka_users(username);
CREATE INDEX IF NOT EXISTS idx_accounts_login ON tiishka_accounts(login);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON tiishka_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_user_id ON tiishka_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_designs_created_at ON tiishka_designs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_design_id ON tiishka_products(design_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON tiishka_cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON tiishka_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON tiishka_order_items(order_id);

-- AI Models
INSERT INTO tiishka_ai_models (model_id, model_name, provider, description) VALUES
(1, 'DALL-E 3', 'OpenAI', 'OpenAI DALL-E 3 - high quality image generation'),
(2, 'DALL-E 2', 'OpenAI', 'OpenAI DALL-E 2 - fast image generation'),
(3, 'Stable Diffusion 3.5', 'Stability AI', 'Stable Diffusion 3.5 - open source model'),
(4, 'SD 3.5 Flash', 'Stability AI', 'Stable Diffusion 3.5 Flash - fast generation'),
(999, 'Mock AI Service', 'Mock', 'Mock service for testing without API')
ON CONFLICT (model_id) DO NOTHING;

-- Generation Themes
INSERT INTO tiishka_generation_themes (theme_name, description) VALUES
('minimalist', 'Clean and simple designs'),
('vintage', 'Retro and classic styles'),
('modern', 'Contemporary and sleek'),
('abstract', 'Abstract and artistic'),
('nature', 'Nature-inspired designs'),
('tech', 'Technology and futuristic'),
('cute', 'Cute and playful'),
('elegant', 'Sophisticated and refined')
ON CONFLICT DO NOTHING;

-- Countries
INSERT INTO tiishka_countries (country_name, country_code) VALUES
('Russia', 'RU'),
('United States', 'US'),
('United Kingdom', 'GB'),
('Germany', 'DE'),
('France', 'FR')
ON CONFLICT (country_code) DO NOTHING;

COMMIT;
