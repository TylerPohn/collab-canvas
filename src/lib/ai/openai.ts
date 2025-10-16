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
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content:
                  'You are an AI assistant that helps users create and manipulate shapes on a collaborative canvas. You can execute various commands to create shapes, text, forms, and layouts.'
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
          })
        }
      )

      if (!response.ok) {
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`
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
