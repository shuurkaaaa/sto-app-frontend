const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('./emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_sto_project_2026';
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const sendResponse = (res, status, message, data = null, error = null) => {
    return res.status(status).json({
        success: status < 400,
        message,
        data,
        error,
        timestamp: new Date().toISOString()
    });
};

const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

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

exports.checkStatus = async (req, res) => {
    try {

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

exports.updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;

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

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email || !isValidEmail(email)) {
            return sendResponse(res, 400, "Вкажіть коректний email");
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });


        const genericMsg = "Якщо такий email зареєстрований — лист зі скиданням надіслано.";

        if (!user) {
            console.warn(`[AUTH][RESET] Запит на невідомий email: ${normalizedEmail}`);
            return sendResponse(res, 200, genericMsg);
        }


        await prisma.passwordResetToken.updateMany({
            where: { userId: user.id, usedAt: null },
            data: { usedAt: new Date() }
        });

        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

        await prisma.passwordResetToken.create({
            data: { tokenHash, userId: user.id, expiresAt }
        });

        try {
            const result = await sendPasswordResetEmail(user.email, rawToken);

            if (result?.deliveryMode === 'disabled') {
                return sendResponse(res, 200, genericMsg, {
                    deliveryMode: 'disabled',
                    devResetUrl: result.resetUrl,
                    emailConfig: result.config
                });
            }
        } catch (emailErr) {
            console.error('[AUTH][RESET] Email error:', emailErr.message);
            const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password/${rawToken}`;
            return sendResponse(res, 200, genericMsg, {
                deliveryMode: 'fallback',
                devResetUrl: resetUrl,
                emailError: true
            });
        }

        return sendResponse(res, 200, genericMsg, { deliveryMode: 'email' });
    } catch (error) {
        console.error(`[AUTH][RESET] Помилка forgotPassword:`, error);
        return sendResponse(res, 500, "Помилка сервера");
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        if (!token || !newPassword) {
            return sendResponse(res, 400, "Токен та новий пароль обов'язкові");
        }
        if (newPassword.length < 8) {
            return sendResponse(res, 400, "Пароль має бути не менше 8 символів");
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const record = await prisma.passwordResetToken.findUnique({
            where: { tokenHash },
            include: { user: true }
        });

        if (!record || record.usedAt || record.expiresAt < new Date()) {
            return sendResponse(res, 400, "Посилання недійсне або прострочене");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: record.userId },
                data: { password: hashedPassword }
            }),
            prisma.passwordResetToken.update({
                where: { id: record.id },
                data: { usedAt: new Date() }
            })
        ]);

        return sendResponse(res, 200, "Пароль успішно змінено. Увійдіть з новим паролем.");
    } catch (error) {
        console.error(`[AUTH][RESET] Помилка resetPassword:`, error);
        return sendResponse(res, 500, "Помилка сервера при скиданні паролю");
    }
};

exports.verifyResetToken = async (req, res) => {
    const { token } = req.params;
    try {
        if (!token) return sendResponse(res, 400, "Токен відсутній");
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
        if (!record || record.usedAt || record.expiresAt < new Date()) {
            return sendResponse(res, 400, "Посилання недійсне або прострочене");
        }
        return sendResponse(res, 200, "Токен валідний");
    } catch (error) {
        console.error(`[AUTH][RESET] verifyResetToken:`, error);
        return sendResponse(res, 500, "Помилка перевірки токену");
    }
};