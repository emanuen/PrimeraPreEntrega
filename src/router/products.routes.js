const { Router } = require('express');
const fs = require('fs');
const path = require('path');

const { upload } = require('../lib/images');

const router = Router()

router.get('/api/products', async (req, res) => {

    const { limit } = req.query

    const products = await fs.readFileSync(path.join(__dirname, "../../productos.json"), 'utf8');
    const showProducts = JSON.parse(products)

    if (limit) {
        return res.status(200).json(showProducts.slice(0, limit))
    }

    return res.status(200).json(showProducts)

})

router.get('/api/products/:pid', async (req, res) => {

    const { pid } = req.params

    const products = await fs.readFileSync(path.join(__dirname, "../../productos.json"), 'utf8');
    const allProducts = JSON.parse(products)

    const product = allProducts.find(prod => prod.id === Number(pid))

    if (!product) {
        return res.status(400).json({ message: "Product does not exists" })
    }

    return res.status(200).json(product)

})

router.post('/api/products', upload.array("files", 10), async (req, res) => {

    const { title, description, code, price, status, stock, category } = req.body

    const products = await fs.readFileSync(path.join(__dirname, "../../productos.json"), 'utf8');
    const allProducts = JSON.parse(products)

    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ message: "There are empty fields" })
    }

    const codeExists = allProducts.find(prod => prod.code === code)

    if (codeExists) {
        return res.status(400).json({ message: "Code already exists" })
    }

    let routeImages = []

    if(req.files) {
        for (let i = 0; i < req.files.length; i++) {
            routeImages.push(req.files[i].path)
        }
    }

    allProducts.push({
        id: allProducts.length === 0 ? 1 : allProducts[allProducts.length - 1].id + 1,
        title,
        description,
        code,
        price,
        status: status === undefined ? true : status,
        stock,
        category,
        thumbnails: req.files ? routeImages : []
    })

    await fs.writeFileSync(path.join(__dirname, "../../productos.json"), JSON.stringify(allProducts))

    return res.status(200).json({
        message: "Product added successfully",
        products: allProducts
    })

})

router.put('/api/products/:pid', async (req, res) => {

    const { pid } = req.params

    const products = await fs.readFileSync(path.join(__dirname, "../../productos.json"), 'utf8');
    const allProducts = JSON.parse(products)

    const product = allProducts.find(prod => prod.id === Number(pid))

    if (!product) {
        return res.status(400).json({ message: "Product does not exists" })
    }

    for (const key of Object.keys(req.body)) {
        product[key] = req.body[key]
    }

    const productsUpdated = JSON.parse(products).map(prod => prod.id === Number(pid) ? product : prod)
    await fs.writeFileSync(path.join(__dirname, "../../productos.json"), JSON.stringify(productsUpdated))

    return res.status(200).json({
        message: "Product updated succesfully",
        product: productsUpdated
    })

})

router.delete('/api/products/:pid', async (req, res) => {

    const { pid } = req.params

    const products = await fs.readFileSync(path.join(__dirname, "../../productos.json"), 'utf8');
    const product = JSON.parse(products).find(prod => prod.id === Number(pid))

    if (!product) {
        return res.status(400).json({ message: "Product does not exists" })
    }

    const productRemoved = JSON.parse(products).filter(prod => prod.id !== Number(pid))
    await fs.writeFileSync(path.join(__dirname, "../../productos.json"), JSON.stringify(productRemoved))

    return res.status(200).json({ message: "Product removed sucessfully" })

})

module.exports = router

