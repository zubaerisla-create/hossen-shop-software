'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/app/utils/api';

interface AnalyticsContextType {
  visitorId: string | null;
  sessionId: string | null;
  trackEvent: (eventName: string, eventData?: Record<string, any>) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  visitorId: null,
  sessionId: null,
  trackEvent: async () => {},
});

export const useAnalytics = () => useContext(AnalyticsContext);

// Utility to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Utility to set cookie
function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === 'undefined') return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const activeRouteRef = useRef<string>(pathname || '/');
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Session
  useEffect(() => {
    let storedVisitorId = getCookie('visitor_id') || localStorage.getItem('apex_visitor_id');

    const initVisitorSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/analytics/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visitorId: storedVisitorId || undefined,
            userAgent: navigator.userAgent,
            referrer: document.referrer || '',
            landingPage: window.location.pathname + window.location.search,
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          const vId = resData.data.visitorId;
          const sId = resData.data.sessionId;

          setVisitorId(vId);
          setSessionId(sId);

          setCookie('visitor_id', vId, 365);
          localStorage.setItem('apex_visitor_id', vId);
          sessionStorage.setItem('apex_session_id', sId);

          // Track initial page view
          sendPageView(vId, sId, window.location.pathname + window.location.search, window.location.pathname, 0);
        }
      } catch (error) {
        console.warn('Analytics session initialization skipped:', error);
      }
    };

    initVisitorSession();
  }, []);

  // Send page view helper
  const sendPageView = async (
    vId: string,
    sId: string,
    url: string,
    route: string,
    timeOnPageSec: number
  ) => {
    try {
      await fetch(`${API_BASE_URL}/api/analytics/page-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: vId,
          sessionId: sId,
          url,
          route,
          referrer: document.referrer || '',
          timeOnPage: timeOnPageSec,
        }),
      });
    } catch (err) {
      // Ignore analytics fetch errors silently
    }
  };

  // Track custom event helper
  const trackEvent = async (eventName: string, eventData?: Record<string, any>) => {
    const vId = visitorId || localStorage.getItem('apex_visitor_id');
    const sId = sessionId || sessionStorage.getItem('apex_session_id');

    if (!vId || !sId) return;

    try {
      await fetch(`${API_BASE_URL}/api/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: vId,
          sessionId: sId,
          eventName,
          eventData,
          path: window.location.pathname,
        }),
      });
    } catch (err) {
      // Ignore event fetch errors
    }
  };

  // Track route changes
  useEffect(() => {
    if (!visitorId || !sessionId) return;

    const fullUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    const previousRoute = activeRouteRef.current;
    const timeSpentSec = Math.floor((Date.now() - startTimeRef.current) / 1000);

    // Send page view update for route change
    sendPageView(visitorId, sessionId, fullUrl, pathname, timeSpentSec);

    // Reset reference state for current route
    activeRouteRef.current = pathname;
    startTimeRef.current = Date.now();
  }, [pathname, searchParams, visitorId, sessionId]);

  // Active Tab Heartbeat Every 60s
  useEffect(() => {
    if (!visitorId || !sessionId) return;

    const runHeartbeat = () => {
      if (document.visibilityState === 'visible') {
        const fullUrl = window.location.pathname + window.location.search;
        const timeSpentSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
        sendPageView(visitorId, sessionId, fullUrl, window.location.pathname, timeSpentSec);
      }
    };

    heartbeatTimerRef.current = setInterval(runHeartbeat, 60000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Send final page duration update on tab hide
        const fullUrl = window.location.pathname + window.location.search;
        const timeSpentSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
        sendPageView(visitorId, sessionId, fullUrl, window.location.pathname, timeSpentSec);
      } else {
        startTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [visitorId, sessionId]);

  return (
    <AnalyticsContext.Provider value={{ visitorId, sessionId, trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
}
