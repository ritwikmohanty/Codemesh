import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconTrophy,
  IconCalendarEvent,
  IconHome,
  IconFileStarFilled
} from "@tabler/icons-react"
import { NavMain } from "@/components/sidebar/nav-main"
import { NavSecondary } from "@/components/sidebar/nav-secondary"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/sidebar/site-header"
import SearchUsersModal from "@/components/SearchUsersModal"
import LogoLight from '/Logof.png';
import LogoDark from '/Logod.png';
import { Link } from "react-router-dom"

// Custom hook to detect theme changes
const useTheme = () => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const checkTheme = () => {
      if (typeof window !== "undefined") {
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);
      }
    };

    checkTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });

    if (typeof window !== "undefined") {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    return () => observer.disconnect();
  }, []);

  return isDark;
};

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: IconHome,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: IconCalendarEvent,
    },
    {
      title: "Portfolio",
      url: "/portfolio",
      icon: IconFileStarFilled,
    },
    {
      title: "Leaderboard",
      url: "/leaderboard",
      icon: IconTrophy,
    },
    {
      title: "Practice",
      url: "#",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ children, ...props }) {
  const isDarkTheme = useTheme();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  // Handle Ctrl+K keyboard shortcut
  React.useEffect(() => {
    const handleKeydown = (e) => {
      // Ctrl+K or Cmd+K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  // Create nav secondary items with search handler
  const navSecondaryWithHandlers = data.navSecondary.map(item => {
    if (item.title === "Search") {
      return {
        ...item,
        onClick: () => setIsSearchOpen(true)
      };
    }
    return item;
  });

  return (
    <>
      <SearchUsersModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
      <SidebarProvider 
    style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } 
      }>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5 hover:bg-transparent"
              >
                <Link to="/" className="flex items-center ">
                  <img
                    src={isDarkTheme ? LogoDark : LogoLight}
                    alt="CodeMesh"
                    className="!size-6 object-contain rounded transition-opacity duration-200"
                  />
                  <span className="text-base font-semibold">CodeMesh</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />

          <NavSecondary items={navSecondaryWithHandlers} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
    </>
  )
}
