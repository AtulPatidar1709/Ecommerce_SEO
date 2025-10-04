import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  userId: String,
  productId: String,
  eventType: String, 
  timestamp: { type: Date, default: Date.now },
});

const Event = mongoose.model('Event', EventSchema);

export default Event;