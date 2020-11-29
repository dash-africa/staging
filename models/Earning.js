import mongoose from 'mongoose';
const { Schema } = mongoose;

const earningSchema = new Schema({
    driver: {
        type: Schema.Types.ObjectId,
        ref: 'Driver'
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
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Earning = mongoose.model('Earning', earningSchema);
export default Earning;