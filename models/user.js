const mongoose = require('mongoose');

const { Schema } = mongoose;

/*
const RoleSchema = Schema({
    roleName: String,
    roleDesc: String,
});
*/

const UserSchema = Schema(
    {
        identity: String,
        name: String,
        surname: String,
        gender: String,
        phone: Number,
        email: String,
        password: String,
        location: String,
        profesion: String,
        userDesc: String,
        imagePath: String,
        role: String,
        activeProfile: Boolean,
        mycourses: [{ type: Schema.ObjectId, ref: 'Course' }],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { versionKey: false }
);

/*
this block of code has the function to delete the parameters we do not want
*/
UserSchema.methods.toJSON = function () {
    // methods.toJSON, is the method by default that moongose use to send data
    const obj = this.toObject(); // declaring a variable with the current object "user"
    delete obj.password; // deleting the password to send
    delete obj.activeProfile; // activeProfile deleted too
    return obj; // return object without passwword and activeProfile
};

/*
lo que hace mongoose con este codigo, lo que hace es que en la Base de datos
va a pluralizar y hacer un lowerCase del nombre del modelo en la base en vez de 
'User' sera 'users'

*/
module.exports = mongoose.model('User', UserSchema);
