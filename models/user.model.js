import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs'
import  jwt  from "jsonwebtoken";
import crypto from 'crypto';

const userSchema = new Schema({

    fullname: {
        type: String,
        required: [true, 'Name is required'],
        lowercase: true,
        trim: true,
        minLength: [4, "Name is altest 4 characters"],
        maxaLength: [30, "Name is not greater than 20 charaters"]
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        lowercase: true,
        trim: true,

    },
    password: {
        type: String,
        required: [true, 'password is required'],
        minLength: [5, 'password must be atleast 5 charaters'],
        select: false
    },
    avatar: {
        public_id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,

    subscription: {
        id: String,
        status: String
    }


}, {
    timestamps: true
});


// encrypt password
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }

    this.password = await bcrypt.hash(this.password, 8);

    // next();
})



userSchema.methods = {
    
    //JWT token
    generateJWTToken: async function() {
        return await jwt.sign(
            {id: this._id, email: this.email, subscription: this.subscription, role: this.role},
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY
            }
        )
    },
            //* compair password 
    comparePassword: async function(plainTextPassword){
        return await bcrypt.compare(plainTextPassword, this.password)
    },

        //* password reset token
    generatePasswordResetToken: async function () {
        const resetToken = crypto.randomBytes(20).toString('hex');

        this.forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000  //! Expiry-> 15min from now

        return resetToken;

    }
}


const User = model("User", userSchema);
export default User;