/**
 * Legacy questions file - now re-exports from economics package
 * This file is kept for backwards compatibility.
 * New code should use the packages system: require('./packages')
 */
const economicsPackage = require('./packages/economics');

// Re-export economics questions for backwards compatibility
module.exports = economicsPackage.questions;
