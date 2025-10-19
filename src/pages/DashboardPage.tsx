import {
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Sort as SortIcon
} from '@mui/icons-material'
import {
  Box,
  Button,
  Container,
  Fade,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CanvasCard from '../components/CanvasCard'
import CanvasSettingsDialog from '../components/CanvasSettingsDialog'
import EmptyDashboard from '../components/EmptyDashboard'
import { useAuth } from '../hooks/useAuth'
import { useAuthDebug } from '../hooks/useAuthDebug'
// import { useRecentCanvas } from '../hooks/useRecentCanvas' // DISABLED - no longer using auto-redirect
import { getCanvasList } from '../lib/firebase/firestore'
import type { CanvasListItem, CanvasMeta } from '../lib/types'

type SortOption = 'recent' | 'name' | 'modified'

const DashboardPage: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user } = useAuth()
  useAuthDebug() // Add auth debugging
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [selectedCanvas, setSelectedCanvas] = useState<CanvasMeta | null>(null)

  // Get user's canvas list
  const {
    data: canvasList = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['canvas-list', user?.uid],
    queryFn: async () => {
      console.log(
        '🔍 [DashboardPage] Query function called with user:',
        user?.uid
      )
      if (!user?.uid) {
        console.warn('⚠️ [DashboardPage] No user ID provided')
        throw new Error('User not authenticated')
      }

      try {
        const result = await getCanvasList(user.uid)
        console.log('✅ [DashboardPage] Query successful, received:', result)
        return result
      } catch (error) {
        console.error('❌ [DashboardPage] Query failed:', error)
        throw error
      }
    },
    enabled: !!user?.uid,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      console.log(
        `🔄 [DashboardPage] Query retry ${failureCount}/3, error:`,
        error
      )
      return failureCount < 3
    },
    onSuccess: data => {
      console.log('✅ [DashboardPage] Query onSuccess:', data)
    },
    onError: error => {
      console.error('❌ [DashboardPage] Query onError:', error)
    }
  })

  // Get recent canvas for auto-redirect - DISABLED
  // const { recentCanvasId, isLoading: isLoadingRecent } = useRecentCanvas(
  //   user?.uid || ''
  // )

  // Add debugging useEffect
  useEffect(() => {
    console.log('🔍 [DashboardPage] Component state:', {
      user: user?.uid,
      isLoading,
      error: error?.message,
      canvasListLength: canvasList.length,
      canvasList
    })
  }, [user?.uid, isLoading, error, canvasList])

  // Auto-redirect to recent canvas - DISABLED to allow users to see dashboard
  // useEffect(() => {
  //   if (!isLoadingRecent && recentCanvasId && canvasList.length > 0) {
  //     // Small delay to show the redirect message
  //     const timer = setTimeout(() => {
  //       navigate(`/canvas/${recentCanvasId}`)
  //     }, 1500)
  //     return () => clearTimeout(timer)
  //   }
  // }, [recentCanvasId, isLoadingRecent, canvasList.length, navigate])

  // Filter and sort canvases
  const filteredCanvases = canvasList
    .filter(
      canvas =>
        canvas.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        canvas.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'modified':
          return b.lastModified - a.lastModified
        case 'recent':
        default:
          const aTime = a.lastAccessedAt || a.lastModified
          const bTime = b.lastAccessedAt || b.lastModified
          return bTime - aTime
      }
    })

  const handleCreateCanvas = useCallback(() => {
    // Generate new canvas ID
    const canvasId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    navigate(`/canvas/${canvasId}`)
  }, [navigate])

  const handleCanvasEdit = useCallback((canvas: CanvasListItem) => {
    // Convert CanvasListItem to CanvasMeta format for the dialog
    const canvasMeta: CanvasMeta = {
      id: canvas.id,
      name: canvas.name,
      description: canvas.description,
      permissions: {
        ownerId: canvas.ownerId,
        accessType: canvas.accessType,
        password: canvas.hasPassword ? '***' : undefined
      }
    }
    setSelectedCanvas(canvasMeta)
    setSettingsDialogOpen(true)
  }, [])

  const handleCanvasDelete = useCallback((canvas: CanvasListItem) => {
    // TODO: Show delete confirmation dialog
    console.log('Delete canvas:', canvas.id)
  }, [])

  const handleCanvasShare = useCallback((canvas: CanvasListItem) => {
    // TODO: Open share dialog
    console.log('Share canvas:', canvas.id)
  }, [])

  const handleSettingsDialogClose = useCallback(() => {
    setSettingsDialogOpen(false)
    setSelectedCanvas(null)
  }, [])

  const handleSettingsUpdate = useCallback(() => {
    // Refetch canvas list to show updated data
    refetch()
  }, [refetch])

  const handleSortChange = useCallback((option: SortOption) => {
    setSortBy(option)
    setSortAnchorEl(null)
  }, [])

  const sortOptions = [
    { value: 'recent', label: 'Recently Accessed' },
    { value: 'modified', label: 'Last Modified' },
    { value: 'name', label: 'Name' }
  ]

  // Show loading state
  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Loading your canvases...
          </Typography>
        </Box>
      </Container>
    )
  }

  // Show error state
  if (error) {
    console.error('❌ [DashboardPage] Canvas list error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause
    })

    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error">
            Failed to load canvases
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

  // Show redirect message if auto-redirecting - DISABLED
  // if (!isLoadingRecent && recentCanvasId && canvasList.length > 0) {
  //   return (
  //     <Container maxWidth="xl" sx={{ py: 4 }}>
  //       <Box sx={{ textAlign: 'center', py: 8 }}>
  //         <Typography variant="h6" color="primary">
  //           Redirecting to your canvas...
  //         </Typography>
  //       </Box>
  //     </Container>
  //   )
  // }

  // Show empty state
  if (canvasList.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <EmptyDashboard onCreateCanvas={handleCreateCanvas} />
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
              <DashboardIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Dashboard
              </Typography>
            </Box>

            {/* Search and controls */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              <TextField
                placeholder="Search canvases..."
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

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateCanvas}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600
                }}
              >
                Create Canvas
              </Button>
            </Box>
          </Box>

          {/* Canvas grid */}
          <Grid container spacing={3}>
            {filteredCanvases.map(canvas => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={canvas.id}>
                <CanvasCard
                  canvas={canvas}
                  onEdit={handleCanvasEdit}
                  onDelete={handleCanvasDelete}
                  onShare={handleCanvasShare}
                  showOwner={true}
                />
              </Grid>
            ))}
          </Grid>

          {/* No results */}
          {filteredCanvases.length === 0 && searchQuery && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No canvases found matching "{searchQuery}"
              </Typography>
              <Button onClick={() => setSearchQuery('')} sx={{ mt: 2 }}>
                Clear Search
              </Button>
            </Box>
          )}
        </Box>
      </Fade>

      {/* Canvas Settings Dialog */}
      {selectedCanvas && (
        <CanvasSettingsDialog
          open={settingsDialogOpen}
          onClose={handleSettingsDialogClose}
          canvas={selectedCanvas}
          onUpdate={handleSettingsUpdate}
        />
      )}
    </Container>
  )
}

export default DashboardPage
