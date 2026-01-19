-- ============================================
-- 1. Атомарная регистрация пользователя
-- ============================================
CREATE OR REPLACE FUNCTION is.register_user(
    p_username VARCHAR(100),
    p_login VARCHAR(255),
    p_password VARCHAR(255),
    p_email VARCHAR(255) DEFAULT NULL,
    p_first_name VARCHAR(100) DEFAULT NULL,
    p_last_name VARCHAR(100) DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    -- Создаём пользователя
    INSERT INTO is.users (username, authority, registered_date) 
    VALUES (p_username, 'USER', CURRENT_DATE) 
    RETURNING user_id INTO v_user_id;
    
    -- Создаём аккаунт с хешированным паролем
    INSERT INTO is.accounts (login, password, user_id) 
    VALUES (p_login, p_password, v_user_id);
    
    -- Создаём профиль
    IF p_email IS NOT NULL OR p_first_name IS NOT NULL OR p_last_name IS NOT NULL THEN
        INSERT INTO is.user_profiles (user_id, email, first_name, last_name) 
        VALUES (v_user_id, p_email, p_first_name, p_last_name);
    END IF;
    
    RETURN v_user_id;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Username or login already exists';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Registration failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. Расчёт стоимости корзины
-- ============================================
CREATE OR REPLACE FUNCTION is.calculate_cart_total(p_user_id INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_total DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(quantity * price), 0)
    INTO v_total
    FROM is.cart_items
    WHERE user_id = p_user_id;
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. Проверка, является ли дизайн популярным
-- ============================================
CREATE OR REPLACE FUNCTION is.is_popular_design(p_design_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_favorites_count INTEGER;
    v_orders_count INTEGER;
BEGIN
    -- Подсчёт добавлений в избранное
    SELECT COUNT(*) INTO v_favorites_count
    FROM is.user_favourites
    WHERE design_id = p_design_id;
    
    -- Подсчёт заказов с этим дизайном
    SELECT COUNT(*) INTO v_orders_count
    FROM is.order_items
    WHERE design_id = p_design_id;
    
    -- Дизайн считается популярным, если:
    -- - 5+ добавлений в избранное ИЛИ
    -- - 3+ заказов
    IF v_favorites_count >= 5 OR v_orders_count >= 3 THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. Получение популярных дизайнов
-- ============================================
CREATE OR REPLACE FUNCTION is.get_popular_designs(p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
    design_id INTEGER,
    title VARCHAR(255),
    owner_username VARCHAR(100),
    favorites_count BIGINT,
    orders_count BIGINT,
    popularity_score BIGINT,
    image_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.design_id,
        d.title,
        u.username as owner_username,
        COUNT(DISTINCT uf.favorite_id) as favorites_count,
        COUNT(DISTINCT oi.order_item_id) as orders_count,
        (COUNT(DISTINCT uf.favorite_id) + COUNT(DISTINCT oi.order_item_id)) as popularity_score,
        CASE 
            WHEN d.image_id IS NOT NULL THEN '/api/designs/' || d.design_id || '/image'
            ELSE NULL
        END as image_url
    FROM is.designs d
    LEFT JOIN is.users u ON d.owner_id = u.user_id
    LEFT JOIN is.user_favourites uf ON d.design_id = uf.design_id
    LEFT JOIN is.order_items oi ON d.design_id = oi.design_id
    WHERE d.is_public = true
    GROUP BY d.design_id, d.title, u.username, d.image_id
    HAVING (COUNT(DISTINCT uf.favorite_id) + COUNT(DISTINCT oi.order_item_id)) > 0
    ORDER BY popularity_score DESC, d.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Получение статистики по дизайну
-- ============================================
CREATE OR REPLACE FUNCTION is.get_design_stats(p_design_id INTEGER)
RETURNS TABLE(
    design_id INTEGER,
    favorites_count BIGINT,
    orders_count BIGINT,
    is_popular BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_design_id,
        COUNT(DISTINCT uf.favorite_id) as favorites_count,
        COUNT(DISTINCT oi.order_item_id) as orders_count,
        is.is_popular_design(p_design_id) as is_popular
    FROM is.designs d
    LEFT JOIN is.user_favourites uf ON d.design_id = uf.design_id
    LEFT JOIN is.order_items oi ON d.design_id = oi.design_id
    WHERE d.design_id = p_design_id
    GROUP BY d.design_id;
END;
$$ LANGUAGE plpgsql;
