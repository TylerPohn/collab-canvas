// Simple test file to verify Mermaid renderer functionality
// This can be removed after testing

import { mermaidRenderer } from './renderer'

export async function testMermaidRenderer() {
  console.log('Testing Mermaid Renderer...')

  try {
    // Test initialization
    await mermaidRenderer.initialize()
    console.log('✅ Mermaid renderer initialized successfully')

    // Test validation
    const validCode = `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`

    const validation = mermaidRenderer.validateMermaidCode(validCode)
    console.log('✅ Validation test:', validation)

    // Test diagram type detection
    const diagramType = mermaidRenderer.getDiagramType(validCode)
    console.log('✅ Diagram type detection:', diagramType)

    // Test rendering
    const result = await mermaidRenderer.renderDiagram(validCode)
    console.log('✅ Rendering test successful:', {
      diagramType: result.diagramType,
      width: result.width,
      height: result.height,
      svgLength: result.svg.length
    })

    // Test templates
    const templates = mermaidRenderer.getTemplates()
    console.log('✅ Templates available:', Object.keys(templates))

    return true
  } catch (error) {
    console.error('❌ Mermaid renderer test failed:', error)
    return false
  }
}

// Uncomment to run test
// testMermaidRenderer()
