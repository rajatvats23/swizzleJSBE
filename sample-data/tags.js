// sample-data/tags.js
const mongoose = require('mongoose');
const { managerIds } = require('./restaurants');

// Generate ObjectIds for tags
const tagIds = [];
for (let i = 0; i < 12; i++) {
  tagIds.push(new mongoose.Types.ObjectId());
}

// Sample tag data
const tags = [
  {
    _id: tagIds[0],
    name: 'Spicy',
    createdBy: managerIds[0]
  },
  {
    _id: tagIds[1],
    name: 'Vegetarian',
    createdBy: managerIds[0]
  },
  {
    _id: tagIds[2],
    name: 'Vegan',
    createdBy: managerIds[1]
  },
  {
    _id: tagIds[3],
    name: 'Gluten-Free',
    createdBy: managerIds[1]
  },
  {
    _id: tagIds[4],
    name: 'Bestseller',
    createdBy: managerIds[2]
  },
  {
    _id: tagIds[5],
    name: 'Chef Special',
    createdBy: managerIds[2]
  },
  {
    _id: tagIds[6],
    name: 'Low Calorie',
    createdBy: managerIds[3]
  },
  {
    _id: tagIds[7],
    name: 'Contains Nuts',
    createdBy: managerIds[3]
  },
  {
    _id: tagIds[8],
    name: 'Dairy-Free',
    createdBy: managerIds[4]
  },
  {
    _id: tagIds[9],
    name: 'New Item',
    createdBy: managerIds[4]
  },
  {
    _id: tagIds[10],
    name: 'Seasonal',
    createdBy: managerIds[5]
  },
  {
    _id: tagIds[11],
    name: 'Recommended',
    createdBy: managerIds[5]
  }
];

module.exports = {
  tags,
  tagIds
};