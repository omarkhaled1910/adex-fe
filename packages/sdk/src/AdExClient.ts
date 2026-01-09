/**
 * AdEx Browser SDK - Main Client
 *
 * Provides browser-based auction creation for publishers.
 */

import type {
  PublisherConfig,
  AdExSDKConfig,
  AuctionOptions,
  AuctionResponse,
  AuctionResponseWithResult,
  AuctionResult,
  FetchResultOptions,
  UserContext,
} from "./types";
import { PUBLISHER_CONFIG, DEFAULT_API_URL, DEFAULT_TIMEOUT } from "./config";

/**
 * Main AdEx Client for browsers
 */
export class AdExClient {
  private config: {
    apiUrl: string;
    timeout: number;
    debug: boolean;
    publisherId?: string;
    domain?: string;
    adSlots?: Record<string, string>;
    selector?: string;
    observer?: {
      root?: Element;
      rootMargin?: string;
      threshold?: number | number[];
    };
  };
  private publisher: PublisherConfig;
  private observer: IntersectionObserver | null = null;
  private observedElement: Element | null = null;
  private defaultAuctionOptions: AuctionOptions;

  /**
   * Create a new AdEx client
   *
   * @param config - SDK configuration options (including publisherId, domain, adSlots)
   */
  constructor(config: AdExSDKConfig = {}) {
    this.config = {
      apiUrl: config.apiUrl ?? DEFAULT_API_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      debug: config.debug ?? false,
      publisherId: config.publisherId,
      domain: config.domain,
      adSlots: config.adSlots,
      selector: config.selector,
      observer: config.observer,
    };

    // Build publisher config - use config overrides if provided, otherwise use embedded defaults
    this.publisher = {
      id: this.config.publisherId ?? PUBLISHER_CONFIG.id,
      domain: this.config.domain ?? PUBLISHER_CONFIG.domain,
      defaultFloorPrice: PUBLISHER_CONFIG.defaultFloorPrice ?? 0.01,
      adSlots: { ...PUBLISHER_CONFIG.adSlots, ...this.config.adSlots },
    };

    // Store default auction options (will be used when intersection triggers)
    this.defaultAuctionOptions = {
      adSlotType: "banner", // Default, can be overridden via observe()
      publisherId: this.publisher.id,
      domain: this.publisher.domain,
    };

    if (this.config.debug) {
      console.log("[AdExSDK] Initialized", {
        publisherId: this.publisher.id,
        domain: this.publisher.domain,
        apiUrl: this.config.apiUrl,
        adSlots: Object.keys(this.publisher.adSlots),
      });
    }

    // Auto-start observing if selector is provided
    if (this.config.selector && typeof window !== "undefined") {
      // Wait for DOM to be ready
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.autoObserve());
      } else {
        this.autoObserve();
      }
    }
  }

  /**
   * Auto-start observing (called from constructor when selector is provided)
   */
  private autoObserve(): void {
    if (!this.config.selector) return;
    this.observe({ adSlotType: "banner" }, this.config.selector);
  }

  /**
   * Start observing an element for intersection
   *
   * @param options - Auction options to use when element enters viewport
   * @param selector - CSS selector for element to watch (uses config selector if not provided)
   */
  observe(options: AuctionOptions, selector?: string): void {
    if (
      typeof window === "undefined" ||
      typeof IntersectionObserver === "undefined"
    ) {
      if (this.config.debug) {
        console.warn(
          "[AdExSDK] IntersectionObserver not supported in this environment"
        );
      }
      return;
    }

    const targetSelector = selector ?? this.config.selector;
    if (!targetSelector) {
      if (this.config.debug) {
        console.error("[AdExSDK] No selector provided for observation");
      }
      return;
    }

    // Find the target element
    const element = document.querySelector(targetSelector);
    if (!element) {
      if (this.config.debug) {
        console.error(
          `[AdExSDK] Element not found for selector: "${targetSelector}"`
        );
      }
      return;
    }

    // Disconnect existing observer if any
    this.unobserve();

    // Store auction options and element
    this.defaultAuctionOptions = options;
    this.observedElement = element;

    // Setup Intersection Observer
    const observerOptions: IntersectionObserverInit = {
      root: this.config.observer?.root ?? null,
      rootMargin: this.config.observer?.rootMargin ?? "0px",
      threshold: this.config.observer?.threshold ?? 0.1,
    };

    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (this.config.debug) {
            console.log(
              "[AdExSDK] Element entered viewport, triggering auction"
            );
          }
          this.createAuction(this.defaultAuctionOptions);
          // Unobserve after first trigger to prevent duplicate auctions
          this.unobserve();
          break;
        }
      }
    }, observerOptions);

    this.observer.observe(element);

    if (this.config.debug) {
      console.log("[AdExSDK] Now observing element:", targetSelector);
    }
  }

  /**
   * Stop observing the current element
   */
  unobserve(): void {
    if (this.observer && this.observedElement) {
      this.observer.unobserve(this.observedElement);
      this.observer.disconnect();
      this.observer = null;
      this.observedElement = null;

      if (this.config.debug) {
        console.log("[AdExSDK] Stopped observing");
      }
    }
  }

  /**
   * Check if currently observing an element
   *
   * @returns true if observing, false otherwise
   */
  isObserving(): boolean {
    return this.observer !== null;
  }

  /**
   * Create a new auction
   *
   * @param options - Auction options (can override publisherId, domain, adSlotId per call)
   * @returns Promise with auction response (including result if auction was accepted)
   */
  async createAuction(options: AuctionOptions): Promise<AuctionResponseWithResult> {
    const startTime = performance.now();

    // Use per-call overrides or fall back to client config
    const publisherId = options.publisherId ?? this.publisher.id;
    const domain = options.domain ?? this.publisher.domain;

    // Get ad slot ID - from options, then from config, then error
    let adSlotId =
      options.adSlotId ?? this.publisher.adSlots[options.adSlotType];
    if (!adSlotId) {
      const error: AuctionResponseWithResult = {
        auctionId: "",
        status: "rejected",
        createdAt: Date.now(),
        errorCode: "INVALID_AD_SLOT_TYPE",
        errorMessage: `Ad slot type "${options.adSlotType}" not configured. Pass adSlotId directly or configure it in adSlots.`,
        result: undefined,
      };
      if (this.config.debug) {
        console.error("[AdExSDK] Error:", error);
      }
      return error;
    }

    // Auto-detect user context if not provided
    const userContext = options.userContext || this.detectUserContext();

    // Build request
    const request = {
      publisherId,
      domain,
      adSlotId,
      adSlotType: options.adSlotType,
      floorPrice:
        options.floorPrice ?? this.publisher.defaultFloorPrice ?? 0.01,
      userContext,
    };

    if (this.config.debug) {
      console.log("[AdExSDK] Creating auction:", request);
    }

    try {
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(this.config.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AuctionResponse = await response.json();
      const elapsed = performance.now() - startTime;

      if (this.config.debug) {
        console.log(
          `[AdExSDK] Auction created in ${elapsed.toFixed(2)}ms:`,
          data
        );
      }

      // If auction was accepted and has an ID, fetch the result
      if (
        data.status === "accepted" ||
        (data.auctionId && data.auctionId.length > 0)
      ) {
        const result = await this.fetchAuctionResult(data.auctionId);
        return { ...data, result };
      }

      return { ...data, result: undefined };
    } catch (error) {
      const elapsed = performance.now() - startTime;
      const errorMessage = (error as Error).message;

      if (this.config.debug) {
        console.error(
          `[AdExSDK] Error after ${elapsed.toFixed(2)}ms:`,
          errorMessage
        );
      }

      return {
        auctionId: "",
        status: "rejected",
        createdAt: Date.now(),
        errorCode: "NETWORK_ERROR",
        errorMessage,
        result: undefined,
      };
    }
  }

  /**
   * Auto-detect user context from browser
   *
   * @returns Detected user context
   */
  private detectUserContext(): UserContext {
    const context: UserContext = {
      userAgent: navigator.userAgent,
    };

    // Detect country code (from locale)
    const locale = navigator.language || "en-US";
    context.countryCode = locale.split("-")[1]?.toUpperCase() || "US";

    // Detect device type
    const userAgent = navigator.userAgent;
    if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) {
      context.device = /Tablet|iPad/i.test(userAgent) ? "tablet" : "mobile";
    } else {
      context.device = "desktop";
    }

    // Detect OS
    if (/Windows/i.test(userAgent)) context.os = "Windows";
    else if (/Macintosh|Mac OS/i.test(userAgent)) context.os = "macOS";
    else if (/Android/i.test(userAgent)) context.os = "Android";
    else if (/iOS|iPhone|iPad/i.test(userAgent)) context.os = "iOS";
    else if (/Linux/i.test(userAgent)) context.os = "Linux";

    // Detect browser
    if (/Chrome/i.test(userAgent) && !/Edg|OPR/i.test(userAgent)) {
      context.browser = "Chrome";
    } else if (/Firefox/i.test(userAgent)) {
      context.browser = "Firefox";
    } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
      context.browser = "Safari";
    } else if (/Edg/i.test(userAgent)) {
      context.browser = "Edge";
    } else if (/OPR|Opera/i.test(userAgent)) {
      context.browser = "Opera";
    }

    return context;
  }

  /**
   * Fetch auction result via long polling
   *
   * @param auctionId - The auction ID to fetch results for
   * @param options - Optional configuration
   * @returns Auction result
   */
  private async fetchAuctionResult(
    auctionId: string,
    options?: FetchResultOptions
  ): Promise<AuctionResult> {
    const startTime = performance.now();
    const maxWaitTime = options?.maxWaitTime ?? 300;

    // Default timeout response
    const timeoutResponse: AuctionResult = { status: "timeout" };

    // Build result URL
    // apiUrl is like "http://localhost:3003/api/auctions"
    // We need "http://localhost:3003/api/auctions/{auctionId}/result"
    const baseUrl = this.config.apiUrl.replace(/\/$/, ""); // Remove trailing slash
    const resultUrl = `${baseUrl}/${auctionId}/result?wait=1&timeout=250`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), maxWaitTime);

    try {
      if (this.config.debug) {
        console.log("[AdExSDK] Fetching auction result:", { auctionId, resultUrl });
      }

      const response = await fetch(resultUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (this.config.debug) {
          console.warn(
            `[AdExSDK] Result fetch returned ${response.status}, returning timeout`
          );
        }
        return timeoutResponse;
      }

      const data = (await response.json()) as AuctionResult;
      const elapsed = performance.now() - startTime;

      if (this.config.debug) {
        console.log(
          `[AdExSDK] Auction result fetched in ${elapsed.toFixed(2)}ms:`,
          data
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // AbortError means timeout - expected behavior
      if (error instanceof Error && error.name === "AbortError") {
        if (this.config.debug) {
          console.log("[AdExSDK] Auction result fetch timed out after 300ms");
        }
        return timeoutResponse;
      }

      // Other errors - return error status
      if (this.config.debug) {
        console.error("[AdExSDK] Error fetching auction result:", error);
      }

      return { status: "error" };
    }
  }

  /**
   * Get publisher configuration (read-only)
   */
  getPublisherConfig(): Readonly<PublisherConfig> {
    return { ...this.publisher };
  }

  /**
   * Update SDK configuration
   *
   * @param config - New configuration values
   */
  setConfig(config: Partial<AdExSDKConfig>): void {
    if (config.apiUrl !== undefined) this.config.apiUrl = config.apiUrl;
    if (config.timeout !== undefined) this.config.timeout = config.timeout;
    if (config.debug !== undefined) this.config.debug = config.debug;

    // Update publisher config if provided
    if (config.publisherId !== undefined) {
      this.publisher.id = config.publisherId;
    }
    if (config.domain !== undefined) {
      this.publisher.domain = config.domain;
    }
    if (config.adSlots !== undefined) {
      this.publisher.adSlots = { ...this.publisher.adSlots, ...config.adSlots };
    }
  }
}

/**
 * Create a simple auction helper function
 * For quick one-off auction creation
 *
 * @param adSlotType - The ad slot type
 * @param options - Additional auction options (including publisherId, domain, adSlotId)
 * @returns Promise with auction response
 */
export async function createAuction(
  adSlotType: string,
  options?: Omit<AuctionOptions, "adSlotType">
): Promise<AuctionResponseWithResult> {
  const client = new AdExClient();
  return client.createAuction({ adSlotType, ...options });
}
