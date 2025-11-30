import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from '../../contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import SignIn from '../signin'
import SignUp from '../signup'
import ThemeToggleButton from "@/components/ui/theme-toggle-button"

export function SiteHeader() {
  const navigate = useNavigate()
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const [isSignUpDialogOpen, setIsSignUpDialogOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const handleProfileClick = () => {
    navigate('/portfolio')
  }

  const handleSettingsClick = () => {
    navigate('/settings')
  }

  return (
    <header className="flex h-[--header-height] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        
        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated && user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-muted transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.avatarUrl} 
                        alt={user.name}
                      />
                      <AvatarFallback username={user.username} />
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileClick}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettingsClick}>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ThemeToggleButton showLabel variant="circle-blur" start="top-right" />
            </>
          ) : (
            <>
              <SignIn 
                isDialogOpen={isSignInDialogOpen} 
                onOpenChange={setIsSignInDialogOpen}
                stayOnCurrentPage={true}
              >
                <button className="px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent bg-transparent text-foreground">
                  Sign In
                </button>
              </SignIn>
              <SignUp 
                isDialogOpen={isSignUpDialogOpen} 
                onOpenChange={setIsSignUpDialogOpen}
                stayOnCurrentPage={true}
              >
                <Button className="h-9 px-3">
                  Get Started
                </Button>
              </SignUp>
              <ThemeToggleButton showLabel variant="circle-blur" start="top-right" />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
