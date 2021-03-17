require('dotenv').config();
const express = require('express');
const { connectToDB } = require('./db');
const { installHandler } = require('./api_handler');

const app = express();
const API_SERVER_PORT = process.env.API_SERVER_PORT || 3000;

installHandler(app);

(async function () {
  try {
    await connectToDB();
    app.listen(API_SERVER_PORT, function () {
      console.log(
        `API server started at port http://localhost:${API_SERVER_PORT}`,
      );
    });
  } catch (err) {
    console.log(err);
  }
})();
