import { LogOut } from 'lucide-react'
import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'

const ProfileMenu: React.FC = () => {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (!user) {
    return null
  }

  const getInitials = () => {
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email?.charAt(0).toUpperCase() || 'U'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-6 w-6 rounded-full"
          style={{ width: '20px', height: '20px' }}
        >
          <Avatar className="h-6 w-6" style={{ width: '20px', height: '20px' }}>
            <AvatarImage
              src={user.photoURL || undefined}
              alt={user.displayName || 'User avatar'}
              onError={() => {
                // Silently handle avatar load failures - this is common with Google profile pictures
                // due to rate limiting (429 errors) and CORS restrictions
              }}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileMenu
