// tests/__mocks__/responseHandler.js
// FINAL VERSION

const sendSuccess = jest.fn((res, status, data, message) => {
  const response = { success: true };
  if (data !== undefined) response.data = data;
  if (message) response.message = message;
  
  res.status = jest.fn(() => ({ json: jest.fn(() => response) }));
  return response;
});

const sendError = jest.fn((res, status, message, error) => {
  const response = { success: false, message };
  if (error) response.error = error;
  
  res.status = jest.fn(() => ({ json: jest.fn(() => response) }));
  return response;
});

module.exports = { sendSuccess, sendError };