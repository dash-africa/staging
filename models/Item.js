import mongoose from 'mongoose';
const { Schema } = mongoose;

const itemSchema = new Schema({
    price: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    image: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    name: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    description: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    _categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    isAddOn: {
        type: Boolean,
        default: false,
    },
    isSellable: {
        type: Boolean,
        default: true
    },
    addOns: [{
        type: Schema.Types.ObjectId,
        ref: 'AddOns'
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
});

const Item = mongoose.model('Item', itemSchema);
export default Item;