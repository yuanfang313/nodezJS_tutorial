const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.json());

// Read JSON data, and parse it to a JS obj
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
  // response the 'get' request with data formatted in json
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};
const getTour = (req, res) => {
  // req.params get the val after ...tours/:id
  console.log(req.params);
  // id is a string, so we need to convert sting to number
  const id = req.params.id * 1;
  // find the obj with id specify by users
  const tour = tours.find((el) => el.id === id);

  //if (id > tours.length - 1) {
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tour: tour,
    },
  });
};

const createTour = (req, res) => {
  //console.log(req.body);

  // when user post data(req.body) at this URL, push a new obj into some existing data
  const newId = tours[tours.length - 1].id + 1;
  // Object.assign allows us to create a new object by merging two existing objects together
  const newTour = Object.assign(
    {
      id: newId,
    },
    req.body
  );

  tours.push(newTour);
  // write the new data into certain file and send back certain data
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour, // req.body + id
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  console.log(req.body);
  const id = req.params.id * 1;
  // req.body --> tours[id]
  const updatedTour = Object.assign(tours[id], req.body);
  tours[id] = updatedTour;

  if (req.params.id * 1 > tours.length - 1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(200).json({
        status: 'success',
        data: {
          tour: tours[id],
        },
      });
    }
  );
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length - 1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

//app.get('/api/v1/tours', getAllTours);
//app.post('/api/v1/tours', createTour);
//app.get('/api/v1/tours/:id', getTour);
//app.patch('/api/v1/tours/:id', updateTour);
//app.delete('/api/v1/tours/:id', deleteTour);

app.route('/api/v1/tours').get(getAllTours).post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
