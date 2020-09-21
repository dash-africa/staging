import mongoose from 'mongoose';
const { Schema } = mongoose;

const storeTypeSchema = new Schema({
    name: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    image: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    stores: [{
        type: Schema.Types.ObjectId,
        ref: 'Store'
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
});

const StoreType = mongoose.model('StoreType', storeTypeSchema);
export default StoreType;