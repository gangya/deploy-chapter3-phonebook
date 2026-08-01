/* import express from 'express';
import morgan from 'morgan'; */

const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

// const url = "mongodb+srv://gangya_db_user:2014Pciport@cluster0.f2hulhc.mongodb.net/phonebook?appName=Cluster0";
const url = process.env.MONGODB_URI;

// console.log(`process.env.MONGODB_URI in contact.js ${process.env.MONGODB_URI}`, );

mongoose.connect(url, {family: 4})
.then( 
  result => {
    console.log('connected to MongoDB');
    }
).catch(
    error => {
      console.log('error connecting to MongoDB: ', error);
    }
)

const contactSchema = mongoose.Schema(
    {
        name: {
          type: String,
          minLength: 3,
          required: true
        },
        number: {
          type: String,
          minLength:8,
          validate : {
            validator : function(v) {
              return /^\d{2,3}-\d+$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
          },
          required: [true, 'Contact phone number required']
        },
    }
);

contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

module.exports = mongoose.model('Contact', contactSchema);