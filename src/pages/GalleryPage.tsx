import {
  Public as PublicIcon,
  Search as SearchIcon,
  Sort as SortIcon
} from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Container,
  Fade,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { useCallback, useEffect, useState } from 'react'
import CanvasCard from '../components/CanvasCard'
import EmptyGallery from '../components/EmptyGallery'
import { getPublicCanvases } from '../lib/firebase/firestore'
import type { CanvasListItem } from '../lib/types'

type SortOption = 'recent' | 'name' | 'popular'

const GalleryPage: React.FC = () => {
  const theme = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null)

  // Get public canvases
  const {
    data: publicCanvases = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['public-canvases'],
    queryFn: getPublicCanvases,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      console.log(
        `🔄 [GalleryPage] Query retry ${failureCount}/3, error:`,
        error
      )
      return failureCount < 3
    }
  })

  // Filter and sort canvases
  const filteredCanvases = (publicCanvases as any[])
    .filter(
      (canvas: any) =>
        canvas.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        canvas.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        canvas.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'popular':
          // Sort by number of people who have accessed (accessedBy length)
          // For now, just use lastModified as a proxy
          return b.lastModified - a.lastModified
        case 'recent':
        default:
          return b.lastModified - a.lastModified
      }
    })

  const handleCanvasEdit = useCallback((canvas: CanvasListItem) => {
    // Gallery doesn't support editing
    console.log('View canvas:', canvas.id)
  }, [])

  const handleCanvasDelete = useCallback((canvas: CanvasListItem) => {
    // Gallery doesn't support deleting
    console.log('View canvas:', canvas.id)
  }, [])

  const handleCanvasShare = useCallback((canvas: CanvasListItem) => {
    // TODO: Open share dialog
    console.log('Share canvas:', canvas.id)
  }, [])

  const handleSortChange = useCallback((option: SortOption) => {
    setSortBy(option)
    setSortAnchorEl(null)
  }, [])

  // Add debugging
  useEffect(() => {
    console.log('🔍 [GalleryPage] Component state:', {
      isLoading,
      error: error?.message,
      publicCanvasesLength: publicCanvases.length,
      publicCanvases
    })
  }, [isLoading, error, publicCanvases])

  const sortOptions = [
    { value: 'recent', label: 'Recently Updated' },
    { value: 'name', label: 'Name' },
    { value: 'popular', label: 'Most Popular' }
  ]

  // Show loading state
  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Loading public canvases...
          </Typography>
        </Box>
      </Container>
    )
  }

  // Show error state
  if (error) {
    console.error('❌ [GalleryPage] Error loading public canvases:', error)
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error">
            Failed to load public canvases
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Error: {error.message}
          </Typography>
          <Button onClick={() => refetch()} sx={{ mt: 2 }}>
            Try Again
          </Button>
        </Box>
      </Container>
    )
  }

  // Show empty state
  if ((publicCanvases as any[]).length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <EmptyGallery />
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PublicIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Public Gallery
              </Typography>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Discover amazing canvases created by the community. Click any
                canvas to explore and collaborate.
              </Typography>
            </Paper>

            {/* Search and controls */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                flexWrap: 'wrap',
                mt: 3
              }}
            >
              <TextField
                placeholder="Search public canvases..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                size="small"
                sx={{ minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />

              <IconButton
                onClick={e => setSortAnchorEl(e.currentTarget)}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1
                }}
              >
                <SortIcon />
              </IconButton>

              <Menu
                anchorEl={sortAnchorEl}
                open={Boolean(sortAnchorEl)}
                onClose={() => setSortAnchorEl(null)}
              >
                {sortOptions.map(option => (
                  <MenuItem
                    key={option.value}
                    onClick={() => handleSortChange(option.value as SortOption)}
                    selected={sortBy === option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>

              <Box sx={{ flex: 1 }} />

              <Typography variant="body2" color="text.secondary">
                {filteredCanvases.length} canvas
                {filteredCanvases.length !== 1 ? 'es' : ''}
              </Typography>
            </Box>
          </Box>

          {/* Canvas grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 3
            }}
          >
            {filteredCanvases.map((canvas: any) => (
              <Box key={canvas.id}>
                <CanvasCard
                  canvas={canvas}
                  onEdit={handleCanvasEdit}
                  onDelete={handleCanvasDelete}
                  onShare={handleCanvasShare}
                  showOwner={true}
                />
              </Box>
            ))}
          </Box>

          {/* No results */}
          {filteredCanvases.length === 0 && searchQuery && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No public canvases found matching "{searchQuery}"
              </Typography>
              <Button onClick={() => setSearchQuery('')} sx={{ mt: 2 }}>
                Clear Search
              </Button>
            </Box>
          )}
        </Box>
      </Fade>
    </Container>
  )
}

export default GalleryPage
