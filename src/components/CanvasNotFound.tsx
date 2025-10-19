import { Home as HomeIcon, Search as SearchIcon } from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Container,
  Paper,
  Typography,
  useTheme
} from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const CanvasNotFound: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  const handleGoToGallery = () => {
    navigate('/gallery')
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: 8,
          textAlign: 'center',
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.95)})`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4
          }}
        >
          <Box
            sx={{
              p: 3,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)}, ${alpha(theme.palette.error.main, 0.05)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SearchIcon sx={{ fontSize: 48, color: 'error.main' }} />
          </Box>
        </Box>

        {/* Content */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: 'text.primary'
          }}
        >
          Canvas Not Found
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
        >
          The canvas you're looking for doesn't exist or has been removed. It
          might have been deleted or the link might be incorrect.
        </Typography>

        {/* Actions */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={handleGoToDashboard}
            sx={{
              px: 4,
              py: 2,
              borderRadius: 3,
              fontSize: '1rem',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
              }
            }}
          >
            Go to Dashboard
          </Button>

          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={handleGoToGallery}
            sx={{
              px: 4,
              py: 2,
              borderRadius: 3,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            Browse Gallery
          </Button>
        </Box>

        {/* Help text */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 4, opacity: 0.8 }}
        >
          If you believe this is an error, please check the URL or contact
          support
        </Typography>
      </Paper>
    </Container>
  )
}

export default CanvasNotFound
