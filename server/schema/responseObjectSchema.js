const mongoose = require("mongoose");
const responseSchemaFile = require("./responseSchema.js");

const responseObjectSchema = new mongoose.Schema({
  sessionID: {
    type: String,
    required: [true, "SessionID is required"],
  },
  responses: {
    type: [responseSchemaFile],
    required: [false, "RESPONSES TO BE VALIDATED PROPERLY"],
  },
});

module.exports = responseObjectSchema;
