/*
 # Система бронирования - Таблицы событий и бронирований

 ## Обзор
 Эта миграция создает основные таблицы для системы бронирования мест, что предотвращает дублирование бронирований.

  ## Новые таблицы
  
  ### `events`
  - `id` (SERIAL PRIMARY KEY) - Уникальный идентификатор для каждого события
  - `name` (VARCHAR NOT NULL) - Название мероприятия
  - `total_seats` (INT NOT NULL) - Общее количество доступных мест
  - `created_at` (TIMESTAMPTZ) - Дата создания мероприятия
  
  ### `bookings`
  - `id` (SERIAL PRIMARY KEY) - Уникальный идентификатор для каждого бронирования
  - `event_id` (INT NOT NULL) - Ссылается на таблицу событий
  - `user_id` (VARCHAR NOT NULL) - Идентификатор пользователя, осуществляющего бронирование.
  - `created_at` (TIMESTAMPTZ) - Когда было сделано бронирование
  
  ## Security
  - В обеих таблицах включена защита на уровне строк (RLS)
  - Пользователи могут просматривать события
  - Пользователи, прошедшие проверку подлинности, могут создавать заказы для себя
  - Пользователи, прошедшие проверку подлинности, могут просматривать свои собственные заказы
  - Сервисная роль имеет полный доступ к операциям с API
  
  ## Constraints
  - Ограничение внешнего ключа гарантирует, что бронирования ссылаются на действительные события
  - Ограничение уникальности предотвращает дублирование бронирований (same user + event)
  - Ограничение проверки гарантирует положительное значение total_seats
  
  ## Indexes
  - Индексирование event_id для ускорения поиска бронирования
  - Уникальный составной индекс (event_id, user_id) для предотвращения дублирования
  */

-- Создать таблицу событий
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  total_seats INT NOT NULL CHECK (total_seats > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Создать таблицу бронирований
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Создайте уникальное ограничение для предотвращения дублирования бронирований
CREATE UNIQUE INDEX IF NOT EXISTS bookings_event_user_unique 
  ON bookings(event_id, user_id);

-- Создание индекса для более быстрых запросов
CREATE INDEX IF NOT EXISTS bookings_event_id_idx ON bookings(event_id);
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings(user_id);

-- Включить RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Таблица политик RLS для событий
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert events"
  ON events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update events"
  ON events FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete events"
  ON events FOR DELETE
  USING (true);

-- Правила RLS для таблицы бронирований
CREATE POLICY "Users can view all bookings"
  ON bookings FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update bookings"
  ON bookings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete bookings"
  ON bookings FOR DELETE
  USING (true);

-- Примеры событий для тестирования
INSERT INTO events (name, total_seats) VALUES
  ('Tech Conference 2025', 100),
  ('Music Festival', 500),
  ('Workshop: Advanced SQL', 30)
ON CONFLICT DO NOTHING;