//CRUD USERS
import otplib from 'otplib';
import qrcode from 'qrcode';
import generateToken from '../utils/jwt.js';
import userModel from '../model/userModel.js';


//  READ all users
export const getAllUsers = async (req, res) => {
  try {
    const msg = await userModel.find();
    res.status(200).json(msg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ a single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE a new user
export const createUser = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(409).json({
        hasError: true,
        status: 409,
        message: "Email already in use"
      });
    }

    const newUser = new userModel(req.body);
    const savedUser = await newUser.save();

    const token = generateToken(savedUser);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
    )

    return res.status(200).json({
      hasError: false,
      message: 'User registered successfully',
      user: savedUser,
      token
    });

  } catch (error) {
    return res.status(500).json({
      hasError: true,
      status: 500,
      message: error.message
    });
  }
};


import { Resend } from 'resend';

const resend = new Resend("re_ZwzPGNyG_3yZUoWnRunR2rE6gkjW2nPqA");

export const sendEmailOTP = async (req, res) => {
  console.log("RESEND KEY:", process.env.RESEND_API_KEY ? "LOADED" : "MISSING");
  console.log("ENV CHECK:", process.env.RESEND_API_KEY);

  try {
    const { email } = req.body;
    console.log("sending to email:", email);

    await resend.emails.send({
      from: 'StudyZone <onboarding@resend.dev>',
      to: email,
      subject: 'StudyZone - Email Verification',
      html: `<h1>Your OTP is 1234</h1>`
    });

    
    res.status(200).json({ message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};


export const verifyEmailOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  if (otp === '1234') {
    return res.status(200).json({ message: 'Email verified successfully' });
  } else {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
};



// UPDATE an existing user by ID
export const updateUserById = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//DELETE a user by ID
export const deleteUserById = async (req, res) => {
  try {
    const deletedUser = await userModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Delete all users
export const deleteAllUsers = async (req, res) => {
  try {
    const result = await userModel.deleteMany({});
    res.status(200).json({ message: `${result.deletedCount} users deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // if (user.is2FAEnabled) {
    //   return res.status(200).json({ message: '2FA required', is2FAEnabled: true, email: user.email    });
    // }

    const token = generateToken(user); // your JWT function
    console.log("User's ID during login:", user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
  });


    return res.status(200).json({ message: 'User logged in successfully', user, token});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//logout user
export const logoutUser = async (req, res) => {
  try {
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error clearing cookie:", error);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cookie helper

export const getCurrentUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id); // Exclude sensitive fields

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


//Generate and return a QR code for 2fa setup
export const setup2FA = async (req, res) => {
  try {
    const { email } = req.body;
    //Generate unique secret for user
    const secret = otplib.authenticator.generateSecret();

    // Generate the QR code URL
    const otpauth = otplib.authenticator.keyuri(email, 'Study-Zone', secret);

    // Generate the QR Code image
    try {
      const qrCodeImageUrl = await qrcode.toDataURL(otpauth);
      // Save the secret to the user's record
      const user = await userModel.findOneAndUpdate({email}, { otpSecret: secret });


      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({  message: '2FA setup initiated', qrCodeImageUrl });
    } catch (err) {
      return res.status(500).json({ message: 'Error generating QR code', error: err.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Endpoint to Verify 2FA code - upon registeration 
export const verify2FA = async (req, res) => {
  const { email, token } = req.body; //different from jwt token - this is 2fa token (user input generated by authenticator app)

  //Fetch users secret from database
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const secret = user.otpSecret;

  //Verify the secret
  if (!secret)
    return res.status(400).json({ message: '2FA not set up for this user' }); //Bad Request - is2fa being triggers when null secret
  
//Verify the token
  const isValid = otplib.authenticator.check(token, secret); //signed token with secret and compares

  if (isValid) {
    user.is2FAEnabled = true;
    await user.save();

    return res.status(200).json({ message: '2FA verified successfully' });
  } else {
    return res.status(401).json({ message: 'Invalid 2FA token' });
  }

}

//Endpoint to verify 2fa during login - same thing but generates token for login 
export const verifyOTP = async (req, res) => {
  const { email, token } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!user.is2FAEnabled || !user.otpSecret) {
    return res.status(400).json({ message: "2FA not enabled" });
  }

  const isValid = otplib.authenticator.check(token, user.otpSecret);

  if (!isValid) {
    return res.status(401).json({ message: "Invalid 2FA code" });
  }

  // Success — now finish login
  const jwt = generateToken(user);
  return res.status(200).json({
    message: "2FA login successful",
    user,
    token: jwt
  });
};


