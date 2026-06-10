const repo = require("../models/modelUser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const existUser = await repo.findUserByEmail(email);
    if (existUser)
      return res.status(409).json({ message: "E-mail já cadastrado" });

    const hash = await bcrypt.hash(password, 10);
    await repo.createUser(name, email, hash);
    res.status(201).json({ message: "Usuário criado" });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await repo.findUserByEmail(email);
    if (!user)
      return res.status(401).json({ message: "Credenciais inválidas" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Credenciais inválidas" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES },
    );
    res.status(200).json({ token, name: user.name, role: user.role });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login };
