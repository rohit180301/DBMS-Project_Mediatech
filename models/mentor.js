const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mentorSchema = new Schema({
    fullname: {
        type : String,
        default : ''
    },
    firstname: {
        type:String,
        default:''
    },
    lastname: {
        type:String,
        default:''
    },
    email: {
        type :String,
        default:''
    },
    image: {
        type : String, 
        default:''
    },
    phone: {
        type:Number
    },
    experience_achievements: {
        type : String,
        default:''
    },
    qualification: {
        type : String,
        default:''
    },
    resume: {
        type : String,
        default:''
    },
    interest: {
        type : String,
        default:''
    }
});

module.exports = mongoose.model('mentor', mentorSchema);