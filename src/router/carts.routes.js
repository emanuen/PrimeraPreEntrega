const { Router } = require('express');
const fs = require('fs');
const path = require('path');

const router = Router()

router.post('/api/carts', async (req, res) => {

    const carts = await fs.readFileSync(path.join(__dirname, "../../carrito.json"), 'utf8');
    const allCarts = JSON.parse(carts)

    allCarts.push({
        id: allCarts.length === 0 ? 1 : allCarts[allCarts.length - 1].id + 1,
        products: []
    })

    await fs.writeFileSync(path.join(__dirname, "../../carrito.json"), JSON.stringify(allCarts))

    return res.status(200).json({
        message: "Cart added successfully",
        products: allCarts
    })

})

router.get('/api/carts/:cid', async (req, res) => {

    const { cid } = req.params

    const carts = await fs.readFileSync(path.join(__dirname, "../../carrito.json"), 'utf8');
    const allCarts = JSON.parse(carts)

    const cart = allCarts.find(c => c.id === Number(cid))

    if (!cart) {
        return res.status(400).json({ message: "Product does not exists" })
    }

    return res.status(200).json({ products: cart.products })

})

router.post('/api/carts/:cid/product/:pid', async (req, res) => {

    const { quantity } = req.body
    const { cid, pid } = req.params

    const carts = await fs.readFileSync(path.join(__dirname, "../../carrito.json"), 'utf8');
    const allCarts = JSON.parse(carts)

    const products = await fs.readFileSync(path.join(__dirname, "../../productos.json"), 'utf8');
    const allProducts = JSON.parse(products)

    const cart = allCarts.find(c => c.id === Number(cid))

    if (!cart) {
        return res.status(400).json({ message: "Product does not exists" })
    }

    const product = allProducts.find(prod => prod.id === Number(pid))

    if (!product) {
        return res.status(400).json({ message: "Product does not exists" })
    }

    cart.products.push({
        id: product.id,
        quantity
    })

    const cartsUpdated = JSON.parse(carts).map(c => c.id === Number(cid) ? cart : c)
    await fs.writeFileSync(path.join(__dirname, "../../carrito.json"), JSON.stringify(cartsUpdated))

    return res.status(200).json({
        message: "Product added successfully",
        cart: cartsUpdated
    })
})


module.exports = router