const { z } = require('zod');

const submitQuestionnaireSchema = z.object({
  profile: z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(100),
    avatar: z.string().optional()
  }),
  responses: z.record(z.any())
});

const updateMindMapSchema = z.object({
  data: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any())
  })
});

module.exports = { submitQuestionnaireSchema, updateMindMapSchema };
