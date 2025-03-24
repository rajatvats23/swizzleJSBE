// controllers/categoryController.js
const Category = require('../models/categoryModel');
const Menu = require('../models/menuModel');

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

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Manager
const createCategory = async (req, res) => {
    try {
        const { name, description, order, menus } = req.body;

        // Create category
        const category = await Category.create({
            name,
            description,
            order: order || 0,
            menus: menus || [],
            createdBy: req.user._id
        });

        return sendResponse(res, 201, 'success', 'Category created successfully', { category });
    } catch (error) {
        return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
    }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        let categories;

        // For managers and staff, only show categories related to their restaurant
        if (req.user.role === 'manager' || req.user.role === 'staff') {
            const restaurantId = req.user.restaurantId;
            if (!restaurantId) {
                return sendResponse(res, 403, 'fail', 'Access denied: No restaurant assigned');
            }

            const restaurantMenus = await Menu.find({ restaurantId });
            const menuIds = restaurantMenus.map(menu => menu._id);

            categories = await Category.find({ menus: { $in: menuIds } })
                .populate('menus', 'name')
                .populate('createdBy', 'firstName lastName')
                .sort({ order: 1 });
        }
        // For superadmin and admin, show all categories
        else if (req.user.role === 'superadmin' || req.user.role === 'admin') {
            categories = await Category.find()
                .populate('menus', 'name')
                .populate('createdBy', 'firstName lastName')
                .sort({ order: 1 });
        }
        else {
            return sendResponse(res, 403, 'fail', 'Access denied');
        }

        return sendResponse(res, 200, 'success', 'Categories retrieved successfully', { categories });
    } catch (error) {
        return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
    }
};


// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Private
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('menus', 'name')
            .populate('createdBy', 'firstName lastName');

        if (!category) {
            return sendResponse(res, 404, 'fail', 'Category not found');
        }

        return sendResponse(res, 200, 'success', 'Category retrieved successfully', { category });
    } catch (error) {
        return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Manager
const updateCategory = async (req, res) => {
    try {
        const { name, description, order, menus } = req.body;

        const category = await Category.findById(req.params.id);

        if (!category) {
            return sendResponse(res, 404, 'fail', 'Category not found');
        }

        // Update fields
        category.name = name || category.name;
        category.description = description !== undefined ? description : category.description;
        category.order = order !== undefined ? order : category.order;

        // Only update menus if provided
        if (menus) {
            category.menus = menus;
        }

        const updatedCategory = await category.save();

        return sendResponse(res, 200, 'success', 'Category updated successfully', {
            category: await Category.findById(updatedCategory._id)
                .populate('menus', 'name')
                .populate('createdBy', 'firstName lastName')
        });
    } catch (error) {
        return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Manager
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return sendResponse(res, 404, 'fail', 'Category not found');
        }

        await category.deleteOne();

        return sendResponse(res, 200, 'success', 'Category deleted successfully');
    } catch (error) {
        return sendResponse(res, 500, 'error', 'Server error', { error: error.message });
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};