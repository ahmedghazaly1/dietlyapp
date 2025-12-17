// tests/__mocks__/queryBuilder.js
// Backwards-compatible wrapper around the shared mongooseQuery helper

const { createMockQuery } = require("./mongooseQuery");

module.exports = { createMockQuery };
