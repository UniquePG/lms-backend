import { config } from 'dotenv';
config();

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import errorMiddleWare from './middlewares/error.middleware.js';
import courseRoutes from './routes/course.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import userRoutes from './routes/user.routes.js';
import misroutes from './routes/Misllenious.routes.js'
import sendEmail from './utils/sendmail2.js';

const app = express();

app.use(express.json()) // req body se jo data ayega bo json me parse hoke ayega
app.use(express.urlencoded( {extended: true }));  // url ko encode krne ke liye(query params bgera nikalne me) 


const allowedOrigins = ['https://lms-frontend-peach.vercel.app', "http://localhost:5173"];

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Required for cookies to be sent with requests
}));

// app.use(cors({
//     origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
//     credentials: true
// }))

// app.use(cors({ origin: '*' }));

app.use(cookieParser()) // cookie ke ander token bgera ko parse karne ke liye

app.use(morgan('dev'))  // agr use koi bhi url hit krega uska status console me print hoga


// Routes of 3 Modules
    //* User Router
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/courses', courseRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1', misroutes)


app.get("/mail", (req, res)=>{ 
    sendEmail("grishav137@gmail.com", "text", "this is text message")
    res.send("i am sending email")
})

app.get("/", (req, res)=> {
    console.log("pong");

    res.send("Welcome to my LMS project")
})


//! Define routes ke alawa koi aur rounte hit hone par error throw
app.all('*', (req, res)=>{
    res.status(404).send('OOPS!! 404 page not found')
})


//! Generic error middleware(kisi bhi controller me error ayege to bo iss middleware me chali jayege (next karne se))
app.use(errorMiddleWare);

export default app;
