"use client";

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { Button } from "@/components/button";
import { motion } from "framer-motion";
import {
  Search,
  ArrowUpDown,
  Heart,
  Download,
  RefreshCw,
  Trash2,
  Eye,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Sparkles,
  X,
  Check
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations('works.status');
  const configs: Record<string, { bg: string; color: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
    completed: {
      bg: 'rgba(34, 197, 94, 0.15)',
      color: '#22c55e',
      icon: Check,
      label: 'completed'
    },
    processing: {
      bg: 'rgba(232, 194, 122, 0.15)',
      color: '#E8C27A',
      icon: Loader2,
      label: 'processing'
    },
    failed: {
      bg: 'rgba(239, 68, 68, 0.15)',
      color: '#ef4444',
      icon: AlertCircle,
      label: 'failed'
    },
    favorited: {
      bg: 'rgba(232, 194, 122, 0.15)',
      color: '#E8C27A',
      icon: Heart,
      label: 'favorited'
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: config.bg, color: config.color }}
    >
      <Icon className={`w-3.5 h-3.5 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {t(config.label)}
    </span>
  );
}

function WorkCard({
  work,
  onToggleFavorite,
  onViewDetail,
  onRegenerate,
  onDownload,
  onDelete,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  work: Record<string, any>;
  onToggleFavorite: (id: string) => void;
  onViewDetail: (id: string) => void;
  onRegenerate: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations('works.actions');
  const tWorks = useTranslations('works');
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeOut", duration: 0.3 }}
      className="group relative rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: '#111114',
        border: '1px solid rgba(255, 247, 236, 0.08)',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Favorite Button */}
      <button
        onClick={() => onToggleFavorite(work.id)}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          background: work.isFavorited ? 'rgba(232, 194, 122, 0.2)' : 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Heart
          className="w-4 h-4 transition-colors"
          style={{
            color: work.isFavorited ? '#E8C27A' : 'rgba(255, 247, 236, 0.6)',
            fill: work.isFavorited ? '#E8C27A' : 'none',
          }}
        />
      </button>

      {/* Image Area */}
      <div className="aspect-[3/4] relative overflow-hidden">
        {work.status === 'completed' || work.status === 'favorited' ? (
          <Image
            src={work.image}
            alt={work.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : work.status === 'processing' ? (
          <div
            className="w-full h-full flex flex-col items-center justify-center"
            style={{ background: 'rgba(255, 247, 236, 0.03)' }}
          >
            <Loader2 className="w-10 h-10 animate-spin mb-3" style={{ color: '#E8C27A' }} />
            <p className="text-sm" style={{ color: 'rgba(255, 247, 236, 0.6)' }}>
              {tWorks('loading')}
            </p>
          </div>
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-4 text-center"
            style={{ background: 'rgba(239, 68, 68, 0.05)' }}
          >
            <AlertCircle className="w-10 h-10 mb-3" style={{ color: '#ef4444' }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255, 247, 236, 0.8)' }}>
              {tWorks('failed')}
            </p>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={work.status} />
        </div>

        {/* Hover Overlay for Actions */}
        <div
          className={`absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-all duration-300 ${
            showActions && (work.status === 'completed' || work.status === 'favorited')
              ? 'opacity-100'
              : 'opacity-0'
          }`}
        >
          <button
            onClick={() => onViewDetail(work.id)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255, 247, 236, 0.15)' }}
            title={t('viewDetails')}
          >
            <Eye className="w-5 h-5" style={{ color: 'rgba(255, 247, 236, 0.9)' }} />
          </button>
          <button
            onClick={() => onDownload(work.id)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255, 247, 236, 0.15)' }}
            title={t('download')}
          >
            <Download className="w-5 h-5" style={{ color: 'rgba(255, 247, 236, 0.9)' }} />
          </button>
          <button
            onClick={() => onRegenerate(work.id)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(232, 194, 122, 0.2)' }}
            title={t('regenerate')}
          >
            <RefreshCw className="w-5 h-5" style={{ color: '#E8C27A' }} />
          </button>
          <button
            onClick={() => onDelete(work.id)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(239, 68, 68, 0.15)' }}
            title={t('delete')}
          >
            <Trash2 className="w-5 h-5" style={{ color: '#ef4444' }} />
          </button>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4">
        <h4 className="font-semibold mb-1.5 truncate" style={{ color: 'rgba(255, 247, 236, 0.92)' }}>
          {work.title}
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'rgba(255, 247, 236, 0.45)' }}>
            {work.styleName}
          </span>
        </div>
        <p className="text-xs mt-2" style={{ color: 'rgba(255, 247, 236, 0.35)' }}>
          {work.createdAt}
        </p>
      </div>
    </motion.div>
  );
}

function EmptyState({ onStartCreate }: { onStartCreate: () => void }) {
  const t = useTranslations('works.empty');

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeOut", duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div
        className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(255, 247, 236, 0.03)' }}
      >
        <ImageIcon className="w-12 h-12" style={{ color: 'rgba(255, 247, 236, 0.25)' }} />
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'rgba(255, 247, 236, 0.92)' }}>
        {t('title')}
      </h3>
      <p className="text-sm mb-6 text-center max-w-md" style={{ color: 'rgba(255, 247, 236, 0.55)' }}>
        {t('description')}
      </p>
      <Button
        onClick={onStartCreate}
        className="min-w-[160px]"
        style={{
          background: 'linear-gradient(135deg, #E8C27A 0%, #D4A84B 100%)',
          color: '#1a1508',
        }}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {t('cta')}
      </Button>
    </motion.div>
  );
}

export default function WorksPage() {
  const t = useTranslations('works');
  const router = useRouter();
  const locale = useLocale();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [works, setWorks] = useState<Record<string, any>[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Filter and sort works
  const filteredWorks = useMemo(() => {
    let result = [...works];

    // Filter by tab
    if (activeTab !== 'all') {
      if (activeTab === 'favorited') {
        result = result.filter(w => w.isFavorited);
      } else {
        result = result.filter(w => w.status === activeTab);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        w =>
          w.title.toLowerCase().includes(query) ||
          w.styleName.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'credits':
        result.sort((a, b) => b.credits - a.credits);
        break;
      case 'style':
        result.sort((a, b) => a.styleName.localeCompare(b.styleName));
        break;
    }

    return result;
  }, [works, activeTab, searchQuery, sortBy]);

  // Handlers
  const handleToggleFavorite = (id: string) => {
    setWorks(prev =>
      prev.map(w => (w.id === id ? { ...w, isFavorited: !w.isFavorited } : w))
    );
  };

  const handleViewDetail = (id: string) => {
    router.push(`/${locale}/works/${id}`);
  };

  const handleRegenerate = (_id: string) => {
    router.push(`/${locale}/generate`);
  };

  const handleDownload = (_id: string) => {
    // Mock download action
    console.log('Downloading work');
  };

  const handleDelete = (id: string) => {
    setWorks(prev => prev.filter(w => w.id !== id));
  };

  const handleStartCreate = () => {
    router.push(`/${locale}/generate`);
  };

  const getCurrentSortLabel = () => {
    const option = [
      { id: 'newest', label: 'sort.newest' },
      { id: 'oldest', label: 'sort.oldest' },
      { id: 'credits', label: 'sort.credits' },
      { id: 'style', label: 'sort.style' },
    ].find(o => o.id === sortBy);
    return option ? t(option.label) : '';
  };

  const tabs = ['all', 'completed', 'processing', 'failed', 'favorited'];

  return (
    <div className="min-h-screen" style={{ background: '#0B0B0D' }}>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'rgba(255, 247, 236, 0.92)' }}>
            {t('title')}
          </h1>
          <p className="text-base" style={{ color: 'rgba(255, 247, 236, 0.55)' }}>
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.4, delay: 0.1 }}
          className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200"
                style={{
                  background: activeTab === tab ? 'rgba(232, 194, 122, 0.12)' : 'transparent',
                  color: activeTab === tab ? '#E8C27A' : 'rgba(255, 247, 236, 0.65)',
                  border: activeTab === tab ? '1px solid rgba(232, 194, 122, 0.2)' : '1px solid transparent',
                }}
              >
                {t(`tabs.${tab}`)}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'rgba(255, 247, 236, 0.4)' }}
              />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-[200px] md:w-[260px] pl-10 pr-4 py-2 rounded-lg text-sm outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255, 247, 236, 0.03)',
                  border: '1px solid rgba(255, 247, 236, 0.08)',
                  color: 'rgba(255, 247, 236, 0.9)',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4" style={{ color: 'rgba(255, 247, 236, 0.4)' }} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: 'rgba(255, 247, 236, 0.03)',
                  border: '1px solid rgba(255, 247, 236, 0.08)',
                  color: 'rgba(255, 247, 236, 0.75)',
                }}
              >
                <ArrowUpDown className="w-4 h-4" />
                <span>{getCurrentSortLabel()}</span>
              </button>

              {showSortDropdown && (
                <div
                  className="absolute right-0 top-full mt-2 py-2 rounded-lg z-20 min-w-[160px]"
                  style={{
                    background: '#141418',
                    border: '1px solid rgba(255, 247, 236, 0.08)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  {['newest', 'oldest', 'credits', 'style'].map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm transition-all duration-200 hover:bg-white/5"
                      style={{
                        color: sortBy === option ? '#E8C27A' : 'rgba(255, 247, 236, 0.7)',
                      }}
                    >
                      {t(`sort.${option}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Works Grid or Empty State */}
        {filteredWorks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredWorks.map((work) => (
              <WorkCard
                key={work.id}
                work={work}
                onToggleFavorite={handleToggleFavorite}
                onViewDetail={handleViewDetail}
                onRegenerate={handleRegenerate}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyState onStartCreate={handleStartCreate} />
        )}

        {/* Results Count */}
        {filteredWorks.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-sm text-center"
            style={{ color: 'rgba(255, 247, 236, 0.4)' }}
          >
            {t('info.total', { count: filteredWorks.length })}
          </motion.p>
        )}
      </div>
    </div>
  );
}
