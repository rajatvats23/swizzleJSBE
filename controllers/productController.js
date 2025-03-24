const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const AWS = require('aws-sdk');
const crypto = require('crypto');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

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

// Generate presigned URL for S3 upload
const generatePresignedUrl = async (fileType, fileName) => {
  const fileExtension = fileType.split('/')[1];
  const randomString = crypto.randomBytes(16).toString('hex');
  const key = `products/${randomString}-${fileName}.${fileExtension}`;
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
    Expires: 300 // URL expires in 5 minutes
  };
  
  try {
    const url = await s3.getSignedUrlPromise('putObject', params);
    return { url, key };
  } catch (error) {
    throw error;
  }
};

// @desc    Get S3 upload URL
// @route   POST /api/products/upload-url
// @access  Private/Manager
const getUploadUrl = async (req, res) => {
  try {
    const { fileType, fileName } = req.body;
    
    if (!fileType || !fileName) {
      return sendResponse(res, 400, 'fail', 'File type and name are required');
    }
    
    const { url, key } = await generatePresignedUrl(fileType, fileName);
    
    return sendResponse(res, 200, 'success', 'Upload URL generated', {
      uploadUrl: url,
      imageUrl: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`
    });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Manager
const createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, tags, isAvailable } = req.body;
    
    // Verify category exists and belongs to manager's restaurant
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return sendResponse(res, 404, 'fail', 'Category not found');
    }
    
    // Check if category is from any of manager's menus
    const isCategoryValid = categoryDoc.menus.some(menu => 
      menu.toString() === req.user.restaurantId.toString()
    );
    
    if (!isCategoryValid) {
      return sendResponse(res, 403, 'fail', 'Category does not belong to your restaurant');
    }
    
    // Create product with restaurant and creator info
    const product = await Product.create({
      name,
      description,
      price,
      imageUrl,
      category,
      tags: tags || [],
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      createdBy: req.user._id,
      restaurant: req.user.restaurantId
    });
    
    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('tags', 'name');
    
    return sendResponse(res, 201, 'success', 'Product created successfully', { product: populatedProduct });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get all products (with filtering)
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const { category, tag, search, minPrice, maxPrice } = req.query;
    
    // Build query based on filters
    const query = {};
    
    // For managers, only show their restaurant's products
    if (req.user.role === 'manager' || req.user.role === 'staff') {
      query.restaurant = req.user.restaurantId;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }
    
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('tags', 'name')
      .sort('name');
    
    return sendResponse(res, 200, 'success', 'Products retrieved successfully', { products });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('tags', 'name')
      .populate('createdBy', 'firstName lastName');
    
    if (!product) {
      return sendResponse(res, 404, 'fail', 'Product not found');
    }
    
    // For manager, check if product belongs to their restaurant
    if ((req.user.role === 'manager' || req.user.role === 'staff') && 
        product.restaurant.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'Access denied');
    }
    
    return sendResponse(res, 200, 'success', 'Product retrieved successfully', { product });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Manager
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, tags, isAvailable } = req.body;
    
    // Find product
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return sendResponse(res, 404, 'fail', 'Product not found');
    }
    
    // Check if manager owns this product
    if (product.restaurant.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'You can only update products from your restaurant');
    }
    
    // If category is being updated, verify it exists and belongs to manager's restaurant
    if (category && category !== product.category.toString()) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return sendResponse(res, 404, 'fail', 'Category not found');
      }
      
      const isCategoryValid = categoryDoc.menus.some(menu => 
        menu.toString() === req.user.restaurantId.toString()
      );
      
      if (!isCategoryValid) {
        return sendResponse(res, 403, 'fail', 'Category does not belong to your restaurant');
      }
    }
    
    // Update product
    product.name = name || product.name;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? price : product.price;
    product.imageUrl = imageUrl || product.imageUrl;
    product.category = category || product.category;
    product.tags = tags || product.tags;
    product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;
    
    await product.save();
    
    const updatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('tags', 'name');
    
    return sendResponse(res, 200, 'success', 'Product updated successfully', { product: updatedProduct });
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Manager
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return sendResponse(res, 404, 'fail', 'Product not found');
    }
    
    // Check if manager owns this product
    if (product.restaurant.toString() !== req.user.restaurantId.toString()) {
      return sendResponse(res, 403, 'fail', 'You can only delete products from your restaurant');
    }
    
    // If there's an image on S3, delete it
    if (product.imageUrl && product.imageUrl.includes('amazonaws.com')) {
      const key = product.imageUrl.split('.com/')[1];
      
      const deleteParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
      };
      
      try {
        await s3.deleteObject(deleteParams).promise();
      } catch (s3Error) {
        console.error('Error deleting S3 image:', s3Error);
        // Continue with product deletion even if S3 deletion fails
      }
    }
    
    await product.deleteOne();
    
    return sendResponse(res, 200, 'success', 'Product deleted successfully');
  } catch (error) {
    return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
  }
};

module.exports = {
  getUploadUrl,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};