import mongoose from "mongoose";
import MongooseSequence from "mongoose-sequence";

const mongooseSequence = MongooseSequence(mongoose);
const schema = new mongoose.Schema({
  id: {
    type: Number,
    default: 0,
    unique: true,
    required: true
  },
  object: {
    type: String,
    default: "zone",
    required: true
  },
  name: {
    type: String,
    default: "",
    required: true
  },
  avails: {
    type: Number,
    default: 0,
    required: true
  },
  publisher: {
    type: Number,
    default: 0,
    required: true
  },
  serial: {
    type: Number,
    default: 0,
    required: true
  },
  input_index: {
    type: Number,
    default: 0,
    required: true
  },
  stream_index: {
    type: Number,
    default: 0,
    required: true
  }
});

// add unique id
schema.plugin(mongooseSequence, {
  id: "zone_id",
  inc_field: "id",
  collection_name: "ids"
});

schema.index({ serial: 1, input_index: 1, stream_index: 1 }, { unique: true })

export default mongoose.model("zone", schema);
