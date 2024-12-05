import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken';

const isLoggedIn =  async (req, res, next)=>{
    const { token } = req.cookies;

    console.log("token", token);

    if(!token){
        return next(new AppError('Unauthenticated, please login again', 401))
    }

    const userDetails = await jwt.verify(token, process.env.JWT_SECRET);

    req.user = userDetails;

    next()
}

//! Authorization
const authorizationRoles = (...roles) => async (req, res, next)=> {

    const currentUserRole = req.user.role;

    if(!roles.includes(currentUserRole)){
        return next( new AppError("You do not have permission to access this route", 403))
    }

    next();

}


// to authorized subscriber
const authorizedSubscriber = async (req, res, next)=> {

        const subscription = req.user.subscription;
        const currentUserRole = req.user.role;

        console.log("auth subs.",subscription);
        if(currentUserRole !== "ADMIN" && subscription.status !== 'active'){
            return next( new AppError("Please subscribe to access this course!", 403))
        }

        next()


}

export {
    isLoggedIn,
    authorizationRoles,
    authorizedSubscriber
}


/* Admin -> pavan31@gmail.com
password-> pavan31 */