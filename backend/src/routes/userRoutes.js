// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', authorizeRoles('COMPANY ADMIN'), createUser);
router.put('/:id', authorizeRoles('COMPANY ADMIN'), updateUser);
router.delete('/:id', authorizeRoles('COMPANY ADMIN'), deleteUser);

module.exports = router;
