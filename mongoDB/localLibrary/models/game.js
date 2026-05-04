const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const gameSchema = new Schema({
  title: { type: String, ref: "Game", required: true, maxLength: 100 },
  developer: { type: String, required: true, maxLength: 100 },
  release_date: { type: Date },
});

// Virtual for games's URL
gameSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/game/${this._id}`;
});

// Export model
module.exports = mongoose.model("game", gameSchema);