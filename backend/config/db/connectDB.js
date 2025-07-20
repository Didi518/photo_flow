const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL);
    console.log(`MongoDB connecté sur l'hôte: ${conn.connection.host}`);
  } catch (err) {
    console.error(
      'Erreur lors de la connexion à la base de données:',
      err.stack
    );
    process.exit(1);
  }
};

module.exports = connectDB;
