import mongoose from 'mongoose';
const {Schema} = mongoose;

const historySchema = new Schema({
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'Item'
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    paymentRef: {
        type: String,
        required: true,
        help: "This field is required"
    },
    status: {
        type: String,
        required: true,
        help: "This field is required"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const History = mongoose.model('History', historySchema);
export default History;