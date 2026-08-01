/* import express from 'express';
import Contact from '../src/models/contacts';
 */
require('dotenv').config(); // To use the environment variables
const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const Contact = require('./models/contact');

// console.log('process.env.MONGODB_URI', process.env.MONGODB_URI);
// console.log('process.env.EXPRESS_PORT', process.env.PORT);
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
}

app.use(express.static('dist'));
app.use(express.json());
app.use(requestLogger);
app.use(cors());
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"));

app.get('/api/info', (request, response) => {
    response.send('<h1>This is the application to manage contacts</h1>');
});

app.get('/api/persons', (request, response, next) => {
    Contact.find({})
    .then(
        contacts => {
            response.json(contacts);
        }
    )
    .catch(error => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
    // Contact.find({_id: request.params.id}).then(
    Contact.findById(request.params.id)
    .then(
        contacts => {
            // console.log('hello done! ', request.params.id);            
            if(!contacts){
                console.log(`Contact ${request.params.id} not found!`);
                return response.status(400).json({
                    "error": "Id not found!"
                });
            }
            response.json(contacts);
        }
    )
    .catch(error => next(error));
});

app.post('/api/persons', (request, response, next) => {
    const newContact = request.body;
    if(!newContact.name || !newContact.number){
        return response.status(400).json({
                "error": "No body in request!"
        });
    }
    // console.log('newContact ', newContact);
    const contact = new Contact({
            name: newContact.name,
            number: newContact.number,
        }
    )
    contact.save()
    .then(savedContact => {
    response.json(savedContact);
    })
    .catch(error => next(error));
});

app.put('/api/persons', (request, response, next) => {
    const newContact = request.body;
    if(!newContact.name || !newContact.number){
        console.log('No boody in request');
        return response.status(400).json({
                "error": "No body in request!"            
        })
    }
    Contact.findOneAndUpdate(
        {name: newContact.name}, {$set:{number: newContact.number}}, 
        {returnDocument: 'after', runValidators:true})
        .then(updatedContact => {
            // console.log('Contact updated!');
            if(!updatedContact){
                console.log(`Contact ${newContact.name} not found!`);
                return response.status(400).json({
                    "error": "Contact name not found!"
                });
            }
            response.json(updatedContact);
        })
        .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
    // console.log('in delete operation');
    Contact.findByIdAndDelete(request.params.id)
    .then(contact => {
        // console.log('found and delete contact ', request.params.id);
        if(!contact){
            console.log(`Contact ${request.params.id} not found!`);
            return response.status(400).json({
                "error": "Id not found!"
            });
        }
        response.json(contact);
    })
    .catch( error => {
        next(error);
    })
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({
     error: 'Unknown endpoint' 
    })
}

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
//   console.error("error: ", error.message);  
  if (error.name === 'CastError') {
    return response.status(400).send({
        error: error.message
    }); // 'Malformatted id'
  } else if(error.name === 'ValidationError'){    
    return response.status(400).send({
        error: error.message
    });
  }
  next(error);
}

// This has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})