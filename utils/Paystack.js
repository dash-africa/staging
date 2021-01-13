import axios from 'axios';

const paystackUrl = 'https://api.paystack.co/transaction';

const verifyPayment = async (paymentReference) => {
    const response = await axios.get(`${paystackUrl}/verify/${paymentReference}`, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
    });

    return response.data;
};

const chargeCard = async (authorization_code, email, amount) => {
    const data = {
        authorization_code,
        email,
        amount: amount * 100
    };
    const response = await axios.post(`${paystackUrl}/charge_authorization`, data, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
    });

    return response.data;
};

const addPaystackChargeToamount = (amount) => {
    let newAmount = 0;
    const charge = amount * 0.015;

    newAmount = amount + charge;

    if (amount > 2500) {
        newAmount += 100;
    }

    return newAmount;
};

export { verifyPayment, chargeCard, addPaystackChargeToamount };