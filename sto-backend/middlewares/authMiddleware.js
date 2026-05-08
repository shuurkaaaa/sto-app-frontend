const jwt = require('jsonwebtoken');

/**
 * Мідлвар для перевірки JWT токена
 * Перевіряє заголовок Authorization та додає дані користувача до запиту
 */
module.exports = (req, res, next) => {
    // 1. Отримуємо токен із заголовка (формат "Bearer <token>")
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    // 2. Якщо токена немає — відмовляємо в доступі
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            error: "Доступ заборонено. Токен відсутній." 
        });
    }

    try {
        // 3. Верифікація токена за допомогою секретного ключа
        // Використовуємо той самий ключ, що і в authController
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_for_sto_project_2026');

        /**
         * 4. Зберігаємо дані в об'єкт запиту (req)
         * Важливо: твій authController очікує саме req.userId
         */
        req.userId = decoded.userId;
        req.userEmail = decoded.email;

        // Переходимо до наступного етапу (контролера)
        next();
    } catch (e) {
        // 5. Якщо токен невалідний або термін дії закінчився
        return res.status(401).json({ 
            success: false, 
            error: "Невалідний токен або термін дії сесії закінчився" 
        });
    }
};