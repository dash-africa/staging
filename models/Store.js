import mongoose from 'mongoose';
const { Schema } = mongoose;

const storeSchema = new Schema({
    name: {
        type: 'String',
        required: true,
        help: 'This field is required'
    },
    username: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    password: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    image: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    address: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    delivery_time: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    schedule: [{
        day: {
            type: String
        },
        time: {
            type: String
        }
    }],
    coordinates: {
        long: {
            type: String,
            required: true,
            help: 'This field is required'
        },
        lat: {
            type: String,
            required: true,
            help: 'This field is required'
        }
    },
    _cityId: {
        type: Schema.Types.ObjectId,
        ref: 'City'
    },
    _storeTypeId: {
        type: Schema.Types.ObjectId,
        ref: 'StoreType'
    },
    tags: [{
        type: String
    }],
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }],
    top_categories: [{
        type: Schema.Types.ObjectId,
        ref: 'TopCategories'
    }],
    successful_orders: {
        type: Number,
        default: 0
    },
    failed_orders: {
        type: Number,
        default: 0
    },
    overall_earnings: {
        type: Number,
        default: 0
    },
    bank_name: {
        type: String,
        required: true,
        help: 'This field is required'
    },
    bank_code: {
        type: Number,
        required: true,
        help: 'This field is required'
    },
    account_number: {
        type: Number,
        required: true,
        help: 'This field is required'
    },
    recipient_code: {
        type: String,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Store = mongoose.model('Store', storeSchema);
export default Store;