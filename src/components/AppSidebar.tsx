import React from "react";
import {
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  Pencil,
  Settings,
  SquarePen,
  Trash2,
} from "lucide-react";

import {
  Input,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui";
import { Button } from "@/components/ui/Button";
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
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
};

const SidebarSection = ({
  label,
  items,
  activeId,
  onClick,
  onRename,
  onDelete,
}: SidebarSectionProps) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draftName, setDraftName] = React.useState("");
  const [renameError, setRenameError] = React.useState<string | null>(null);

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setDraftName(currentName);
    setRenameError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setRenameError(null);
  };

  const commitRename = (id: string) => {
    if (draftName.trim() === items[id]?.name) {
      cancelEditing();
      return;
    }
    try {
      onRename(id, draftName);
      cancelEditing();
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : "Couldn't rename");
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {Object.entries(items).map(([id, item]) =>
            editingId === id ? (
              <SidebarMenuItem
                key={id}
                className="flex flex-col gap-1 px-2 py-1"
              >
                <Input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename(id);
                    if (e.key === "Escape") cancelEditing();
                  }}
                  onBlur={() => commitRename(id)}
                  className="h-7"
                />
                {renameError && (
                  <span className="px-0.5 text-xs text-destructive">
                    {renameError}
                  </span>
                )}
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem key={id} className={cn("overflow-hidden")}>
                <SidebarMenuButton
                  isActive={activeId === id}
                  onClick={() => onClick(item)}
                >
                  <span className="truncate w-[85%]">{item.name}</span>
                </SidebarMenuButton>
                <SidebarMenuAction
                  showOnHover
                  className="right-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(id, item.name);
                  }}
                >
                  <Pencil />
                  <span className="sr-only">Rename</span>
                </SidebarMenuAction>
                <SidebarMenuAction
                  showOnHover
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                  }}
                >
                  <Trash2 />
                  <span className="sr-only">Delete</span>
                </SidebarMenuAction>
              </SidebarMenuItem>
            ),
          )}
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
    addConversation,
    renameConversation,
    renameBranch,
    deleteConversation,
    deleteBranch,
  } = useEngineContext();

  const branchesForActiveConversation = activeConversationId
    ? Object.fromEntries(
        Object.entries(branches).filter(
          ([, branch]) => branch.conversationId === activeConversationId,
        ),
      )
    : {};

  const handleDeleteConversation = (id: string) => {
    const conversation = conversations[id];
    if (!conversation) return;
    const confirmed = window.confirm(
      `Delete "${conversation.name}" and all of its branches? This can't be undone.`,
    );
    if (!confirmed) return;
    deleteConversation(id);
  };

  const handleDeleteBranch = (id: string) => {
    const branch = branches[id];
    if (!branch) return;
    const confirmed = window.confirm(`Delete branch "${branch.name}"?`);
    if (!confirmed) return;
    try {
      deleteBranch(id);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Couldn't delete branch",
      );
    }
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className={cn("flex flex-row  items-center")}>
        <SidebarLogo logo={sidebarData.logo} />
        <ModeToggle />
      </SidebarHeader>
      <div className="px-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => addConversation("New conversation")}
        >
          <SquarePen />
          New chat
        </Button>
      </div>
      <SidebarContent>
        <SidebarSection
          label="Conversations"
          items={conversations}
          activeId={activeConversationId}
          onClick={(item) => checkoutConversation(item.id)}
          onRename={renameConversation}
          onDelete={handleDeleteConversation}
        />
        <SidebarSection
          label="Branches"
          items={branchesForActiveConversation}
          activeId={activeBranchId}
          onClick={(item) => checkoutBranch(item.name)}
          onRename={renameBranch}
          onDelete={handleDeleteBranch}
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
