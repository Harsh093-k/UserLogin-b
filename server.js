import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./middlewares/db.js";
import userRoute from "./routes/user.route.js";

const app=express()

 
dotenv.config();


const PORT = process.env.PORT || 3000;




app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
const corsOptions = {
    origin: 'https://user-loginfrontend.vercel.app',
    credentials: true
}
app.use(cors(corsOptions));


app.use("/api/v1/user", userRoute);







app.listen(PORT, () => {
    connectDB();
    console.log(`Server listen at port ${PORT}`);
});