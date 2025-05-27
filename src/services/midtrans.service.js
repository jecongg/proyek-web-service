const snap = require("../config/midtrans.config");

async function createTransaction(orderId, grossAmount, customerDetails) {
    const parameter = {
        transaction_details: {
            order_id: orderId,
            gross_amount: grossAmount,
        },
        customer_details: customerDetails,
    };

    return await snap.createTransaction(parameter);
}

module.exports = { createTransaction };
