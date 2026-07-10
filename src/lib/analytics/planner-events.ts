export type PlannerEventName =
  | 'planner_started'
  | 'property_details_saved'
  | 'room_map_generated'
  | 'device_placed'
  | 'device_deleted'
  | 'estimate_viewed'
  | 'soft_lead_captured'
  | 'plan_submitted';

export function trackPlannerEvent(eventName: PlannerEventName, payload?: Record<string, unknown>) {
  try {
    // In a real application, this would dispatch to Mixpanel, Google Analytics, PostHog, etc.
    // For now, we will log to console in non-production environments.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics] ${eventName}`, payload || {});
    }

    if (typeof window !== 'undefined' && (window as unknown as { dataLayer: unknown[] }).dataLayer) {
      (window as unknown as { dataLayer: unknown[] }).dataLayer.push({
        event: eventName,
        ...payload,
      });
    }
  } catch (err) {
    // Silently catch analytics errors so they don't break the app
    console.error('Analytics tracking failed', err);
  }
}
