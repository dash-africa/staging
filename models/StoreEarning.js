import mongoose from 'mongoose';
const { Schema } = mongoose;

const storeEarningSchema = new Schema({
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
    },
    amount: {
        type: Number,
        required: true,
        help: "This field is required"
    },
    history: {
        type: Schema.Types.ObjectId,
        ref: 'History'
    },
    withdrawal: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const StoreEarning = mongoose.model('StoreEarning', storeEarningSchema);
export default StoreEarning;