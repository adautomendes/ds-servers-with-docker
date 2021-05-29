const express = require(`express`);
const appRouter = express.Router();

const AuthController = require(`./src/controllers/AuthController`);
const UserController = require(`./src/controllers/UserController`);
const MovieController = require(`./src/controllers/MovieController`);

const authRouter = express.Router();
const userRouter = express.Router();
const movieRouter = express.Router();

appRouter.get(`/`, (req, res) => { //Root route of app
    res.json({ ok: true })
});

appRouter.use(`/auth`, authRouter);
authRouter.post(`/login`, AuthController.login);
authRouter.post(`/logout`, AuthController.logout);

appRouter.use(`/user`, AuthController.tokenExists, AuthController.verifyJWT, userRouter);
userRouter.post(`/`, UserController.insert);
userRouter.patch(`/:username`, UserController.update);
userRouter.get(`/`, UserController.search);
userRouter.delete(`/:id`, UserController.delete);

/**
 * tokenExists => verify if token exists in request header
 * verifyJWT => check if token is valid against AUTH server
 */
appRouter.use(`/movie`, AuthController.tokenExists, AuthController.verifyJWT, movieRouter);
movieRouter.post(`/`, MovieController.insert);
movieRouter.patch(`/:id`, MovieController.update);
movieRouter.get(`/`, MovieController.search);
movieRouter.delete(`/:id`, MovieController.delete);

module.exports = appRouter;