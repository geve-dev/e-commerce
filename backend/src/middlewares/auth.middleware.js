const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "Token ausente" });

    const token = auth.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Token ausente" });

    try {
        const validToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = validToken;
        next();
    } catch (e) {
        return res.status(401).json({ message: "Token inválido" });
    }
}

module.exports = { authRequired }; 