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
    deliveryFee: {
        type: Number,
        required: true,
        help: "This field is required"
    },
    serviceFee: {
        type: Number,
        required: true,
        help: "This field is required"
    },
    totalItemAmount: {
        type: Number,
        required: true,
        help: "This field is required"
    },
    deliveryAddress: {
        type: String,
        required: true,
        help: "This field is required"
    },
    driverAcceptedTime: {
        type: String,
        default: null
    },
    restaurantAcceptedTime: {
        type: String,
        default: null
    },
    deliveryTime: {
        type: String,
        default: null
    },
    pickUpTime: {
        type: String,
        default: null
    },
    cancellationTime: {
        type: String,
        default: null
    },
    orderId: {
        type: String,
        default: null
    },
    assignedDriver: {
        type: Schema.Types.ObjectId,
        ref: 'Driver'
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