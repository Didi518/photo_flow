const cloudinary = require('cloudinary').v2;

const config = require('../config/images/cloudinary');

const uploadToCloudinary = async (fileUri) => {
  try {
    const response = await cloudinary.uploader.upload(fileUri);
    return response;
  } catch (error) {
    console.log("Erreur lors de l'upload vers Cloudinary: ", error);
    throw new Error(
      "Echec lors de l'upload de l'image. Veuillez réessayer plus tard."
    );
  }
};

module.exports = { uploadToCloudinary, config };
