import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import nodemailer from "nodemailer";


export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Try a different email",
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

   
        await sendConfirmationEmail(username, email);

        return res.status(201).json({
            message: "Account created successfully. Check your email!",
            success: true,
        });

    } catch (error) {
        console.error("Error in registration:", error);
        res.status(500).json({
            message: "Server error. Please try again later.",
            success: false,
        });
    }
};


const sendConfirmationEmail = async (username, email) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "xs332000@gmail.com", 
                pass: "ohej afzp plna vhlu",  
            },
        });

        const mailOptions = {
            from: 'xs332000@gmail.com',
            to: email,
            subject: "Welcome to Authenticated Server!",
            html: `<h1>Welcome, ${username}!</h1>
                   <p>Thank you for registering. Your account has been created successfully.</p>
                   <p>Enjoy our services!</p>`,
        };

        await transporter.sendMail(mailOptions);
        console.log("Confirmation email sent to:", email);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        };

        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        
       
        return res.cookie("token", token, { httpOnly: true, sameSite: 'none', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user,
            token
        });

    } catch (error) {
        console.log(error);
    }
};
export const logout = async (_, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};
