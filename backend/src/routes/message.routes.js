const express = require('express');
const messageController = require('../controllers/message.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { chatRoomIdParamSchema } = require('../validators/message.validator');

const router = express.Router();

router.use(authenticate);

router.get('/:chatRoomId', validate(chatRoomIdParamSchema), messageController.getChatHistory);

module.exports = router;
