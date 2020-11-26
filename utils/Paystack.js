import axios from 'axios';

const paystackUrl = 'https://api.paystack.co/transaction';

const verifyPayment = async (paymentReference) => {
    const response = await axios.get(`${paystackUrl}/verify/${paymentReference}`, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
    });

    return response;
};

const chargeCard = async (authorization_code, email, amount) => {
    const data = {
        authorization_code,
        email,
        amount
    };
    const response = await axios.post(`${paystackUrl}/charge_authorization`, data, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
    });

    return response;
};

export default { verifyPayment, chargeCard };