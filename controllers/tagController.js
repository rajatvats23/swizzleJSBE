const Tag = require('../models/tagModel');
const Product = require('../models/productModel');

// Standardized response structure
const sendResponse = (res, statusCode, status, message, data = null) => {
  const response = {
    status,
    message
  };
  
  if (data) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

// @desc    Create a new tag
// @route   POST /api/tags
// @access  Private/Manager
const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if tag already exists (case insensitive)
    const existingTag = await Tag.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingTag) {
      return sendResponse(res, 400, 'fail', 'Tag with this name already exists');
    }
    
    // Create tag
    const tag = await Tag.create({
      name,
      createdBy: req.user._id
    });
    
    return sendResponse(res, 201, 'success', 'Tag created successfully', { tag });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get all tags
// @route   GET /api/tags
// @access  Private
const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort('name');
    
    return sendResponse(res, 200, 'success', 'Tags retrieved successfully', { tags });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Private/Manager
const updateTag = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if name is already taken by another tag
    const existingTag = await Tag.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id }
    });
    
    if (existingTag) {
      return sendResponse(res, 400, 'fail', 'Tag with this name already exists');
    }
    
    // Find and update tag
    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );
    
    if (!tag) {
      return sendResponse(res, 404, 'fail', 'Tag not found');
    }
    
    return sendResponse(res, 200, 'success', 'Tag updated successfully', { tag });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Private/Manager
const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return sendResponse(res, 404, 'fail', 'Tag not found');
    }
    
    // Check if tag is used by any products
    const productsUsingTag = await Product.countDocuments({ tags: req.params.id });
    
    if (productsUsingTag > 0) {
      return sendResponse(res, 400, 'fail', `Cannot delete tag. It is used by ${productsUsingTag} products.`);
    }
    
    await tag.deleteOne();
    
    return sendResponse(res, 200, 'success', 'Tag deleted successfully');
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

module.exports = {
  createTag,
  getTags,
  updateTag,
  deleteTag
};