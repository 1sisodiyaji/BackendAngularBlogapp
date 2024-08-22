const User = require("../models/User");
const { parser } = require("../config/Cloudinary");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const slugify = require("slugify");
const sendEmail = require("../config/Mail");

exports.Register =  [parser.single('image'), async (req, res) => {
    const { name, email, password } = req.body;
    const image = req.file ? req.file.path : 'https://res.cloudinary.com/dbqq41bpc/image/upload/v1718616387/blog-app/image-1718616385884.jpg';
    if (!name || !email || !password || !image) {
      return res.status(401).json({ message: "Please fill the data" });
    }
  
    try { 
      const user = await User.find({ email: email });
      if (user.length > 0){
        return res.status(404).json({ message: "User already exist" });
      }
  
      const hashPassword = await bcrypt.hash(password, 10); 
      const slug = slugify(name, { lower: true,  strict: true });
      const newUser = new User({
        name,
        slug: slug,
        email,
        password: hashPassword, 
        image
      });
      console.log(newUser);
      const savedUser = await newUser.save().catch((error) => {
        console.error("Error saving user to database:", error);
        throw error;
      });
      const token = jwt.sign(
        { id: savedUser._id },
            process.env.JWT_SECRET_KEY,
        {
          expiresIn: "1y",
        }
      ); 
      return res.status(200).json({ message: "Registration successful", token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Account creation Failed" });
    }
}];
exports.Login =  async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        status: "error",
        message: "Please fill the data Correctly.",
      });
    }
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Account does not exist" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(409).json({ message: "Invalid password" });
  
      }
      const token = jwt.sign(
        { id: user._id},
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "1y",
        }
      ); 
      return res.status(200).json({ message: "Login Suucess", token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Login Failed" });
    }
};
exports.saveuserData = async (req, res) => {
  const { email, name, username, image } = req.body;
  if (!email || !name || !username || !image) {
    return res.json({ status: "400" }, { message: "Please Fill the data" });
  }

  try {
    const existingUser = await User.findOne({ email });

    const createToken = (user) => {
      return jwt.sign({ id : user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "30d",
      });
    };

    if (existingUser) {
      const token = createToken(existingUser); 
      return res.json({
        status: "success",
        message: "Login successful.",
        token,
      });
    } else { 
      const slug = slugify(name, { lower: true, strict: true });
      const newUser = new User({
        name: name,
        slug:slug,
        email: email, 
        image: image
      });

      const savedUser = await newUser.save();
      if (savedUser) {
        const token = createToken(savedUser); 
        return res.json({
          status: "success",
          message: "Account created and logged in successfully.",
          token,
        });
      } else {
        return res.status(401) .json({message: "Login Failed." });
      }
    }
  } catch (error) {
    console.error("Error saving user data:", error);
    return res.status(500).json({message: "Internal Server Error" });
  }
};
exports.GetAll =  async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json({message: 'Successfully fetched' ,user :  users});
    } catch (err) {
      console.error("Failed to fetch users:", err.message);
      res.status(500).send("Failed to fetch users");
    }
};
exports.GetByID =  async (req, res) => {
    const slug = req.params.slug;
    if(!slug) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      const user = await User.find({slug : slug});
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      } 
      return res.status(200).json({message: 'User fetched successfully' , user : user});
    } catch (err) {
      console.error("Failed to fetch user:", err.message);
      return res.status(500).json({ message: "Failed to fetch user" });
    }
};
exports.GetProfileData = async (req, res) => {
  const id = req.userId;  
  if (!id) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Find user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: 'User fetched successfully', user });
  } catch (err) {
    console.error("Failed to fetch user:", err.message);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};
exports.DeleteUser = async (req, res) => { 
  const id = req.userId;
  if(!id){
    return res.status(400).json({ message: "Invalid user ID" });  
  }
    try {
      const deleteUser = await User.findByIdAndDelete(id);
  
      if (!deleteUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      console.error("Failed to delete User:", err.message);
      return res.status(500).json({ message: "Failed to delete User" });
    }
};
exports.UserUpdate =  async (req, res) => {
  const id = req.userId;
  if (!id) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("User not found");
    } else {
      try {   
        const { name } = req.body;
        if (name){

        user.name = name; 
        user.slug = slugify(name, {
          lower: true,    
          strict: true
        });
      }  
        const updatedUser = await user.save();
        res.status(200).json({message: 'Update Successfully'  , user : updatedUser});
      } catch (err) {
        console.error("Failed to update user:", err.message);
        res.status(500).send("Failed to update user");
      }
    }
};


exports.sendemail =  async (req, res) => {
  const { email } = req.body; 
  
  if (!email) {
    return res.status(400).json({
      status: "error",
      message: "Email is required.",
    });
  } 
  const otp = Math.floor(100000 + Math.random() * 900000);  
  try {
    const isValidUser = await User.findOne({ email: email });

    if (!isValidUser) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found. Please create your account" });
    }

    const filter = { email: email };
    const update = { otp: otp };
    const options = {
      new: true,
      upsert: true,
    };

    const updatedUser = await User.findOneAndUpdate(filter, update, options);

    if (!updatedUser) {
      return res
        .status(500)
        .json({ status: "error", message: "Failed to update user with OTP." });
    }  
     const sended =  await sendEmail(email , "VERIFY" , otp);

     if(!sended) {
      return res.json({ status: "error", message: "Failed to send OTP email." });
    }

    return res .status(200) .json({ status: "success", message: "OTP sent successfully." });
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
}

exports.verifyOtp =  async (req, res) => {
  const { otp } = req.body;
  const { email } = req.body; 
  if (!email || !otp) {
    return res.json({ status: "error", message: "Please fill the otp." });
  } else { 
    const otpCheck = await User.findOne({ email }); 
    if (otpCheck) {
      if (otpCheck.otp == otp) {
        return res.json({
          status: "success",
          message: "OTP verified successfully.",
        });
      } else {
        return res.json({ status: "error", message: "OTP not verified." });
      }
    } else {
      return res.json({
        status: "error",
        message: " User does not exist , Please register.",
      });
    }
  }
}
exports.updatePassword = async (req, res) => {
  const { password, email } = req.body; 
  if (!password || !email) {
    return res.json({ status: "error", message: "Please fill the password." });
  } 
  try {
    hashedPssword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPssword },
      { new: true }
    );

    if (!user) {
      return res.json({ status: "error", message: "User not found." });
    }
    return res.json({
      status: "success",
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Error updating password:", error.message);
    return res.json({ status: "error", message: "Internal Server Error" });
  }
};



