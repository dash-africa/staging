import mongoose from 'mongoose';
const {Schema} = mongoose;

const categorySchema = new Schema({
    name: {
        type: 'String',
        required: true,
        help: 'This field is required'
    },
    _storeId: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
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

const Category = mongoose.model('Category', categorySchema);
export default Category;