require('dotenv').config();

const express = require('express');
const axios = require('axios');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    return res.status(200).json("Server is running...")
});

const getTransitInfo = async (payload) => {
    try {
        const response = await axios({
            method: 'post',
            url: `https://wwwcie.ups.com/api/shipments/${process.env.BUTTER_UPS_VERSION}/transittimes`,
            headers: {
                Authorization: `Bearer ${process.env.BUTTER_UPS_TOKEN}`,
                'Content-Type': 'application/json',
                transId: 'string',
                transactionSrc: process.env.BUTTER_UPS_SRC,
            },
            data: payload,
        });

        return { http_code: response.status, data: response.data };
    } catch (error) {
        return { http_code: error.response?.status || 500, message: error.message, error: true };
    }
};

app.post('/get-transit-info', async (req, res) => {
    const payload = req.body;
    try {
        const resultUPS = await getTransitInfo(payload);
        if (resultUPS.http_code === 401) {
            throw new Error('Invalid Authentication Information. Contact the system administrator');
        }
        res.status(200).json({
            error: false,
            message: 'success',
            code: 200,
            data: resultUPS.data,
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: error.message,
            code: error.code || 500,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
