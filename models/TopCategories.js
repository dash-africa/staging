import mongoose from 'mongoose';
const {Schema} = mongoose;

const topCategoriesSchema = new Schema({
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
    created_at: {
        type: Date,
        default: Date.now
    },
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
    }
});

const TopCategories = mongoose.model('TopCategories', topCategoriesSchema);
export default TopCategories;