import { Router } from 'express';
import { supportController } from '../../controllers/support.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireActiveAccount } from '../../middlewares/rbac.middleware.js';

const router = Router();

// All support routes require authentication
router.use(requireAuth, requireActiveAccount);

// List customer conversations
router.get('/conversations', supportController.listConversations);

// Create a new conversation
router.post('/conversations', supportController.createConversation);

// Get specific conversation with messages
router.get('/conversations/:conversationId', supportController.getConversation);

// Send a message in a conversation
router.post('/conversations/:conversationId/messages', supportController.sendMessage);

// Close a conversation
router.patch('/conversations/:conversationId/close', supportController.closeConversation);

export default router;
