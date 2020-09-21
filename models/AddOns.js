import mongoose from 'mongoose';
const { Schema } = mongoose;

const addOnSchema = new Schema({
    name: {
        type: 'String',
        required: true,
        help: 'This field is required'
    },
    isRequired: {
        type: Boolean,
        default: false
    },
    canBuyMultiple: {
        type: Boolean,
        default: false
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'Item'
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
});

const AddOns = mongoose.model('AddOns', addOnSchema);
export default AddOns;