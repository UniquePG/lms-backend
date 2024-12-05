import { config } from "dotenv";
config();
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto';

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days
    httpOnly: true,
    secure: true,
    sameSite: 'None',
}   


const register = async (req, res, next)=>{

    const { fullname, email, password} = req.body;

    if(!fullname || !email || !password){
        //* custom error class (ise aage bej denge middleware ke pas)
        return next(new AppError('All fields are required', 400))
    }

    const userExists = await User.findOne({ email });
    if(userExists){
        return next(new AppError('Email already Exists', 409))
    }

    const user = await User.create({
        fullname,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: ''
        }
    });

    if(!user){
        return next(new AppError('User registration failed, please try again', 404))
    }

    //todo File upload
        //* Multer ke middleware se hame req ke ander file mil jayegee 
        
    if(req.file){  
        console.log(req.file);

            //* now we upload this file on cloudnary
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                width: 250,         // saves image ke width & height   
                height: 250,
                gravity: 'faces',   // face pr focus krna h
                crop: 'fill'
            });

        if(result){
            user.avatar.public_id = result.public_id;
            user.avatar.secure_url = result.secure_url;
            
            //remove file from local storage
            fs.rm(`/tmp/uploads/${req.file.filename}`)
        }
        
    } catch (e) {
        new AppError(e || "File not uploaded, please try again", 500)
    }


    //* save user
    await user.save();

    user.password = undefined;


// registration ke bad direct user ko login krane ke liyee
    const token = await user.generateJWTToken();

    res.cookie('token', token, cookieOptions)


    // registration ke baad success response
    res.status(201).json({
        success: true,
        message: "User registration successfully",
        user
    })
    }
};


const login = async (req, res, next)=>{

    try {
        const { email, password } = req.body;
    
        if(!email || !password){
            return next(new AppError("All fields are required", 400))
        }
    
        const user = await User.findOne({ email }).select('+password');
    
        // we made comparePassword method in the userModel
        if(!user || !user.comparePassword(password)) {      
            return next(new AppError('Email or passoword does not match', 400))
        }
    
        const token = await user.generateJWTToken();
        
        user.password = undefined;
    
        res.cookie('token', token, cookieOptions);
    
        res.status(200).json({
            success: true,
            message: 'User loggedin successfully',
            user,
        })

    } catch (error) {
        return next(new AppError(error.message, 500))
    }


};

const logout = (req, res)=>{

    res.cookie('token', null, {
        secure: true,
        maxAge: 0,
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'User logged out successfully'
    })

};

const getProfile = async (req, res, next)=>{

    try {
        const userId = req.user.id;         // cookies me jo use ke id set ke hai bo
        const user = await User.findById(userId)  
        
        res.status(200).json({
            success: true,
            message: 'User details',
            user,
        })

    } catch (error) {
        return next( new AppError('Failed to fetch user details', 400))
    }



};


//! forgot password
const forgotPassword = async (req, res, next)=>{
    const { email } = req.body;

    if(!email){
        return new AppError('Email is required', 400)
    }

    const user = await User.findOne({email});

    if(!user){
        return new AppError('Email not registered', 400)
    }

    const resetToken = await user.generatePasswordResetToken();     // this method is in the models


    await user.save();    // save this user with forgot token in db

    // console.log("token is: "+ resetToken);

    // reset password url
    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`


    const subject = 'Reset Pasword'
    const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset Your password </a> \n if the above link does not word for some reason then copy paste this link in new tab ${resetPasswordURL}. \n If You have not requested this, kindly ignore this email`

    //* send email to the user for forgot password
    try {
        await sendEmail(email, subject, message);


        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email} successfully`,
            url: resetPasswordURL
        })

    } catch (error) {
            //! reset forget password credentials
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;

        await user.save();

        return next(new AppError(error.message, 500))
    }

}


    //! reset new password taken from user
const resetPassword = async (req, res, next)=>{
    
    const { resetToken } = req.params;  // req ke param(url) se reset ka token milega

    const { password } = req.body;  // req.ke body se naya password milega

    if(!password) {
        return new AppError("Please provide new password", 400)
    }


    //* db me encrypted token save ha to hame bhi encrypted token ko he compare karna pdega db me
    const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // check into db ke iss token ka user db me hai ya nahi
    const user = await User.findOne( {
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    });

    if(!user){

        return next(new AppError("Token is invalid or Expired, Please try again", 400))
    }

    // change new password in db
    user.password = password;

    // reset forgot password crediatials
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    user.save();    

    res.status(200).json({
        success: true,
        message: "Password changed successfully"
    })


}


//* change password from profile

const changePasword = async (req, res, next) =>{

    // take old and new password from the user
    const { oldPassword, newPassword } = req.body;

    const { id } = req.user;

    if(!oldPassword || !newPassword) {

        return new AppError("All field are mendatory", 400)
    }

    //find user in db by id
    const user = await User.findById(id).select('+password');

    if(!user){
        return new AppError("User does not exists", 400)
    }

    //now compare old password in db

    const isPasawordValid = await user.comparePassword(oldPassword);

    if(!isPasawordValid){
        return new AppError("Invalid old password", 400)
    }

    user.password = newPassword;

    await user.save();

    user.password = undefined

    res.status(200).json({
        success: true,
        message: "Password changed successfully"
    })

}


//* update user
const updateUser = async (req, res, next) => {

    const { fullname } = req.body;
    
    const { id } = req.params;

    const user = await User.findById(id);

    if(!user){
        return new AppError("User does not exists", 400)
    }
    
    // if user provide fullname then update the new fullname
    if(fullname){
        user.fullname = fullname;
    }

    if(req.file){
        // first we destroy the old profile pic
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);

        //now upload new profile pic
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'lms',
                    width: 250,         // saves image ke width & height   
                    height: 250,
                    gravity: 'faces',   // face pr focus krna h
                    crop: 'fill'
                });

            if(result){
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;
                
                //remove file from local storage
                fs.rm(`/tmp/uploads/${req.file.filename}`)
            }
            
        } catch (e) {
            new AppError(e || "File not uploaded, please try again", 500)
        }
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        user
    })

}


export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    changePasword,
    updateUser
}