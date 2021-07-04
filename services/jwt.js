const jwt = require('jwt-simple');
const moment = require('moment');

exports.createToken = function (user) {
    const payload = {
        id: user.id,
        identity: user.identity,
        name: user.name,
        surname: user.surname,
        gender: user.gender,
        phone: user.phone,
        email: user.email,
        location: user.location,
        profesion: user.profesion,
        userDesc: user.userDesc,
        imagePath: user.imagePath,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix,
    };

    return jwt.encode(payload, 'wwpc2mt8*++v-+6+@*@qwM6tyVxX&jDymQw5%Cmw5A#eV3H$@=?GkWhedpt-');
};
