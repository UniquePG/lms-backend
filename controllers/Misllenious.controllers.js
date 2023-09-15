import AppError from "../utils/error.util.js";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/user.model.js";


const contactUs = async (req, res, next)=>{
    
    // get the detaild
    const {name, email, phone, message } = req.body;

    if(!name || !email || !phone || !message) {
        return next( new AppError("All fileds are required", 400))
    }

    try {
        // set email subj and message
        const subject = "Contact Us Form"

        const textMessage = `${name} - ${email} - ${phone} <br /> ${message}"`

        // now send message
        await sendEmail(process.env.CONTACT_US_EMAIL, subject, textMessage)


    } catch (error) {
        console.log(error);
        return next( new AppError(error.message, 400))
    }

    res.status(200).json({
        success: true,
        message: "Your request has been submitted successfully"
    });

}


const userStats = async (req, res, next) => {
    // get the count of all users documents
    const allUsersCount = await User.countDocuments();

    const subscribedUserCount = await User.countDocuments({
        'subscription.status': 'active',
    })

    // send back the status
    res.status(200).json({
        success: true,
        message: "All registerd users count",
        allUsersCount,
        subscribedUserCount,
    })

}


export{
    contactUs,
    userStats
}