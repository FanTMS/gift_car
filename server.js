const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const app = express();

// Включаем GZIP сжатие для повышения производительности
app.use(compression());

// Защита от известных веб-уязвимостей
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "www.googletagmanager.com", "*.google-analytics.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "*.imgur.com", "*.postimg.cc", "i.postimg.cc", "*.unsplash.com"],
        connectSrc: ["'self'", "*.firebaseio.com", "*.googleapis.com", "*.google-analytics.com"],
      },
    },
  })
);

// Установка заголовков HTTP-кеша для статических ресурсов
const setCache = function(req, res, next) {
  // Кеширование статических ресурсов на 1 день
  const period = 60 * 60 * 24;
  if (req.method === 'GET') {
    res.set('Cache-Control', `public, max-age=${period}`);
  } else {
    // Для других методов отключаем кеширование
    res.set('Cache-Control', 'no-store');
  }
  next();
};

app.use(setCache);

// Используем статические файлы из директории 'build'
app.use(express.static(path.join(__dirname, 'build')));

// Обработка всех маршрутов React Router
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Проверяем ошибки
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Что-то пошло не так!');
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
