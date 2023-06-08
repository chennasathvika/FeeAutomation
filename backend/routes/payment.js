const express = require('express');
const cors = require('./cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
var pass = require('../passport-config');
var db = require('../mysql-config');
const paymentRouter = express.Router();

function getISTDate() {
  let dateUTC = new Date();
  dateUTC = dateUTC.getTime()
  let dateIST = new Date(dateUTC);
  dateIST.setHours(dateIST.getHours() + 5);
  dateIST.setMinutes(dateIST.getMinutes() + 30);
  return dateIST;
}

paymentRouter.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

//commence payment
paymentRouter.post('/', cors.corsWithOptions, pass.verifyUser, (req, res) => {
  console.log('okh!!!!!!!!!!!!');
  console.log('token ',req.body.token.id);
  stripe.customers.create({
    name: req.user.username,
    email: req.body.email,
    source: req.body.token.id,
    
  })
    .then(customer => {
      stripe.charges.create({
        amount: req.body.amount,
        currency: "INR",
        customer: customer.id,
        
      })
        .then(charge => {
          let date = getISTDate();
          date = date.toISOString().slice(0, 10).replace('T', ' ');
          console.log(date);
          // let query = "UPDATE students SET paidornot=1, dateofpayment='" + date + "' WHERE admno='" + req.user.username + "'";
          let query = "UPDATE students SET paidornot=1, dateofpayment=?  WHERE admno= ? ";
          console.log(query);
          db.query(query,[date,req.user.username], (err, result) => {
            if (err) {
              console.log(query);
              console.log(err);
              res.status(500).send(err);
            }
            else {
              res.send({ success: true });
            }
          });
        })
        .catch(err => {
          console.log("Error: ", err);
          res.status(500).send({ error: err });
        });
    })
    .catch(err => {
      console.log("Outer cactch  Error: ", err);
      res.status(500).send({ error: err });
    })
});

module.exports = paymentRouter;
