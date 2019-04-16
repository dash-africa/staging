import mongoose from 'mongoose';
const {Schema} = mongoose;

const storeSchema = new Schema({
    name: {
        type: 'String',
        required: true,
        help: 'This field is required'
    },
    _cityId: {
        type: Schema.Types.ObjectId,
        ref: 'City'
    },
    delivery_time: {
        type: String
    },
    tags: [{
        type: String
    }],
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }]
});

const Store = mongoose.model('Store', storeSchema);
export default Store;