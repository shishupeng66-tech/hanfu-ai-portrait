"use client";

import React, { useState } from 'react';
import {
  Home,
  PenLine,
  LayoutGrid,
  Image,
  Coins,
  Crown,
  ReceiptText,
  User,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Command,
  X,
  Search
} from 'lucide-react';
import Link from 'next/link';

export type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
  badge?: number | string;
  shortcut?: string;
  href?: string;
  children?: NavItemData[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

const mockNavGroups: NavGroupData[] = [
  {
    items: [
      { id: 'home', title: '首页', icon: Home, href: '/dashboard' },
    ]
  },
  {
    heading: '创作',
    items: [
      { id: 'create', title: '开始创作', icon: PenLine, href: '/generate' },
      { id: 'templates', title: '模板库', icon: LayoutGrid, href: '/templates' },
      { id: 'gallery', title: '我的作品', icon: Image, href: '/gallery' },
    ]
  },
  {
    heading: '账户与消费',
    items: [
      { id: 'credits', title: '积分中心', icon: Coins, badge: 128, href: '/credits' },
      { id: 'subscription', title: '订阅计划', icon: Crown, href: '/pricing' },
    ]
  },
  {
    heading: '个人中心',
    items: [
      { id: 'profile', title: '个人资料', icon: User, href: '/profile' },
      { id: 'notifications', title: '通知消息', icon: Bell, href: '/notifications' },
    ]
  }
];

const mockBottomItems: NavItemData[] = [
  { id: 'settings', title: 'Settings', icon: Settings, shortcut: '⌘,' },
  { id: 'logout', title: 'Log out', icon: LogOut },
];

function BrandHeader() {
  return (
    <Link href="/" className="flex items-center gap-3 px-2 py-2 mb-4 rounded-lg cursor-pointer transition-colors select-none group">
      <img
        src="/brand/logo-mark.png"
        alt="汉韵写真"
        className="w-8 h-8 object-contain rounded-[6px]"
      />
      <div className="flex flex-col overflow-hidden">
        <span className="text-[13px] font-medium leading-none mb-1 truncate max-w-[120px]" style={{ color: 'rgba(255, 247, 236, 0.92)' }}>
          汉韵写真
        </span>
        <span className="text-[11px] leading-none" style={{ color: 'rgba(255, 247, 236, 0.45)' }}>
          Han Portrait
        </span>
      </div>
    </Link>
  );
}

function NavItem({
  item,
  activeId,
  onSelect,
  level = 0
}: {
  item: NavItemData;
  activeId: string;
  onSelect: (id: string) => void;
  level?: number;
}) {
  const isActive = activeId === item.id;
  const hasChildren = !!item.children;
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onSelect(item.id);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div
        className={`group flex items-center justify-between px-2.5 py-[7px] rounded-[6px] cursor-pointer transition-all duration-200 select-none
          ${isActive ? 'font-medium' : ''}
        `}
        style={{
          paddingLeft: `${level * 12 + 10}px`,
          background: isActive ? 'rgba(232, 194, 122, 0.10)' : 'transparent',
          color: isActive ? '#E8C27A' : 'rgba(255, 247, 236, 0.72)',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'rgba(232, 194, 122, 0.08)';
            e.currentTarget.style.color = '#E8C27A';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'rgba(255, 247, 236, 0.72)';
          }
        }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2.5">
          <item.icon
            className="w-[16px] h-[16px] transition-colors flex-shrink-0"
            style={{
              color: isActive ? '#E8C27A' : 'rgba(255, 247, 236, 0.45)',
            }}
            strokeWidth={1.5}
          />
          <span className="text-[13px] tracking-wide truncate" style={{ fontWeight: isActive ? 600 : 400 }}>
            {item.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {item.shortcut && (
            <kbd className="hidden group-hover:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium font-mono rounded-[4px]" style={{ color: 'rgba(255, 247, 236, 0.25)', background: 'rgba(255, 247, 236, 0.05)', border: '1px solid rgba(255, 247, 236, 0.08)' }}>
              {item.shortcut}
            </kbd>
          )}
          {item.badge && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-medium rounded-full" style={{ background: 'rgba(232, 194, 122, 0.10)', color: '#E8C27A' }}>
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
              style={{ color: 'rgba(255, 247, 236, 0.40)' }}
              strokeWidth={2}
            />
          )}
        </div>
      </div>

      {hasChildren && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden min-h-0 relative flex flex-col gap-0.5 mt-0.5">
            <div
              className="absolute top-0 bottom-0 border-l border-black/5 dark:border-white/5"
              style={{ left: `${level * 12 + 17.5}px` }}
            />
            {item.children!.map(child => (
              <NavItem
                key={child.id}
                item={child}
                activeId={activeId}
                onSelect={onSelect}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SidebarNav({
  className = '',
  activeId,
  onSelect,
  activeWorkspace,
  onWorkspaceSelect
}: {
  className?: string,
  activeId?: string,
  onSelect?: (id: string) => void,
  activeWorkspace?: string,
  onWorkspaceSelect?: (ws: string) => void
}) {
  const [internalId, setInternalId] = useState('home');
  const currentId = activeId !== undefined ? activeId : internalId;
  const handleSelect = onSelect || setInternalId;

  return (
    <div className={`flex flex-col w-[260px] h-full bg-card/50 border-r border-border/50 p-3 font-sans ${className}`}>
      <BrandHeader />

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-4 mt-2">
        {mockNavGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-0.5">
            {group.heading && (
              <span className="px-2.5 mb-1 text-[11px] font-semibold tracking-wider uppercase" style={{ color: 'rgba(255, 247, 236, 0.25)' }}>
                {group.heading}
              </span>
            )}
            {group.items.map(item => (
              <NavItem
                key={item.id}
                item={item}
                activeId={currentId}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="pt-4 flex flex-col gap-0.5" style={{ borderTop: '1px solid rgba(255, 247, 236, 0.08)' }}>
        {mockBottomItems.map(item => (
          <NavItem
            key={item.id}
            item={item}
            activeId={currentId}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}

const allItems = [...mockNavGroups.flatMap(g => g.items), ...mockBottomItems];
const flattenItems = (items: NavItemData[]): NavItemData[] => {
  return items.reduce((acc, item) => {
    acc.push(item);
    if (item.children) acc.push(...flattenItems(item.children));
    return acc;
  }, [] as NavItemData[]);
};
const flatMockData = flattenItems(allItems);

export function AppSidebar({
  isOpen = true,
  onToggle,
}: {
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const [activeId, setActiveId] = useState('home');
  const [activeWorkspace, setActiveWorkspace] = useState('Acme Corp');

  const handleSelect = (id: string) => {
    setActiveId(id);
  };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-[width] duration-300 ease-out"
      style={{ width: isOpen ? 260 : 0, background: '#0B0B0D' }}
    >
      <div
        className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <SidebarNav
          className="w-[260px] h-full min-h-0 flex-1 border-none bg-transparent"
          activeId={activeId}
          onSelect={handleSelect}
          activeWorkspace={activeWorkspace}
          onWorkspaceSelect={setActiveWorkspace}
        />
      </div>
    </aside>
  );
}

export default function SidebarNavPreview() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState('home');
  const [activeWorkspace, setActiveWorkspace] = useState('Acme Corp');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const activeItem = flatMockData.find(i => i.id === activeId);
  const activeTitle = activeItem ? activeItem.title : 'Dashboard';

  const handleSelect = (id: string) => {
    if (id === 'search') {
      setIsSearchOpen(true);
      return;
    }
    setActiveId(id);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[700px] bg-background p-4 md:p-8">


      <div className="relative w-full max-w-4xl h-[700px] bg-card rounded-xl border border-border/50 flex overflow-hidden shadow-sm ring-1 ring-black/5 dark:ring-white/5">


        <div
          className={`h-full transition-all duration-300 ease-in-out shrink-0 overflow-hidden bg-card/50 border-r border-border/50 ${
            isOpen ? 'w-[260px] opacity-100' : 'w-0 opacity-0 border-none'
          }`}
        >

          <SidebarNav
            className="w-[260px] border-none bg-transparent"
            activeId={activeId}
            onSelect={handleSelect}
            activeWorkspace={activeWorkspace}
            onWorkspaceSelect={setActiveWorkspace}
          />
        </div>


        <div className="flex-1 bg-black/[0.02] dark:bg-white/[0.02] flex flex-col min-w-0 transition-all duration-300">


          <div className="h-14 border-b border-border/50 flex items-center px-4 justify-between bg-card shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-colors"
              >
                {isOpen ? <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.5} /> : <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={1.5} />}
              </button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate">{activeWorkspace}</span>
                <span>/</span>
                <span className="font-medium text-foreground truncate">{activeTitle}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-64 h-8 bg-black/5 dark:bg-white/5 rounded-md hidden md:block" />
              <div className="w-8 h-8 bg-primary/10 rounded-full border border-primary/20" />
            </div>
          </div>


          <div className="p-6 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex items-center justify-between mb-8">
              <div className="w-48 h-8 bg-black/5 dark:bg-white/5 rounded-md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="h-32 bg-card rounded-xl border border-border/50 shadow-sm" />
              <div className="h-32 bg-card rounded-xl border border-border/50 shadow-sm" />
            </div>

            <div className="w-full bg-card rounded-xl border border-border/50 shadow-sm p-6">
              <div className="w-1/3 h-5 bg-black/5 dark:bg-white/5 rounded-md mb-6" />
              <div className="w-full h-[1px] bg-border/50 mb-6" />

              <div className="flex flex-col gap-4">
                <div className="w-full h-12 bg-black/5 dark:bg-white/5 rounded-lg" />
                <div className="w-full h-12 bg-black/5 dark:bg-white/5 rounded-lg" />
                <div className="w-full h-12 bg-black/5 dark:bg-white/5 rounded-lg" />
                <div className="w-full h-12 bg-black/5 dark:bg-white/5 rounded-lg" />
              </div>
            </div>
          </div>
        </div>


        {isSearchOpen && (
          <div className="absolute inset-0 z-50 flex items-start justify-center pt-[15vh] bg-background/40 backdrop-blur-sm px-4">
            <div className="absolute inset-0" onClick={() => setIsSearchOpen(false)} />
            <div className="relative w-full max-w-xl bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center px-4 border-b border-border/50">
                <Search className="w-[18px] h-[18px] text-muted-foreground/70 mr-3 shrink-0" strokeWidth={1.5} />
                <input
                  autoFocus
                  className="flex-1 bg-transparent py-4 outline-none text-[14px] text-foreground placeholder:text-muted-foreground/50"
                  placeholder="Search projects, docs, or actions..."
                />
                <kbd
                  onClick={() => setIsSearchOpen(false)}
                  className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 ml-2 text-[10px] font-medium font-mono text-muted-foreground/70 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-[4px] cursor-pointer hover:text-foreground hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                >
                  ESC
                </kbd>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-3 p-1 rounded-md text-muted-foreground/70 hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition-colors"
                >
                  <X className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </button>
              </div>
              <div className="p-2 py-8 flex flex-col items-center justify-center">
                <Command className="w-6 h-6 text-muted-foreground/30 mb-2" strokeWidth={1.5} />
                <p className="text-[13px] text-muted-foreground font-medium">Type a command or search...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
