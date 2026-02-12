const { z } = require('zod');

const profileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  avatar: z.string().max(16).optional()
});

const sendMessageSchema = z.object({
  profileId: z.string().min(1),
  profileName: z.string().max(100).optional(),
  profileAvatar: z.string().max(16).optional(),
  content: z.string().min(1).max(500)
});

const receiptSchema = z.object({
  messageId: z.string().min(1),
  profileId: z.string().min(1)
});

module.exports = { profileSchema, sendMessageSchema, receiptSchema };
