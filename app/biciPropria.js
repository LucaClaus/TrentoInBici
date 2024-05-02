const express = require('express');
const router = express.Router();
//const Book = require('./models/book'); // get our mongoose model

router.get('', async (req, res) => {
    

    let books = await Book.find({});

    books = books.map( (book) => {
        return {
            self: '/api/v1/books/' + book.id,
            title: book.title
        };
    });
    res.status(200).json(books);
});


router.post('', async (req, res) => {

	let book = new Book({
        title: req.body.title
    });
    
	book = await book.save();
    
    let bookId = book.id;

    console.log('Book saved successfully');

    /**
     * Link to the newly created resource is returned in the Location header
     * https://www.restapitutorial.com/lessons/httpmethods.html
     */
    res.location("/api/v1/books/" + bookId).status(201).send();
});

router.post('/dest', async (req, res) => {

	let book = new Book({
        title: req.body.title
    });
    
	book = await book.save();
    
    let bookId = book.id;

    console.log('Book saved successfully');

    /**
     * Link to the newly created resource is returned in the Location header
     * https://www.restapitutorial.com/lessons/httpmethods.html
     */
    res.location("/api/v1/books/" + bookId).status(201).send();
});