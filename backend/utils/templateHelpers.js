const hbs = require('hbs');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Charge et compile un template Handlebars
 * @param {string} templateName - Nom du fichier template (ex: 'otpTemplate.hbs')
 * @param {object} replacements - Variables à injecter dans le template
 * @returns {string} HTML compilé
 */
const loadTemplate = (templateName, replacements) => {
  const templatePath = path.join(__dirname, '../templates', templateName);

  try {
    const source = fs.readFileSync(templatePath, 'utf-8');
    const template = hbs.compile(source);
    return template(replacements);
  } catch (error) {
    throw new Error(
      `Erreur lors du chargement du template ${templateName}: ${error.message}`
    );
  }
};

/**
 * Templates prédéfinis pour les emails courants
 */
const emailTemplates = {
  verification: (username, otp) =>
    loadTemplate('otpTemplate.hbs', {
      title: 'Vérification du compte',
      username,
      otp,
      message: 'Votre code de vérification à usage unique est: ',
      isLink: false,
    }),

  passwordReset: (username, otp) =>
    loadTemplate('otpTemplate.hbs', {
      title: 'Réinitialisation du mot de passe',
      username,
      otp,
      message: 'Veillez suivre ce lien afin de modifier le mot de passe: ',
      isLink: true,
    }),

  welcome: (username) =>
    loadTemplate('welcomeTemplate.hbs', {
      title: 'Bienvenue sur PhotoFlow',
      username,
    }),
};

module.exports = {
  loadTemplate,
  emailTemplates,
};
