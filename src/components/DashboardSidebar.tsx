import React, { useState } from 'react';
import { Search } from 'lucide-react';
import defaultAvatar from '../assets/default-avatar.svg';

export interface DashboardNavigationGroup<T extends string> {
  label: string;
  items: Array<{
    label: string;
    tab: T;
    icon: React.ReactNode;
  }>;
}

interface DashboardSidebarProps<T extends string> {
  user: {
    name: string;
    avatar?: string | null;
  };
  groups: DashboardNavigationGroup<T>[];
  activeTab: T;
  greeting: string;
  footer: string;
  ariaLabel: string;
  onSelect: (tab: T) => void;
}

export function DashboardSidebar<T extends string>({
  user,
  groups,
  activeTab,
  greeting,
  footer,
  ariaLabel,
  onSelect
}: DashboardSidebarProps<T>) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const filteredGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(query))
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="fixed bottom-0 left-0 top-16 z-40 hidden w-[276px] flex-col border-r border-white/10 bg-[#101010] px-6 py-7 text-white lg:flex">
      <div className="flex items-center gap-3">
        <img
          src={user.avatar || defaultAvatar}
          alt=""
          className="h-11 w-11 rounded-full border border-white/15 object-cover"
        />
        <div className="min-w-0">
          <p className="text-xs text-neutral-400">{greeting}</p>
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
        </div>
      </div>

      <label className="relative mt-8 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search"
          aria-label="Search dashboard sections"
          className="w-full rounded-full border border-white/5 bg-[#282828] py-3 pl-10 pr-4 text-xs text-white placeholder:text-neutral-400 focus:border-lime-300 focus:outline-none"
        />
      </label>

      <nav aria-label={ariaLabel} className="mt-8 flex-1 space-y-7 overflow-y-auto">
        {filteredGroups.map((group) => (
          <section key={group.label}>
            <h2 className="mb-3 px-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              {group.label}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => onSelect(item.tab)}
                  aria-current={activeTab === item.tab ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-medium transition ${
                    activeTab === item.tab
                      ? 'bg-lime-300 text-slate-950'
                      : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
        {filteredGroups.length === 0 && (
          <p className="px-2 text-xs text-neutral-400">No dashboard sections match that search.</p>
        )}
      </nav>

      <div className="mt-5 border-t border-white/10 pt-4 text-[10px] text-neutral-500">
        {footer}
      </div>
    </aside>
  );
}
