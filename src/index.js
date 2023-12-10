const express = require('express');
const path = require('path');

const app = express()

app.use(express.json())

app.use(require('./router/carts.routes'))
app.use(require('./router/products.routes'))

app.use(express.static(path.join(__dirname, "../public")))

app.listen(8080, () => {
    console.log("Server running");
})