import {
  AccountCircle as AccountCircleIcon,
  Login as LoginIcon
} from '@mui/icons-material'
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

interface GuestUserBannerProps {
  guestName: string
}

const GuestUserBanner: React.FC<GuestUserBannerProps> = ({ guestName }) => {
  const theme = useTheme()
  const navigate = useNavigate()

  const handleSignUp = () => {
    navigate('/login')
  }

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: 0,
        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`,
        borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
        backdropFilter: 'blur(10px)'
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
            px: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main
              }}
            >
              <AccountCircleIcon />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                Guest Mode
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You're using guest mode as <strong>{guestName}</strong>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Sign up to save your work!
            </Typography>
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={handleSignUp}
              size="small"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                }
              }}
            >
              Sign Up
            </Button>
          </Box>
        </Box>
      </Container>
    </Paper>
  )
}

export default GuestUserBanner

