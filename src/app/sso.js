var express = require("express");
var app = express();

function TestMessage() {
  console.log(app);
}

module.exports = TestMessage;
