import { config } from 'dotenv'
config();
import User from '../models/user.model.js';
import AppError from '../utils/error.util.js';
import { razorpay } from '../server.js';


export const getRazorpayApiKey = async (req, res, next) => {

    try {
        res.status(200).json({
            success: true,
            message: "Rezorpay key id",
            key: process.env.RAZORPAY_KEY_ID
        })
        
    } catch (error) {
        return next(
            new AppError(error.message, 500 )
        )
    }

} 

//! Subscription
export const buySubscription = async (req, res, next) => {

    try {
        // first check user is valid or not
        const { id } = req.user;
    
        const user = await User.findById(id);
    
        if(!user) {
            return next(
                new AppError("Unauthorized user, please login", 400)
            )
        }
    
        if(user.role === 'ADMIN'){
            return next(
                new AppError("Admin can not puchage subscription", 400)
            )
        }
    
        // make a subscription
        const subscription = await razorpay.subscriptions.create({
            plan_id: process.env.RAZORPAY_PLAN_ID,
            customer_notify: 1
        });
    
        // store subscription detail at the user level
        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;
    
        //now save user
        await user.save();
    
        res.status(200).json({
            success: true,
            message: "subscribed successfully",
            subscription_id: subscription.id
        });
        
    } catch (error) {
        return next(
            new AppError(error.message, 500 )
        )
    }



} 

export const verifySubscription = async (req, res, next) => {

    try {
        
        const { id } = req.user;
    
        const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body;
    
        const user = await User.findById(id);
    
        if(!user) {
            return next(
                new AppError("Unauthorized user, please login", 400)
            )
        }
    
        const subscriptionId = user.subscription.id;
    
        //* now create a signature and then compare our signature with actual signature
        const generatedSignature = crypto
                                        .createHmac('sha256', process.env.RAZORPAY_SECRET)
                                        .update(`${razorpay_payment_id}|${subscriptionId}`)
                                        .digest('hex')
    
        // Now we compare this signature
        if(generatedSignature !== razorpay_signature){
            return next(
                new AppError('Payment is not verified, please try again', 500)
            )
        }
    
        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        });
    
        // mark payment status active
        user.subscription.status = 'active'
    
        await user.save();
    
        res.status(200).json({
            success: true,
            message: 'payment verified successfully'
        })

    } catch (error) {
        return next(
            new AppError(error.message, 500 )
        )
    }


} 

export const cancleSubscription = async (req, res, next) => {

    try {
        
        const { id } = req.user;
    
        const user = await User.findById(id);
    
        if(!user) {
            return next(
                new AppError("Unauthorized user, please login", 400)
            )
        }
    
        if(user.role === 'ADMIN'){
            return next(
                new AppError("Admin can not puchage subscription", 400)
            )
        }
    
    
        const subscriptionId = user.subscription.id;
    
        //* cancel subscription
        const subscription = await razorpay.subscriptions.cancel(
            subscriptionId
        )
    
        user.subscription.status = subscription.status;
    
        await user.save();

        res.status.json({
            success: true,
            message: "subscription is cancled"
        })
    } catch (error) {
        return next(
            new AppError(error.message, 500 )
        )
    }


} 

export const allPayments = async (req, res, next) => {

    const { count } = req.query;

    try {
         //* get all subscription details from razorpay
        const subscriptions = await razorpay.subscriptions.all({   
            count: count || 10,
        })

        res.status(200).json({
            success: true,
            message: "All payments",
            subscriptions
        })



    } catch (error) {
        return next( new AppError(error.message, 400))
    }


} 