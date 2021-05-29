const HttpStatus = require(`http-status-codes`).StatusCodes;
const _ = require(`lodash`);

const Movie = require(`../models/Movie`);
const Logger = require(`../logger`)(`[MOVIE]`);

module.exports = {
    async payloadValidation(req, res, next) {
        let { title, duration, year } = req.body;

        let errorMessages = [];
        if (_.isEmpty(title)) {
            errorMessages.push(`Title cannot be empty`);
        }

        if (_.isEmpty(duration)) {
            errorMessages.push(`Duration cannot be empty`);
        }

        if (_.isEmpty(year)) {
            errorMessages.push(`Year cannot be empty`);
        }

        if (duration < 0) {
            errorMessages.push(`Duration must be greater than zero.`);
        }

        if (year < 0) {
            errorMessages.push(`Year must be greater than zero.`);
        }

        if (_.isEmpty(errorMessages)) {
            next();
        } else {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: `Opss, there is an error on your payload! Please check the error messages.`,
                errorMessages
            });
        }
    },
    async insert(req, res) {
        const { title, duration, year } = req.body;

        //Testing if movie already exists
        const movieExists = await Movie.findOne({ title });

        if (movieExists) {
            Logger.print(`${title} already exists.`);
            return res.status(HttpStatus.OK).json(movieExists);
        }

        const movie = await Movie.create({
            title,
            duration,
            year
        });

        Logger.print(`${title} created!`);
        return res.status(HttpStatus.CREATED).json(movie);
    },

    async update(req, res) {
        const { id } = req.params;
        const { title, duration, year } = req.body;

        try {
            const response = await Movie.updateOne({ _id: id }, {
                title,
                duration,
                year
            });

            if (response.nModified == 1 && response.ok == 1) {
                Logger.print(`${title} updated!`);
                const movie = await Movie.findById(id);
                return res.status(HttpStatus.OK).json(movie);
            }
            return res.status(HttpStatus.BAD_REQUEST).json({ msg: `Invalid request` });
        } catch (error) {
            return res.status(HttpStatus.NOT_FOUND).json({ msg: `No movie was found with these input parameters.`, query: { id } });
        }
    },

    async search(req, res) {
        const { id } = req.query;
        let movies = [];

        try {
            if (id) {
                movies = await Movie.find({ _id: id });
            } else {
                movies = await Movie.find();
            }
        } catch (error) { }

        Logger.print(`${movies.length} movies found!`);
        if (movies.length == 0) {
            return res.status(HttpStatus.NOT_FOUND).json({ msg: `No movies were found with this query criteria.`, query: { id } });
        }

        return res.status(HttpStatus.OK).json(movies);
    },

    async delete(req, res) {
        const { id } = req.params;

        try {
            const response = await Movie.deleteOne({ _id: id });

            if (response.deletedCount == 1 && response.ok == 1) {
                Logger.print(`${id} removed!`);
                return res.status(HttpStatus.NO_CONTENT).json();
            }

            return res.status(HttpStatus.BAD_REQUEST).json({ msg: `Invalid request` });
        } catch (error) {
            return res.status(HttpStatus.NOT_FOUND).json({ msg: `No movie was found with these input parameters.`, query: { id } });
        }


    }
};