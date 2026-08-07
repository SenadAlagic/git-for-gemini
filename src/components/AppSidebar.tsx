import {
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui";
import { useEngineContext } from "@/context/EngineContext";
import type { Branch, Conversation } from "@/hooks/useEngine";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  isActive?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

type SidebarData = {
  logo: {
    src: string;
    alt: string;
    title: string;
    description: string;
  };
  navGroups: NavGroup[];
  footerGroup: NavGroup;
};

const sidebarData: SidebarData = {
  logo: {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg",
    alt: "git-for-gemini",
    title: "Git-for-Gemini",
    description: "Branch it off",
  },
  navGroups: [
    {
      title: "Conversations",
      items: [
        {
          label: "Rice recipes",
          icon: LayoutDashboard,
          href: "#",
          isActive: true,
        },
        { label: "Gym plan", icon: ClipboardList, href: "#" },
      ],
    },
    {
      title: "Branches",
      items: [
        {
          label: "Non-vegetarian kind",
          icon: LayoutDashboard,
          href: "#",
          isActive: true,
        },
        { label: "Vegeterian kind", icon: ClipboardList, href: "#" },
      ],
    },
  ],
  footerGroup: {
    title: "Support",
    items: [
      { label: "Settings", icon: Settings, href: "#" },
      { label: "About", icon: HelpCircle, href: "#" },
    ],
  },
};

const SidebarLogo = ({ logo }: { logo: SidebarData["logo"] }) => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-primary">
            <img
              src={logo.src}
              alt={logo.alt}
              className="size-6 text-primary-foreground invert dark:invert-0"
            />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium">{logo.title}</span>
            <span className="text-xs text-muted-foreground">
              {logo.description}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

type SidebarSectionProps = {
  label: string;
  items: Record<string, Branch | Conversation>;
  activeId: string;
  onClick: (itemId: Branch | Conversation) => void;
};

const SidebarSection = ({
  label,
  items,
  activeId,
  onClick,
}: SidebarSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {Object.entries(items).map(([id, item]) => (
            <SidebarMenuItem key={id}>
              <SidebarMenuButton
                isActive={activeId === id}
                onClick={() => onClick(item)}
              >
                {item.name}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const {
    conversations,
    branches,
    activeConversationId,
    activeBranchId,
    checkoutBranch,
    checkoutConversation,
  } = useEngineContext();

  return (
    <Sidebar {...props}>
      <SidebarHeader className={cn("flex flex-row  items-center")}>
        <SidebarLogo logo={sidebarData.logo} />
        <ModeToggle />
      </SidebarHeader>
      <SidebarContent>
        <SidebarSection
          label="Conversations"
          items={conversations}
          activeId={activeConversationId}
          onClick={(item) => checkoutConversation(item.id)}
        />
        <SidebarSection
          label="Branches"
          items={branches}
          activeId={activeBranchId}
          onClick={(item) => checkoutBranch(item.name)}
        />
      </SidebarContent>
      {/* <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel>{sidebarData.footerGroup.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarData.footerGroup.items.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <a href={item.href}>{item.label}</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
};
