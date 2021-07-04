const jwt = require('jwt-simple');
const moment = require('moment');

const secretPassword = 'wwpc2mt8*++v-+6+@*@qwM6tyVxX&jDymQw5%Cmw5A#eV3H$@=?GkWhedpt-';

exports.authenticated = function (req, res, next) {
    // check to the Authorization Header
    if (!req.headers.authorization) {
        return res.status(403).send({
            message: 'Authorization header is missing',
        });
    }

    // cleaning the token and removing singles quotes
    const token = req.headers.authorization.replace(/['"]+/g, '');
    let payload;
    // decrypt token

    try {
        payload = jwt.decode(token, secretPassword);

        if (payload.exp <= moment().unix()) {
            return res.status(404).send({
                message: 'Token has expired',
            });
        }
    } catch (ex) {
        return res.status(404).send({
            message: 'Token invalid',
        });
    }

    req.user = payload;
    next();
};
