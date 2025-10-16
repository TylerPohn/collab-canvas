import {
  AccountTree,
  Close,
  ContentCopy,
  Download,
  Refresh
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import { mermaidRenderer } from '../lib/mermaid/renderer'

interface MermaidImportDialogProps {
  open: boolean
  onClose: () => void
  onImport: (mermaidCode: string, diagramType: string) => void
}

const MermaidImportDialog: React.FC<MermaidImportDialogProps> = ({
  open,
  onClose,
  onImport
}) => {
  const theme = useTheme()
  const [mermaidCode, setMermaidCode] = useState('')
  const [previewSvg, setPreviewSvg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [diagramType, setDiagramType] = useState<string>('')

  // Sample Mermaid code for initial state
  const sampleCode = `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`

  // Initialize with sample code when dialog opens
  useEffect(() => {
    if (open && !mermaidCode) {
      setMermaidCode(sampleCode)
    }
  }, [open, mermaidCode, sampleCode])

  // Render preview when code changes
  const renderPreview = useCallback(async (code: string) => {
    if (!code.trim()) {
      setPreviewSvg(null)
      setError(null)
      setDiagramType('')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const result = await mermaidRenderer.renderDiagram(code)
      setPreviewSvg(result.svg)
      setDiagramType(result.diagramType)
    } catch (err: unknown) {
      console.error('Failed to render Mermaid diagram:', err)
      setError('Failed to render diagram')
      setPreviewSvg(null)
      setDiagramType('')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced preview rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      renderPreview(mermaidCode)
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [mermaidCode, renderPreview])

  const handleImport = () => {
    if (mermaidCode.trim() && !error) {
      onImport(mermaidCode.trim(), diagramType)
      handleClose()
    }
  }

  const handleClose = () => {
    setMermaidCode('')
    setPreviewSvg(null)
    setError(null)
    setDiagramType('')
    onClose()
  }

  const handleUseTemplate = (templateCode: string) => {
    setMermaidCode(templateCode)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mermaidCode)
  }

  const handleDownloadSvg = () => {
    if (previewSvg) {
      const blob = new Blob([previewSvg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `mermaid-diagram-${Date.now()}.svg`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const templates = mermaidRenderer.getTemplates()

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountTree sx={{ color: 'primary.main' }} />
          <Typography variant="h6" component="div">
            Import Mermaid Diagram
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Stack direction="row" sx={{ height: '100%' }}>
          {/* Left Panel - Code Input */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              borderRight: `1px solid ${theme.palette.divider}`
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Mermaid Code
                </Typography>
                <TextField
                  multiline
                  fullWidth
                  rows={12}
                  value={mermaidCode}
                  onChange={e => setMermaidCode(e.target.value)}
                  placeholder="Enter your Mermaid diagram code here..."
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Box>

              {/* Templates */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Quick Templates
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {Object.entries(templates).map(([name, code]) => (
                    <Button
                      key={name}
                      size="small"
                      variant="outlined"
                      onClick={() => handleUseTemplate(code)}
                      sx={{ textTransform: 'capitalize', mb: 1 }}
                    >
                      {name}
                    </Button>
                  ))}
                </Stack>
              </Box>

              {/* Actions */}
              <Stack direction="row" spacing={1}>
                <Button
                  startIcon={<ContentCopy />}
                  onClick={handleCopyCode}
                  disabled={!mermaidCode.trim()}
                  size="small"
                >
                  Copy Code
                </Button>
                <Button
                  startIcon={<Refresh />}
                  onClick={() => renderPreview(mermaidCode)}
                  disabled={!mermaidCode.trim() || isLoading}
                  size="small"
                >
                  Refresh Preview
                </Button>
              </Stack>
            </Stack>
          </Box>

          {/* Right Panel - Preview */}
          <Box sx={{ flex: 1, p: 3 }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Preview
                  {diagramType && (
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ ml: 1, color: 'text.secondary' }}
                    >
                      ({diagramType})
                    </Typography>
                  )}
                </Typography>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 300,
                  p: 2,
                  backgroundColor: theme.palette.grey[50]
                }}
              >
                {isLoading ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Rendering diagram...
                    </Typography>
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ width: '100%' }}>
                    <Typography variant="body2">{error}</Typography>
                  </Alert>
                ) : previewSvg ? (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '& svg': {
                        maxWidth: '100%',
                        maxHeight: '100%',
                        height: 'auto'
                      }
                    }}
                    dangerouslySetInnerHTML={{ __html: previewSvg }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <AccountTree
                      sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Enter Mermaid code to see preview
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Preview Actions */}
              {previewSvg && (
                <Stack direction="row" spacing={1}>
                  <Button
                    startIcon={<Download />}
                    onClick={handleDownloadSvg}
                    size="small"
                    variant="outlined"
                  >
                    Download SVG
                  </Button>
                </Stack>
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!mermaidCode.trim() || !!error || isLoading}
          startIcon={<AccountTree />}
        >
          Import to Canvas
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MermaidImportDialog
