const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to set up multer with Cloudinary storage
const createCloudinaryParser = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderName || 'default-folder', // Folder name on Cloudinary
      format: async (req, file) => 'jpg', // Supports promises as well
      public_id: (req, file) => file.fieldname + '-' + Date.now(),
    },
  });
  
  return multer({ storage: storage });
};

// Export the parser for use in other parts of your application
const parser = createCloudinaryParser('blog-app');

module.exports = {
  parser,
  createCloudinaryParser
};
