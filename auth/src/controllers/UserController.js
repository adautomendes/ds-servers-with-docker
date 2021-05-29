const HttpStatus = require(`http-status-codes`).StatusCodes;
const _ = require(`lodash`);
const PasswordUtil = require(`../utils/PasswordUtil`);

const User = require(`../models/User`);
const Logger = require(`../logger`)(`[USER]`);

module.exports = {
    async payloadValidation(req, res, next) {
        let username;
        if (req.method == `POST`) {
            username = req.body.username;
        } else if (req.method == `PATCH`) {
            username = req.params.username;
        }

        let { password } = req.body;

        let errorMessages = [];
        if (_.isEmpty(username)) {
            errorMessages.push(`Username cannot be empty`);
        }

        if (_.isEmpty(password)) {
            errorMessages.push(`Password cannot be empty`);
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
        let { username, password } = req.body;

        //Testing if user already exists
        const userExists = await User.findOne({ username });

        if (userExists) {
            Logger.print(`${username} already exists.`);
            return res.status(HttpStatus.OK).json(userExists);
        }

        //Encrypt password
        password = await PasswordUtil.cryptPassword(password);

        const user = await User.create({
            username,
            password
        });

        Logger.print(`${username} created!`);
        return res.status(HttpStatus.CREATED).json(user);
    },

    async update(req, res) {
        let { username } = req.params;
        let { password } = req.body;

        //Encrypt password
        password = await PasswordUtil.cryptPassword(password);
        const response = await User.updateOne({ username }, {
            password
        });

        if (response.nModified == 1 && response.ok == 1) {
            Logger.print(`${username} updated!`);
            const user = await User.find({ username });
            return res.status(HttpStatus.OK).json(user);
        }

        return res.status(HttpStatus.NOT_FOUND).json({ msg: `No user was found with these input parameters.`, query: { username } });
    },

    async search(req, res) {
        const { id, username } = req.query;
        let users = [];

        try {
            if (id) {
                users = await User.find({ _id: id });
            } else if (username) {
                users = await User.find({ username });
            } else {
                users = await User.find();
            }
        } catch (error) { }

        if (users.length == 0) {
            return res.status(HttpStatus.NOT_FOUND).json({ msg: `No users were found with this query criteria.`, query: { id, username } });
        }

        Logger.print(`${users.length} users found!`);
        return res.status(HttpStatus.OK).json(users);
    },

    async delete(req, res) {
        const { id } = req.params;

        try {
            const response = await User.deleteOne({ _id: id });

            if (response.deletedCount == 1 && response.ok == 1) {
                Logger.print(`${id} removed!`);
                return res.status(HttpStatus.NO_CONTENT).json();
            }

            return res.status(HttpStatus.BAD_REQUEST).json({ msg: `Invalid request` });
        } catch (error) {
            return res.status(HttpStatus.NOT_FOUND).json({ msg: `No user was found with these input parameters.`, query: { id } });
        }
    }
};