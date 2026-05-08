const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_sto_project_2026';

/**
 * Допоміжна функція для стандартних відповідей сервера
 */
const sendResponse = (res, status, message, data = null, error = null) => {
    return res.status(status).json({
        success: status < 400,
        message,
        data,
        error,
        timestamp: new Date().toISOString()
    });
};

/**
 * Валідація Email
 */
const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

/**
 * РЕЄСТРАЦІЯ
 */
exports.register = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    
    console.log(`[AUTH] Спроба реєстрації: ${email}`);

    try {
        if (!email || !password) {
            return sendResponse(res, 400, "Email та пароль обов'язкові");
        }

        if (!isValidEmail(email)) {
            return sendResponse(res, 400, "Некоректний формат email");
        }

        if (password.length < 8) {
            return sendResponse(res, 400, "Пароль має бути не менше 8 символів");
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });

        if (existingUser) {
            return sendResponse(res, 400, "Користувач з таким Email вже існує");
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await prisma.$transaction(async (tx) => {
            return await tx.user.create({
                data: {
                    email: normalizedEmail,
                    password: hashedPassword,
                    firstName: firstName || null,
                    lastName: lastName || null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
        });

        console.log(`[AUTH][SUCCESS] Користувач створений: ${result.email}`);

        const token = jwt.sign(
            { userId: result.id, email: result.email }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        return sendResponse(res, 201, "Реєстрація успішна", {
            token,
            user: { 
                id: result.id, 
                email: result.email,
                firstName: result.firstName,
                lastName: result.lastName
            }
        });

    } catch (error) {
        console.error(`[AUTH][CRITICAL] Помилка реєстрації:`, error);
        return sendResponse(res, 500, "Помилка сервера при реєстрації", null, error.message);
    }
};

/**
 * ВХІД (LOGIN)
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return sendResponse(res, 400, "Введіть Email та пароль");
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });

        if (!user) {
            console.warn(`[AUTH][FAILED] Користувача не знайдено: ${normalizedEmail}`);
            return sendResponse(res, 401, "Невірна пошта або пароль");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.warn(`[AUTH][FAILED] Невірний пароль для: ${normalizedEmail}`);
            return sendResponse(res, 401, "Невірна пошта або пароль");
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // Оновлення часу входу в фоновому режимі
        prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        }).catch(err => console.error("[AUTH][STATS] Не вдалося оновити час входу", err));

        return sendResponse(res, 200, "Вхід успішний", {
            token,
            user: { 
                id: user.id, 
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });

    } catch (error) {
        console.error(`[AUTH][ERROR] Помилка авторизації:`, error);
        return sendResponse(res, 500, "Помилка сервера при вході");
    }
};

/**
 * ПЕРЕВІРКА СЕСТІЇ (ME)
 */
exports.checkStatus = async (req, res) => {
    try {
        // Використовуємо req.userId, який додав мідлвар
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { 
                id: true, 
                email: true, 
                firstName: true, 
                lastName: true, 
                createdAt: true 
            }
        });

        if (!user) {
            return sendResponse(res, 404, "Користувача не знайдено");
        }

        return sendResponse(res, 200, "Сесія активна", { user });
    } catch (error) {
        console.error(`[AUTH][CHECK] Помилка перевірки статусу:`, error);
        return sendResponse(res, 500, "Помилка перевірки статусу");
    }
};

/**
 * ЗМІНА ПАРОЛЯ
 */
exports.updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId; // Отримуємо ID з мідлвару

    try {
        if (!oldPassword || !newPassword) {
            return sendResponse(res, 400, "Необхідно вказати старий та новий паролі");
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return sendResponse(res, 404, "Користувача не знайдено");

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return sendResponse(res, 400, "Старий пароль невірний");
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });

        return sendResponse(res, 200, "Пароль успішно оновлено");
    } catch (error) {
        console.error(`[AUTH][PASSWORD] Помилка оновлення пароля:`, error);
        return sendResponse(res, 500, "Помилка при оновленні пароля");
    }
};