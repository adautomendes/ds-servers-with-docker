const express = require(`express`);
const appRouter = express.Router();

const AuthController = require(`./src/controllers/AuthController`);
const MovieController = require(`./src/controllers/MovieController`);

const movieRouter = express.Router();

appRouter.get(`/`, (req, res) => { //Root route of app
    res.json({ ok: true })
});

appRouter.use(`/movie`, AuthController.verifyJWT, movieRouter);
movieRouter.post(`/`, MovieController.payloadValidation, MovieController.insert);
movieRouter.patch(`/:id`, MovieController.payloadValidation, MovieController.update);
movieRouter.get(`/`, MovieController.search);
movieRouter.delete(`/:id`, MovieController.delete);

module.exports = appRouter;