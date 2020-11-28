import mongoose from 'mongoose';
const { Schema } = mongoose;

const cardSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    authorization_code: {
        type: String,
        required: true,
        help: "This field is required"
    },
    card_type: {
        type: String,
        required: true,
        help: "This field is required"
    },
    last4: {
        type: String,
        required: true,
        help: "This field is required"
    },
    exp_month: {
        type: String,
        required: true,
        help: "This field is required"
    },
    exp_year: {
        type: String,
        required: true,
        help: "This field is required"
    },
    bin: {
        type: String,
        required: true,
        help: "This field is required"
    },
    bank: {
        type: String,
        required: true,
        help: "This field is required"
    },
    channel: {
        type: String,
        required: true,
        help: "This field is required"
    },
    signature: {
        type: String,
        required: true,
        help: "This field is required"
    },
    reusable: {
        type: Boolean,
        required: true,
        help: "This field is required"
    },
    country_code: {
        type: String,
        required: true,
        help: "This field is required"
    },
    account_name: {
        type: String,
        help: "This field is required"
    },
    customer_code: {
        type: String,
        required: true,
        help: "This field is required"
    },
    email: {
        type: String,
        required: true,
        help: "This field is required"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Card = mongoose.model('Card', cardSchema);
export default Card;