import mermaid from 'mermaid'

export interface MermaidRenderResult {
  svg: string
  diagramType: string
  width: number
  height: number
}

export interface MermaidValidationResult {
  isValid: boolean
  error?: string
  diagramType?: string
}

export class MermaidRenderer {
  private isInitialized = false

  /**
   * Initialize Mermaid with default configuration
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Arial, sans-serif',
        flowchart: {
          useMaxWidth: false,
          htmlLabels: true
        },
        sequence: {
          useMaxWidth: false
        },
        gantt: {
          useMaxWidth: false
        }
      })
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize Mermaid:', error)
      throw new Error('Failed to initialize Mermaid renderer')
    }
  }

  /**
   * Validate Mermaid code syntax
   */
  validateMermaidCode(code: string): MermaidValidationResult {
    if (!code || code.trim().length === 0) {
      return {
        isValid: false,
        error: 'Mermaid code cannot be empty'
      }
    }

    // Basic syntax checks
    const trimmedCode = code.trim()

    // Check for common syntax issues
    if (
      trimmedCode.includes('-->') &&
      !trimmedCode.match(
        /^\s*(graph|flowchart|sequence|class|state|er|journey|gantt|pie|gitgraph|mindmap|timeline|quadrant|requirement|c4)/i
      )
    ) {
      return {
        isValid: false,
        error:
          'Missing diagram type declaration. Start with "graph", "flowchart", "sequence", etc.'
      }
    }

    // Check for unbalanced brackets
    const openBrackets = (trimmedCode.match(/\[/g) || []).length
    const closeBrackets = (trimmedCode.match(/\]/g) || []).length
    if (openBrackets !== closeBrackets) {
      return {
        isValid: false,
        error: 'Unbalanced brackets in node definitions'
      }
    }

    try {
      const diagramType = this.getDiagramType(code)
      if (diagramType === 'unknown') {
        return {
          isValid: false,
          error:
            'Unknown diagram type. Supported types: flowchart, sequence, class, state, er, journey, gantt, pie, gitgraph, mindmap, timeline, quadrant, requirement, c4'
        }
      }

      return {
        isValid: true,
        diagramType
      }
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid Mermaid syntax'
      }
    }
  }

  /**
   * Detect diagram type from Mermaid code
   */
  getDiagramType(code: string): string {
    const trimmedCode = code.trim().toLowerCase()

    if (
      trimmedCode.startsWith('graph') ||
      trimmedCode.startsWith('flowchart')
    ) {
      return 'flowchart'
    }
    if (trimmedCode.startsWith('sequence')) {
      return 'sequence'
    }
    if (trimmedCode.startsWith('class')) {
      return 'class'
    }
    if (trimmedCode.startsWith('state')) {
      return 'state'
    }
    if (trimmedCode.startsWith('er')) {
      return 'er'
    }
    if (trimmedCode.startsWith('journey')) {
      return 'journey'
    }
    if (trimmedCode.startsWith('gantt')) {
      return 'gantt'
    }
    if (trimmedCode.startsWith('pie')) {
      return 'pie'
    }
    if (trimmedCode.startsWith('gitgraph')) {
      return 'gitgraph'
    }
    if (trimmedCode.startsWith('mindmap')) {
      return 'mindmap'
    }
    if (trimmedCode.startsWith('timeline')) {
      return 'timeline'
    }
    if (trimmedCode.startsWith('quadrant')) {
      return 'quadrant'
    }
    if (trimmedCode.startsWith('requirement')) {
      return 'requirement'
    }
    if (trimmedCode.startsWith('c4')) {
      return 'c4'
    }

    return 'unknown'
  }

  /**
   * Render Mermaid code to SVG
   */
  async renderDiagram(code: string): Promise<MermaidRenderResult> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const validation = this.validateMermaidCode(code)
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid Mermaid code')
    }

    try {
      // Generate a unique ID for this diagram
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Render the diagram
      const { svg } = await mermaid.render(id, code)

      // Extract dimensions from SVG
      const dimensions = this.extractSvgDimensions(svg)

      return {
        svg,
        diagramType: validation.diagramType || 'unknown',
        width: dimensions.width,
        height: dimensions.height
      }
    } catch (error) {
      console.error('Mermaid rendering error:', error)

      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to render Mermaid diagram'

      if (error instanceof Error) {
        const message = error.message.toLowerCase()

        // Common Mermaid syntax errors
        if (
          message.includes('parse error') ||
          message.includes('syntax error')
        ) {
          errorMessage = `Syntax Error: ${error.message}`
        } else if (message.includes('unknown diagram type')) {
          errorMessage = `Unknown diagram type. Supported types: flowchart, sequence, class, state, er, journey, gantt, pie, gitgraph, mindmap, timeline, quadrant, requirement, c4`
        } else if (message.includes('invalid') && message.includes('arrow')) {
          errorMessage = `Invalid arrow syntax: ${error.message}`
        } else if (message.includes('node') && message.includes('not found')) {
          errorMessage = `Node reference error: ${error.message}`
        } else if (message.includes('theme') || message.includes('config')) {
          errorMessage = `Configuration error: ${error.message}`
        } else {
          errorMessage = `Rendering error: ${error.message}`
        }
      }

      throw new Error(errorMessage)
    }
  }

  /**
   * Extract width and height from SVG string
   */
  private extractSvgDimensions(svg: string): { width: number; height: number } {
    try {
      // Parse SVG to extract viewBox or width/height
      const viewBoxMatch = svg.match(/viewBox="([^"]*)"/)
      const widthMatch = svg.match(/width="([^"]*)"/)
      const heightMatch = svg.match(/height="([^"]*)"/)

      if (viewBoxMatch) {
        const [, viewBox] = viewBoxMatch
        const [, , width, height] = viewBox.split(/\s+/).map(Number)
        return { width: width || 400, height: height || 300 }
      }

      if (widthMatch && heightMatch) {
        const width = parseFloat(widthMatch[1]) || 400
        const height = parseFloat(heightMatch[1]) || 300
        return { width, height }
      }

      // Default dimensions if we can't parse
      return { width: 400, height: 300 }
    } catch (error) {
      console.warn('Failed to extract SVG dimensions:', error)
      return { width: 400, height: 300 }
    }
  }

  /**
   * Get common Mermaid diagram templates
   */
  getTemplates(): Record<string, string> {
    return {
      flowchart: `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,

      sequence: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob, how are you?
    B-->>A: Great!
    A-)B: See you later!`,

      class: `classDiagram
    class Animal {
        +String name
        +int age
        +eat()
        +sleep()
    }
    class Dog {
        +bark()
    }
    Animal <|-- Dog`,

      state: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`,

      er: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`,

      gantt: `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2014-01-12  , 12d
    another task      : 24d`,

      pie: `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`
    }
  }
}

// Export singleton instance
export const mermaidRenderer = new MermaidRenderer()
