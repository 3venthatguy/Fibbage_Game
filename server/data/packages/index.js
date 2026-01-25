/**
 * Question Package Registry
 *
 * This module manages all available question packages.
 * Add new packages by requiring them and adding to the packages object.
 */

const economicsPackage = require('./economics');
const architecturePackage = require('./architecture');
const bioinformaticsPackage = require('./bioinformatics');

// Registry of all available packages
const packages = {
  economics: economicsPackage,
  architecture: architecturePackage,
  bioinformatics: bioinformaticsPackage
};

/**
 * Gets a package by its ID.
 * @param {string} packageId - The package identifier
 * @returns {object|null} The package or null if not found
 */
function getPackage(packageId) {
  return packages[packageId] || null;
}

/**
 * Gets all available packages (metadata only, no questions).
 * @returns {Array} Array of package metadata objects
 */
function getAvailablePackages() {
  return Object.values(packages).map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    icon: pkg.icon,
    questionCount: pkg.questions.length
  }));
}

/**
 * Gets questions from a specific package.
 * @param {string} packageId - The package identifier
 * @returns {Array} Array of questions or empty array if package not found
 */
function getQuestions(packageId) {
  const pkg = packages[packageId];
  return pkg ? pkg.questions : [];
}

/**
 * Gets the default package ID.
 * @returns {string} The default package ID
 */
function getDefaultPackageId() {
  return 'economics';
}

module.exports = {
  getPackage,
  getAvailablePackages,
  getQuestions,
  getDefaultPackageId,
  packages
};
