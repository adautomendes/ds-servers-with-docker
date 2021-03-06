const express = require(`express`);
const appRouter = express.Router();

const AuthController = require(`./src/controllers/AuthController`);
const UserController = require(`./src/controllers/UserController`);

const userRouter = express.Router();
const authRouter = express.Router();

appRouter.get(`/`, (req, res) => { //Root route of app
    res.json({ ok: true })
});

appRouter.use(`/auth`, authRouter);
authRouter.post(`/login`, AuthController.login);
authRouter.post(`/logout`, AuthController.logout);
authRouter.post(`/validateToken`, AuthController.verifyJWTRoute);

appRouter.use(`/user`, AuthController.verifyJWTMiddleware, userRouter); //Protecting users routes with JWT
userRouter.post(`/`, UserController.payloadValidation, UserController.insert);
userRouter.patch(`/:username`, UserController.payloadValidation, UserController.update);
userRouter.get(`/`, UserController.search);
userRouter.delete(`/:id`, UserController.delete);

module.exports = appRouter;