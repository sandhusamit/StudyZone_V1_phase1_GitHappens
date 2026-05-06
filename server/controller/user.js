import otplib from "otplib";
import qrcode from "qrcode";
import { Resend } from "resend";
import { randomUUID } from "crypto";
import mongoose from "mongoose";

import generateToken from "../utils/jwt.js";
import { generateGuestToken } from "../utils/guestJwt.js";

import userModel from "../model/userModel.js";
import guestModel from "../model/guestModel.js";
import SuspendedEmailSchema from "../model/suspendedEmailModel.js";
import otpModel from "../model/otpModel.js";

import { generateOTP } from "../utils/otp.js";

const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : null;

if (!resendKey) {
  console.error("Resend API key missing. Set RESEND_API_KEY in .env");
}

/* ================= USERS ================= */

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password -otpSecret");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select("-password -otpSecret");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(409).json({
        hasError: true,
        status: 409,
        message: "Email already in use",
      });
    }

    const newUser = new userModel(req.body);
    const savedUser = await newUser.save();

    const token = generateToken(savedUser);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      hasError: false,
      message: "User registered successfully",
      user: savedUser,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      status: 500,
      message: error.message,
    });
  }
};

export const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;
    const exists = await userModel.exists({ email });

    return res.status(200).json({ exists: !!exists });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.body;

    const existingUser = await userModel
      .findOne({ username })
      .select("-password -otpSecret");

    return res.status(200).json({
      hasError: false,
      user: existingUser || null,
    });
  } catch (error) {
    return res.status(500).json({
      hasError: true,
      status: 500,
      message: error.message,
    });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const user = await userModel
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .select("-password -otpSecret");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const deletedUser = await userModel.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAllUsers = async (req, res) => {
  try {
    const result = await userModel.deleteMany({});
    res.status(200).json({
      message: `${result.deletedCount} users deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= LOGIN ================= */

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        hasError: true,
        message: "User not found",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        hasError: true,
        message: "Invalid password",
      });
    }

    if (user.is2FAEnabled) {
      return res.status(200).json({
        hasError: false,
        message: "2FA required",
        is2FAEnabled: true,
        email: user.email,
        user,
      });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      hasError: false,
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      hasError: true,
      message: error.message,
    });
  }
};


export const loginGuest = async (req, res) => {
  try {
    const { name } = req.body;

    const cleanName = String(name ?? "").trim();

    if (!cleanName) {
      return res.status(400).json({
        hasError: true,
        message: "Name is required for guest login",
      });
    }

    const existingGuestId = req.cookies?.guestId;

    let guestUser = null;

    if (existingGuestId && mongoose.Types.ObjectId.isValid(existingGuestId)) {
      guestUser = await guestModel.findById(existingGuestId);
    }

    if (!guestUser) {
      guestUser = await guestModel.create({
        name: cleanName,
      });
    } else {
      guestUser.name = cleanName;
      await guestUser.save();
    }

    const guestMongoId = guestUser._id.toString();
    const token = generateGuestToken(guestUser);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("guestId", guestMongoId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      hasError: false,
      message: "Guest logged in successfully",
      user: {
        _id: guestUser._id,
        name: guestUser.name,
        role: "guest",
      },
    });
  } catch (error) {
    console.error("Guest login error:", error);

    return res.status(500).json({
      hasError: true,
      message: "Guest login failed.",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.clearCookie("guestId", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user?.id && !req.user?.guestId) {
      return res.status(401).json({ message: "Not authenticated" });
    }


    const user = await userModel
      .findById(req.user.id)
      .select("-password -otpSecret");

    if (user) {
      return res.status(200).json({ user });
    }

    const guest = await guestModel.findById(req.user.guestId);

    if (guest) {
      return res.status(200).json({
        user: {
          _id: guest._id,
          name: guest.name,
          isGuest: true,
        },
      });
    }

    return res.status(404).json({ message: "User not found" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
/* ================= EMAIL OTP ================= */

export const sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!resend) {
      return res.status(500).json({ message: "Email service not configured" });
    }

    const now = new Date();

    let record = await SuspendedEmailSchema.findOne({ email });

    if (!record) {
      await SuspendedEmailSchema.create({
        email,
        lastAttempt: now,
        attempts: 1,
      });
    } else {
      if (record.attempts >= 3) {
        return res.status(403).json({
          message: "Too many attempts. Try again in 1 hour.",
        });
      }

      record.attempts += 1;
      record.lastAttempt = now;
      await record.save();
    }

    await otpModel.deleteMany({ email });

    const otp = await generateOTP(email);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await otpModel.create({ email, otp, expiresAt });

    await resend.emails.send({
      from: "StudyZone <onboarding@resend.dev>",
      to: email,
      subject: "StudyZone - Email Verification",
      html: `<h1>Your OTP is ${otp}</h1>`,
    });

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpEntry = await otpModel.findOne({ email }).sort({ expiresAt: -1 });

    if (!otpEntry) {
      return res.status(404).json({ message: "OTP not found. Request a new one." });
    }

    if (otpEntry.expiresAt < new Date()) {
      return res.status(401).json({ message: "OTP expired" });
    }

    if (otpEntry.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    await otpModel.deleteMany({ email });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= 2FA ================= */

export const setup2FA = async (req, res) => {
  try {
    const { email } = req.body;

    const secret = otplib.authenticator.generateSecret();
    const otpauth = otplib.authenticator.keyuri(email, "Study-Zone", secret);
    const qrCodeImageUrl = await qrcode.toDataURL(otpauth);

    const user = await userModel.findOneAndUpdate(
      { email },
      {
        otpSecret: secret,
        is2FAEnabled: true,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "2FA setup initiated",
      qrCodeImageUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verify2FA = async (req, res) => {
  try {
    const { email, token } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otpSecret) {
      return res.status(400).json({ message: "2FA not set up for this user" });
    }

    const isValid = otplib.authenticator.check(token, user.otpSecret);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid 2FA token" });
    }

    user.is2FAEnabled = true;
    await user.save();

    return res.status(200).json({ message: "2FA verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, token } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        hasError: true,
        message: "User not found",
      });
    }

    if (!user.is2FAEnabled || !user.otpSecret) {
      return res.status(400).json({
        hasError: true,
        message: "2FA not enabled",
      });
    }

    const isValid = otplib.authenticator.check(token, user.otpSecret);

    if (!isValid) {
      return res.status(401).json({
        hasError: true,
        message: "Invalid 2FA code",
      });
    }

    const jwt = generateToken(user);

    res.cookie("token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      hasError: false,
      message: "2FA login successful",
      user,
    });
  } catch (error) {
    res.status(500).json({
      hasError: true,
      message: error.message,
    });
  }
};