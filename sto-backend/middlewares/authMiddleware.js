const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');


    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Доступ заборонено. Токен відсутній."
        });
    }

    try {


        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_for_sto_project_2026');

        req.userId = decoded.userId;
        req.userEmail = decoded.email;


        next();
    } catch (e) {

        return res.status(401).json({
            success: false,
            error: "Невалідний токен або термін дії сесії закінчився"
        });
    }
};