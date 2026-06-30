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
import { useLocale } from 'next-intl';

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

function getNavGroups(locale: string): NavGroupData[] {
  if (locale === 'zh') {
    return [
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
  }
  return [
    {
      items: [
        { id: 'home', title: 'Home', icon: Home, href: '/dashboard' },
      ]
    },
    {
      heading: 'Create',
      items: [
        { id: 'create', title: 'Start Creating', icon: PenLine, href: '/generate' },
        { id: 'templates', title: 'Templates', icon: LayoutGrid, href: '/templates' },
        { id: 'gallery', title: 'My Works', icon: Image, href: '/gallery' },
      ]
    },
    {
      heading: 'Account & Billing',
      items: [
        { id: 'credits', title: 'Credits', icon: Coins, badge: 128, href: '/credits' },
        { id: 'subscription', title: 'Subscription', icon: Crown, href: '/pricing' },
      ]
    },
    {
      heading: 'Profile',
      items: [
        { id: 'profile', title: 'Profile', icon: User, href: '/profile' },
        { id: 'notifications', title: 'Notifications', icon: Bell, href: '/notifications' },
      ]
    }
  ];
}

function getBottomItems(locale: string): NavItemData[] {
  if (locale === 'zh') {
    return [
      { id: 'settings', title: '设置', icon: Settings, shortcut: '⌘,' },
      { id: 'logout', title: '退出登录', icon: LogOut },
    ];
  }
  return [
    { id: 'settings', title: 'Settings', icon: Settings, shortcut: '⌘,' },
    { id: 'logout', title: 'Log out', icon: LogOut },
  ];
}

function BrandHeader() {
  const locale = useLocale();
  const isZh = locale === 'zh';

  return (
<<<<<<< HEAD
    <Link href="/" className="flex items-center gap-3.5 px-2 py-3 mb-5 rounded-lg cursor-pointer transition-colors select-none group">
      <img
        src="/brand/logo-mark.png"
        alt={isZh ? '汉韵写真' : 'Han Portrait'}
        className="w-10 h-10 object-contain rounded-[8px]"
      />
      <div className="flex flex-col overflow-hidden">
        {isZh ? (
          <span
            className="text-[17px] font-bold leading-none truncate max-w-[140px]"
            style={{
              background: 'linear-gradient(135deg, #E8C27A 0%, #C84B31 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            汉韵写真
          </span>
        ) : (
          <span className="text-[17px] font-bold leading-none truncate max-w-[140px]">
            <span style={{ color: 'rgba(255, 247, 236, 0.92)' }}>Han</span>
            <span
=======
    <div className="flex flex-col">
      <Link href="/" className="flex items-center gap-4 px-2 py-3 rounded-lg cursor-pointer transition-colors select-none group">
        <img
          src="/brand/logo-mark.png"
          alt={isZh ? '汉韵写真' : 'Han Portrait'}
          className="w-11 h-11 object-contain rounded-[8px]"
        />
        <div className="flex flex-col overflow-hidden">
          {isZh ? (
            <span
              className="text-[18px] font-bold leading-none truncate max-w-[150px]"
>>>>>>> parent of 4facaa7 (品牌优化2)
              style={{
                background: 'linear-gradient(135deg, #E8C27A 0%, #C84B31 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
<<<<<<< HEAD
              {' '}Portrait
            </span>
          </span>
        )}
      </div>
    </Link>
=======
              汉韵写真
            </span>
          ) : (
            <span className="text-[18px] font-bold leading-none truncate max-w-[150px]">
              <span style={{ color: 'rgba(255, 247, 236, 0.92)' }}>Han</span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #E8C27A 0%, #C84B31 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {' '}Portrait
              </span>
            </span>
          )}
        </div>
      </Link>
      {/* 品牌名下方分界线 */}
      <div className="mx-2 mb-4" style={{ borderBottom: '1px solid rgba(255, 247, 236, 0.08)' }} />
    </div>
>>>>>>> parent of 4facaa7 (品牌优化2)
  );
}

function NavItem({
  item,
  activeId,
  onSelect,
  level = 0,
  isZh = false
}: {
  item: NavItemData;
  activeId: string;
  onSelect: (id: string) => void;
  level?: number;
  isZh?: boolean;
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

  // 参考图二：更深的文字颜色、更大的字体、更宽松的间距
  const normalColor = isZh ? 'rgba(255, 247, 236, 0.82)' : 'rgba(255, 247, 236, 0.78)';
  const hoverColor = '#E8C27A';
  const iconNormalColor = isZh ? 'rgba(255, 247, 236, 0.55)' : 'rgba(255, 247, 236, 0.50)';
  const fontSize = isZh ? '14px' : '13px';
  const itemPadding = isZh ? '8px 10px' : '7px 10px';

  return (
    <div className="flex flex-col w-full">
      <div
        className={`group flex items-center justify-between rounded-[6px] cursor-pointer transition-all duration-200 select-none
          ${isActive ? 'font-medium' : ''}
        `}
        style={{
          padding: itemPadding,
          paddingLeft: `${level * 12 + 10}px`,
          background: isActive ? 'rgba(232, 194, 122, 0.10)' : 'transparent',
          color: isActive ? hoverColor : normalColor,
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'rgba(232, 194, 122, 0.08)';
            e.currentTarget.style.color = hoverColor;
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = normalColor;
          }
        }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2.5">
          <item.icon
            className="w-[16px] h-[16px] transition-colors flex-shrink-0"
            style={{
              color: isActive ? hoverColor : iconNormalColor,
            }}
            strokeWidth={1.5}
          />
          <span className="tracking-wide truncate" style={{ fontSize, fontWeight: isActive ? 600 : 400 }}>
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
                isZh={isZh}
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
  const locale = useLocale();
  const isZh = locale === 'zh';

  const navGroups = getNavGroups(locale);
  const bottomItems = getBottomItems(locale);

  // 参考图二：分组标题颜色更深，间距更大
  const headingColor = isZh ? 'rgba(255, 247, 236, 0.38)' : 'rgba(255, 247, 236, 0.32)';
  const groupGap = isZh ? 'gap-1.5' : 'gap-0.5';
  const sectionGap = isZh ? 'gap-5' : 'gap-4';
  const headingSize = isZh ? '12px' : '11px';
  const headingLetterSpacing = isZh ? '0.08em' : '0.05em';

  return (
    <div className={`flex flex-col w-[260px] h-full bg-card/50 border-r border-border/50 p-3 font-sans ${className}`}>
      <BrandHeader />

      <div className={`flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col ${sectionGap} mt-2`}>
        {navGroups.map((group, idx) => (
          <div key={idx} className={`flex flex-col ${groupGap}`}>
            {group.heading && (
              <span className="px-2.5 mb-1 font-semibold uppercase" style={{ fontSize: headingSize, letterSpacing: headingLetterSpacing, color: headingColor }}>
                {group.heading}
              </span>
            )}
            {group.items.map(item => (
              <NavItem
                key={item.id}
                item={item}
                activeId={currentId}
                onSelect={handleSelect}
                isZh={isZh}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="pt-4 flex flex-col gap-0.5" style={{ borderTop: '1px solid rgba(255, 247, 236, 0.08)' }}>
        {bottomItems.map(item => (
          <NavItem
            key={item.id}
            item={item}
            activeId={currentId}
            onSelect={handleSelect}
            isZh={isZh}
          />
        ))}
      </div>
    </div>
  );
}

function getAllItems(locale: string): NavItemData[] {
  const groups = getNavGroups(locale);
  const bottoms = getBottomItems(locale);
  return [...groups.flatMap(g => g.items), ...bottoms];
}

const flattenItems = (items: NavItemData[]): NavItemData[] => {
  return items.reduce((acc, item) => {
    acc.push(item);
    if (item.children) acc.push(...flattenItems(item.children));
    return acc;
  }, [] as NavItemData[]);
};

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
  const previewLocale = 'zh';

  const allItems = getAllItems(previewLocale);
  const flatMockData = flattenItems(allItems);
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
