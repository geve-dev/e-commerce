require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const addressRoutes = require('./routes/addressRoutes');
const userStore = require('./routes/storeRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const itemRoutes = require('./routes/itemRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use('/product', productRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/address', addressRoutes);
app.use('/store', userStore);
app.use('/purchase', purchaseRoutes);
app.use('/item', itemRoutes);
app.use('/admin', adminRoutes);
app.use('/seller', sellerRoutes);

app.use(errorHandler);

module.exports = app;