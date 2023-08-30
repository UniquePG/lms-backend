import { Router } from 'express';
import { allPayments, buySubscription, cancleSubscription, getRazorpayApiKey, verifySubscription } from '../controllers/payment.controller.js';
import { authorizationRoles, isLoggedIn } from '../middlewares/auth.middleware.js';

const router = Router();

router
    .route('/razorpay-key')
    .get(
        isLoggedIn,
        getRazorpayApiKey
    )


router
    .route('/subscribe')
    .post(
        isLoggedIn,
        buySubscription
    )

router
    .route('/verify')
    .post(
        isLoggedIn,
        verifySubscription
    )

router
    .route('/unsubscribe')
    .post(
        isLoggedIn,
        cancleSubscription
    )

router
    .route('/')
    .get(
        isLoggedIn,
        authorizationRoles("ADMIN"),
        allPayments
    );


export default router;