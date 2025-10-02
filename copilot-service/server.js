const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'N8N AI Copilot Service' });
});

// Generate workflow from natural language prompt
app.post('/api/generate-workflow', async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Create system prompt for workflow generation
    const systemPrompt = `You are an AI assistant specialized in generating N8N workflow configurations. 
Your task is to convert natural language descriptions into valid N8N workflow JSON.
Generate a complete workflow structure with nodes, connections, and settings.
Ensure all node types are valid N8N node types.
Include proper node positioning for visual layout.
Return ONLY valid JSON without any markdown formatting or additional text.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate an N8N workflow for: ${prompt}${context ? `\n\nAdditional context: ${context}` : ''}` }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const workflowData = completion.choices[0].message.content;

    // Try to parse as JSON
    let workflow;
    try {
      workflow = JSON.parse(workflowData);
    } catch (parseError) {
      // If parsing fails, return raw content with warning
      return res.json({
        workflow: workflowData,
        warning: 'Generated content may not be valid JSON',
        raw: true
      });
    }

    res.json({
      workflow,
      prompt,
      generated: true
    });
  } catch (error) {
    console.error('Error generating workflow:', error);
    res.status(500).json({
      error: 'Failed to generate workflow',
      message: error.message
    });
  }
});

// Suggest workflow improvements
app.post('/api/improve-workflow', async (req, res) => {
  try {
    const { workflow, improvement } = req.body;

    if (!workflow || !improvement) {
      return res.status(400).json({ error: 'Workflow and improvement description are required' });
    }

    const systemPrompt = `You are an AI assistant specialized in optimizing N8N workflows. 
Analyze the provided workflow and suggest improvements based on the user's request.
Return a modified workflow JSON with the improvements applied.
Ensure the workflow remains valid and functional.
Return ONLY valid JSON without any markdown formatting or additional text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Current workflow: ${JSON.stringify(workflow)}\n\nImprovement request: ${improvement}` }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const improvedWorkflow = JSON.parse(completion.choices[0].message.content);

    res.json({
      workflow: improvedWorkflow,
      original: workflow,
      improvement,
      success: true
    });
  } catch (error) {
    console.error('Error improving workflow:', error);
    res.status(500).json({
      error: 'Failed to improve workflow',
      message: error.message
    });
  }
});

// Explain workflow functionality
app.post('/api/explain-workflow', async (req, res) => {
  try {
    const { workflow } = req.body;

    if (!workflow) {
      return res.status(400).json({ error: 'Workflow is required' });
    }

    const systemPrompt = `You are an AI assistant that explains N8N workflows in clear, simple language.
Analyze the workflow structure and provide a human-readable explanation of what it does.
Explain each major step and how the nodes work together.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Explain this N8N workflow: ${JSON.stringify(workflow)}` }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const explanation = completion.choices[0].message.content;

    res.json({
      explanation,
      workflow,
      success: true
    });
  } catch (error) {
    console.error('Error explaining workflow:', error);
    res.status(500).json({
      error: 'Failed to explain workflow',
      message: error.message
    });
  }
});

// Validate workflow structure
app.post('/api/validate-workflow', async (req, res) => {
  try {
    const { workflow } = req.body;

    if (!workflow) {
      return res.status(400).json({ error: 'Workflow is required' });
    }

    // Basic validation
    const issues = [];

    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      issues.push('Workflow must have a nodes array');
    }

    if (!workflow.connections || typeof workflow.connections !== 'object') {
      issues.push('Workflow must have a connections object');
    }

    if (workflow.nodes) {
      workflow.nodes.forEach((node, index) => {
        if (!node.type) {
          issues.push(`Node at index ${index} is missing a type`);
        }
        if (!node.name) {
          issues.push(`Node at index ${index} is missing a name`);
        }
      });
    }

    res.json({
      valid: issues.length === 0,
      issues,
      workflow
    });
  } catch (error) {
    console.error('Error validating workflow:', error);
    res.status(500).json({
      error: 'Failed to validate workflow',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`N8N AI Copilot Service running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

module.exports = app;
