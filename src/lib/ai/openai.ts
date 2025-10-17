// OpenAI integration for AI Agent
export class OpenAIService {
  private apiKey: string

  constructor() {
    // In Vite, environment variables must be prefixed with VITE_
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''

    if (!this.apiKey) {
      console.warn('⚠️ OpenAI API key not found. AI features will be limited.')
      console.warn('💡 Set VITE_OPENAI_API_KEY in your .env file')
    }
  }

  async generateResponse(prompt: string, tools?: any[]): Promise<any> {
    if (!this.apiKey) {
      console.warn(
        '⚠️ OpenAI API key not configured. Natural language processing disabled.'
      )
      // Return a mock response for testing
      return {
        choices: [
          {
            message: {
              content:
                'OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.',
              tool_calls: null
            }
          }
        ]
      }
    }

    try {
      const requestBody = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an AI assistant that helps users create and manipulate shapes on a collaborative canvas. You must use the provided tools to execute commands. Always call the appropriate function when a user requests an action. Do not just describe what to do - actually execute the function call.\n\nIMPORTANT: When specifying colors, always use hex color codes (e.g., #FF0000 for red, #00FF00 for green, #0000FF for blue). Do not use named colors like "red", "blue", "green".\n\nFor movement commands:\n1. For directional movements with distance (e.g., "move 300px to the right"), use moveShape and CALCULATE the new position: new_x = current_x + distance\n2. For movements relative to OTHER shapes (e.g., "move to the right of other shapes"), use moveShapeByOthers\n3. Always find the shape first using getCanvasState or findShapes to get current position and shapeId\n4. Do the math: right = +x, left = -x, down = +y, up = -y\n\nFor creation commands with positioning:\n1. For "create X to the right/left/above/below of other shapes", first use getCanvasState or findShapes to locate existing shapes\n2. Then use createShape with calculated position based on existing shapes\n3. Calculate position: right = max_x + spacing, left = min_x - spacing, above = min_y - spacing, below = max_y + spacing'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: tools
          ? tools.map(tool => ({
              type: 'function',
              function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
              }
            }))
          : undefined,
        tool_choice: tools ? 'auto' : undefined,
        temperature: 0.7,
        max_tokens: 1000
      }

      console.log(
        '🤖 OpenAI request body:',
        JSON.stringify(requestBody, null, 2)
      )

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🤖 OpenAI error response:', errorText)
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw error
    }
  }

  async generateResponseWithMessages(
    messages: any[],
    tools?: any[]
  ): Promise<any> {
    if (!this.apiKey) {
      console.warn(
        '⚠️ OpenAI API key not configured. Natural language processing disabled.'
      )
      // Return a mock response for testing
      return {
        choices: [
          {
            message: {
              content:
                'OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.',
              tool_calls: null
            }
          }
        ]
      }
    }

    try {
      const requestBody = {
        model: 'gpt-4o-mini',
        messages: messages,
        tools: tools
          ? tools.map(tool => ({
              type: 'function',
              function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
              }
            }))
          : undefined,
        tool_choice: tools ? 'auto' : undefined,
        temperature: 0.7,
        max_tokens: 1000
      }

      console.log(
        '🤖 OpenAI request body with messages:',
        JSON.stringify(requestBody, null, 2)
      )

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🤖 OpenAI error response:', errorText)
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw error
    }
  }

  async executeFunctionCall(
    functionName: string,
    parameters: any
  ): Promise<any> {
    // This would be called when OpenAI wants to execute a function
    console.log(`🤖 OpenAI wants to execute: ${functionName}`, parameters)

    // For now, we'll return a mock response
    // In a real implementation, this would call the appropriate AI tool
    return {
      success: true,
      result: `Executed ${functionName} with parameters: ${JSON.stringify(parameters)}`
    }
  }
}

// Export a singleton instance
export const openaiService = new OpenAIService()
