"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/button";
import { Container } from "@/components/container";
import { Background } from "@/components/background";
import { motion } from "framer-motion";
import { oneTimePacks, type PackKey } from "@/constants/billing";
import type {
  ClientUserProfile,
  CreditHistoryRecord,
  CreditHistoryResponse,
  UserProfileResponse,
} from "@/lib/client-api";

export default function CreditsPage() {
  const session = useSession();
  const locale = useLocale();
  const t = useTranslations('credits');
  const tCommon = useTranslations('common');
  const [userProfile, setUserProfile] = useState<ClientUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [creditHistory, setCreditHistory] = useState<CreditHistoryRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingButtons, setLoadingButtons] = useState<Record<string, boolean>>({});
  const limit = 20;

  // Fetch user profile with credits
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = (await response.json()) as UserProfileResponse;
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch credit history with pagination
  const fetchCreditHistory = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setLoadingHistory(true);
    try {
      const offset = (pageNum - 1) * limit;
      const response = await fetch(`/api/user/credits/history?limit=${limit}&offset=${offset}`);
      if (response.ok) {
        const data = (await response.json()) as CreditHistoryResponse;
        if (append) {
          setCreditHistory(prev => [...prev, ...data.history]);
        } else {
          setCreditHistory(data.history);
        }
        setHasMore(data.history.length === limit);
      }
    } catch (error) {
      console.error("Error fetching credit history:", error);
    } finally {
      setLoadingHistory(false);
    }
  }, [limit]);

  useEffect(() => {
    if (session.data?.user?.id) {
      fetchUserProfile();
      fetchCreditHistory(1);
    }
  }, [session.data?.user?.id, fetchUserProfile, fetchCreditHistory]);

  // Refresh data when page becomes visible again (e.g., user returns from checkout tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session.data?.user?.id) {
        // Page became visible again, refresh user data
        console.log('[Credits] Page visible, refreshing data');
        fetchUserProfile();
        fetchCreditHistory(1);
        // Also clear any button loading states
        setLoadingButtons({});
      }
    };
    
    // Also listen to window focus as an additional trigger
    const handleWindowFocus = () => {
      if (session.data?.user?.id) {
        console.log('[Credits] Window focused, refreshing data');
        fetchUserProfile();
        fetchCreditHistory(1);
        setLoadingButtons({});
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [session.data?.user?.id, fetchUserProfile, fetchCreditHistory]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCreditHistory(nextPage, true);
  };

  const startCheckout = useCallback(
    async (planKey: string) => {
      const userId = session.data?.user?.id;
      if (!userId) return;
      
      // Open a blank new tab immediately to avoid popup blockers
      const checkoutWindow = window.open("about:blank", "_blank");
      
      // Disable opener reference for security if window was opened
      if (checkoutWindow) {
        checkoutWindow.opener = null;
        
        // Write a simple loading page to avoid showing blank white page
        const loadingText = locale === 'zh' ? '正在打开安全支付页面…' : 'Opening secure checkout…';
        const html = `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${loadingText}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #f9fafb;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      color: #374151;
    }
    .loading-container {
      text-align: center;
      padding: 2rem;
      max-width: 90%;
    }
    .spinner {
      display: inline-block;
      width: 24px;
      height: 24px;
      border: 3px solid rgba(59, 130, 246, 0.3);
      border-radius: 50%;
      border-top-color: #3b82f6;
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .loading-text {
      font-size: 1.125rem;
      font-weight: 500;
      margin: 0;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="loading-container">
    <div class="spinner"></div>
    <p class="loading-text">${loadingText}</p>
  </div>
</body>
</html>`;
        checkoutWindow.document.write(html);
        checkoutWindow.document.close();
      }
      
      setLoadingButtons(prev => ({ ...prev, [planKey]: true }));
      
      try {
        const res = await fetch("/api/payments/creem/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            key: planKey, 
            kind: "one_time",
            cancelUrl: `/${locale}/credits`
          }),
        });
        
        if (!res.ok) {
          // Close the blank window if checkout creation failed
          checkoutWindow?.close();
          setLoadingButtons(prev => ({ ...prev, [planKey]: false }));
          console.error('Checkout creation failed:', res.status, res.statusText);
          return;
        }
        
        const { url } = (await res.json()) as { url: string };
        
        // Navigate the new window to checkout URL
        if (checkoutWindow) {
          checkoutWindow.location.href = url;
          // Clear button loading state since new tab is successfully opened
          setLoadingButtons(prev => ({ ...prev, [planKey]: false }));
        } else {
          // Fallback to current tab only if new window was completely blocked
          setLoadingButtons(prev => ({ ...prev, [planKey]: false }));
          window.location.assign(url);
        }
      } catch (error) {
        // Close the blank window on any error
        checkoutWindow?.close();
        setLoadingButtons(prev => ({ ...prev, [planKey]: false }));
        console.error('Checkout error:', error);
      }
    },
    [session.data?.user?.id, locale]
  );

  const credits = userProfile?.credits ?? 0;

  if (loading && !session.data?.user) {
    return (
      <div className="min-h-screen" style={{ background: "#1B120E" }}>
        <div className="p-8">
          <div className="flex justify-center items-center h-64">
            <p style={{ color: "rgba(255, 247, 236, 0.62)" }}>{tCommon('status.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#1B120E" }}>
      <div className="p-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: "#FFF7EC" }}>
            {t('title')}
          </h1>
          <p className="text-xl mb-6" style={{ color: "rgba(255, 247, 236, 0.62)" }}>
            {t('subtitle')}
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <Link href={`/${locale}/dashboard`}>
              <Button variant="outline" size="sm">
                {t('navigation.backToDashboard')}
              </Button>
            </Link>
            <Link href={`/${locale}/generate`}>
              <Button variant="outline" size="sm">
                {t('navigation.startCreating')}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Credits Overview */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {/* Current Balance */}
          <div 
            className="rounded-2xl p-6 border"
            style={{
              background: "#2A1C15",
              borderColor: "rgba(232, 194, 122, 0.16)",
            }}
          >
            <h3 className="text-lg font-medium mb-2" style={{ color: "rgba(255, 247, 236, 0.62)" }}>
              {t('balance.title')}
            </h3>
            <div className="text-4xl font-bold mb-2" style={{ color: "#E8C27A" }}>
              {credits}
            </div>
            <p className="text-sm" style={{ color: "rgba(255, 247, 236, 0.52)" }}>
              {t('balance.description')}
            </p>
          </div>

          {/* Quick Purchase Options */}
          <div 
            className="rounded-2xl p-6 border"
            style={{
              background: "#2A1C15",
              borderColor: "rgba(232, 194, 122, 0.16)",
            }}
          >
            <h3 className="text-lg font-medium mb-4" style={{ color: "rgba(255, 247, 236, 0.62)" }}>
              {t('purchase.title')}
            </h3>
            <div className="space-y-2">
              {(['pack_small', 'pack_popular', 'pack_large'] as PackKey[]).map((packKey) => {
                const pack = oneTimePacks[packKey];
                const isLoading = loadingButtons[pack.key];
                return (
                  <button
                    key={pack.key}
                    className="w-full justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center"
                    style={{
                      background: "#C83A32",
                      color: "#FFF7EC",
                      border: "1px solid rgba(232, 194, 122, 0.22)",
                    }}
                    onClick={() => startCheckout(pack.key)}
                    disabled={isLoading}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.background = "#D7463E";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.background = "#C83A32";
                      }
                    }}
                  >
                    {isLoading ? (
                      <span style={{ color: "#FFF7EC" }}>{tCommon('status.loading')}</span>
                    ) : (
                      <>
                        <span>{pack.credits} {t('purchase.credits')}</span>
                        <span className="font-bold">${(pack.priceCents / 100).toFixed(0)}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-card/50 backdrop-blur-md rounded-2xl p-6 border border-border">
            <h3 className="text-lg font-medium text-muted-foreground mb-4">
              {t('statistics.title')}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('statistics.thisMonth')}</span>
                <span className="font-medium text-card-foreground">
                  {creditHistory.filter(r => 
                    new Date(r.createdAt).getMonth() === new Date().getMonth() && 
                    r.amount < 0
                  ).reduce((sum, r) => sum + Math.abs(r.amount), 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('statistics.totalPurchased')}</span>
                <span className="font-medium text-card-foreground">
                  {creditHistory.filter(r => r.type === 'purchase' && r.amount > 0)
                    .reduce((sum, r) => sum + r.amount, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('statistics.totalUsed')}</span>
                <span className="font-medium text-card-foreground">
                  {creditHistory.filter(r => r.amount < 0)
                    .reduce((sum, r) => sum + Math.abs(r.amount), 0)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Credit History Table */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ease: "easeOut", duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-card/50 backdrop-blur-md rounded-2xl p-6 border border-border">
            <h3 className="text-xl font-semibold text-card-foreground mb-4">
              {t('history.title')}
            </h3>

            {loadingHistory && creditHistory.length === 0 ? (
              <div className="text-center py-4">
                <span className="text-muted-foreground">{tCommon('status.loading')}</span>
              </div>
            ) : creditHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('history.noRecords')}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                          {t('history.columns.time')}
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                          {t('history.columns.type')}
                        </th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                          {t('history.columns.description')}
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                          {t('history.columns.amount')}
                        </th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">
                          {t('history.columns.balance')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {creditHistory.map((record, index) => {
                        // Calculate running balance (from current balance backwards)
                        // Most recent transactions are first, so we subtract previous transactions
                        const runningBalance = credits - creditHistory
                          .slice(0, index)
                          .reduce((sum, r) => sum + r.amount, 0);
                        
                        return (
                          <tr
                            key={record.id}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-2 text-sm text-card-foreground">
                              {new Date(record.createdAt).toLocaleString(locale, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-3 px-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                record.type === 'purchase' || record.type === 'subscription'
                                  ? 'bg-green-500/10 text-green-600'
                                  : record.type === 'usage'
                                  ? 'bg-red-500/10 text-red-600'
                                  : record.type === 'bonus'
                                  ? 'bg-muted text-muted-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {t(`history.types.${record.type}`)}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-sm text-card-foreground">
                              {t(`history.reasons.${record.reason}`, {
                                defaultValue: record.reason
                              })}
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-mono">
                              <span className={record.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                                {record.amount > 0 ? '+' : ''}{record.amount}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-sm text-right font-mono text-muted-foreground">
                              {runningBalance}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Load More Button */}
                {hasMore && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loadingHistory}
                    >
                      {loadingHistory ? tCommon('status.loading') : t('history.loadMore')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
