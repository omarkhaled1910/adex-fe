import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, publisherId, adSlotType, userContext } = body;

    if (!campaignId || !publisherId) {
      return NextResponse.json(
        { error: "campaignId and publisherId are required" },
        { status: 400 }
      );
    }

    // Get campaign details
    const campaigns = await query<{
      id: string;
      name: string;
      status: string;
      total_budget: number;
      spent_amount: number;
      daily_budget: number;
      max_bid: number;
      start_date: Date;
      end_date: Date;
      target_publishers: string[];
      target_ad_slots: string[];
      target_geos: string[];
      target_devices: string[];
      target_os: string[];
      target_browsers: string[];
      active_hours: number[];
      active_days: number[];
    }>(
      `
      SELECT
        id, name, status, total_budget, spent_amount, daily_budget, max_bid,
        start_date, end_date, target_publishers, target_ad_slots,
        target_geos, target_devices, target_os, target_browsers,
        active_hours, active_days
      FROM campaigns
      WHERE id = $1
      `,
      [campaignId]
    );

    const campaign = campaigns[0];
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Get publisher details
    const publishers = await query<{
      id: string;
      domain: string;
      status: string;
      tier: string;
      domain_verified: boolean;
    }>(
      `
      SELECT id, domain, status, tier, domain_verified
      FROM publishers
      WHERE id = $1
      `,
      [publisherId]
    );

    const publisher = publishers[0];
    if (!publisher) {
      return NextResponse.json(
        { error: "Publisher not found" },
        { status: 404 }
      );
    }

    // Get today's spend for daily budget check
    const dailySpend = await query<{
      spent: number;
    }>(
      `
      SELECT COALESCE(spent, 0) as spent
      FROM daily_budget_tracking
      WHERE campaign_id = $1 AND date = CURRENT_DATE
      `,
      [campaignId]
    );

    const todaySpend = parseFloat(dailySpend[0]?.spent as unknown as string || "0");

    // Run eligibility checks
    const checks: Record<
      string,
      { pass: boolean; reason: string; details?: any }
    > = {};

    const reasons: string[] = [];
    let isEligible = true;

    // 1. Status check
    const statusPass = campaign.status === "active";
    checks.status = {
      pass: statusPass,
      reason: statusPass
        ? "Campaign is active"
        : `Campaign status is ${campaign.status}`,
    };
    if (!statusPass) {
      isEligible = false;
      reasons.push(`Campaign not active (current: ${campaign.status})`);
    }

    // 2. Date range check
    const now = new Date();
    const startDate = new Date(campaign.start_date);
    const endDate = campaign.end_date ? new Date(campaign.end_date) : null;

    const dateRangePass =
      startDate <= now &&
      (!endDate || endDate >= now);
    checks.dateRange = {
      pass: dateRangePass,
      reason: dateRangePass
        ? "Within campaign date range"
        : startDate > now
        ? `Campaign hasn't started yet (starts: ${startDate.toLocaleDateString()})`
        : `Campaign has ended (ended: ${endDate?.toLocaleDateString()})`,
      details: {
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        now: now.toISOString(),
      },
    };
    if (!dateRangePass) {
      isEligible = false;
      reasons.push(checks.dateRange.reason);
    }

    // 3. Total budget check
    const remainingBudget = campaign.total_budget - campaign.spent_amount;
    const budgetPass = remainingBudget > campaign.max_bid;
    checks.budget = {
      pass: budgetPass,
      reason: budgetPass
        ? `Sufficient budget ($${remainingBudget.toFixed(4)} remaining)`
        : `Insufficient budget ($${remainingBudget.toFixed(4)} remaining, need $${campaign.max_bid})`,
      details: {
        totalBudget: campaign.total_budget,
        spentAmount: campaign.spent_amount,
        remainingBudget,
        maxBid: campaign.max_bid,
      },
    };
    if (!budgetPass) {
      isEligible = false;
      reasons.push(checks.budget.reason);
    }

    // 4. Daily budget check
    if (campaign.daily_budget) {
      const remainingDaily = campaign.daily_budget - todaySpend;
      const dailyBudgetPass = remainingDaily > campaign.max_bid;
      checks.dailyBudget = {
        pass: dailyBudgetPass,
        reason: dailyBudgetPass
          ? `Sufficient daily budget ($${remainingDaily.toFixed(4)} remaining)`
          : `Insufficient daily budget ($${remainingDaily.toFixed(4)} remaining)`,
        details: {
          dailyBudget: campaign.daily_budget,
          todaySpend,
          remainingDaily,
          maxBid: campaign.max_bid,
        },
      };
      if (!dailyBudgetPass) {
        isEligible = false;
        reasons.push(checks.dailyBudget.reason);
      }
    } else {
      checks.dailyBudget = { pass: true, reason: "No daily budget set" };
    }

    // 5. Publisher targeting check
    if (
      campaign.target_publishers &&
      campaign.target_publishers.length > 0
    ) {
      const publisherPass = campaign.target_publishers.includes(publisherId) ||
        campaign.target_publishers.some((target) => {
          // Check for wildcard subdomain matching
          if (target.includes("*")) {
            const pattern = target.replace("*", "");
            return publisher.domain?.endsWith(pattern) ||
              publisher.domain?.endsWith(pattern.replace(/^\./, ""));
          }
          return publisher.domain === target;
        });

      checks.publisherTargeting = {
        pass: publisherPass,
        reason: publisherPass
          ? "Publisher is in targeting list"
          : `Publisher not in targeting list (domain: ${publisher.domain})`,
        details: {
          targetPublishers: campaign.target_publishers,
          publisherDomain: publisher.domain,
        },
      };
      if (!publisherPass) {
        isEligible = false;
        reasons.push(checks.publisherTargeting.reason);
      }
    } else {
      checks.publisherTargeting = {
        pass: true,
        reason: "No publisher targeting restrictions",
      };
    }

    // 6. Ad slot targeting check
    if (
      campaign.target_ad_slots &&
      campaign.target_ad_slots.length > 0 &&
      adSlotType
    ) {
      const adSlotPass = campaign.target_ad_slots.includes(adSlotType);
      checks.adSlotTargeting = {
        pass: adSlotPass,
        reason: adSlotPass
          ? "Ad slot type is allowed"
          : `Ad slot type not in targeting list (requested: ${adSlotType})`,
        details: {
          targetAdSlots: campaign.target_ad_slots,
          requestedSlot: adSlotType,
        },
      };
      if (!adSlotPass) {
        isEligible = false;
        reasons.push(checks.adSlotTargeting.reason);
      }
    } else {
      checks.adSlotTargeting = {
        pass: true,
        reason: "No ad slot targeting restrictions",
      };
    }

    // 7. Geo targeting check
    if (
      campaign.target_geos &&
      campaign.target_geos.length > 0 &&
      userContext?.countryCode
    ) {
      const geoPass = campaign.target_geos.includes(userContext.countryCode);
      checks.geoTargeting = {
        pass: geoPass,
        reason: geoPass
          ? "Country is in targeting list"
          : `Country not in targeting list (requested: ${userContext.countryCode})`,
        details: {
          targetGeos: campaign.target_geos,
          requestedCountry: userContext.countryCode,
        },
      };
      if (!geoPass) {
        isEligible = false;
        reasons.push(checks.geoTargeting.reason);
      }
    } else {
      checks.geoTargeting = {
        pass: true,
        reason: "No geo targeting restrictions",
      };
    }

    // 8. Device targeting check
    if (
      campaign.target_devices &&
      campaign.target_devices.length > 0 &&
      userContext?.device
    ) {
      const devicePass = campaign.target_devices.includes(userContext.device);
      checks.deviceTargeting = {
        pass: devicePass,
        reason: devicePass
          ? "Device is in targeting list"
          : `Device not in targeting list (requested: ${userContext.device})`,
        details: {
          targetDevices: campaign.target_devices,
          requestedDevice: userContext.device,
        },
      };
      if (!devicePass) {
        isEligible = false;
        reasons.push(checks.deviceTargeting.reason);
      }
    } else {
      checks.deviceTargeting = {
        pass: true,
        reason: "No device targeting restrictions",
      };
    }

    // 9. OS targeting check
    if (
      campaign.target_os &&
      campaign.target_os.length > 0 &&
      userContext?.os
    ) {
      const osPass = campaign.target_os.includes(userContext.os);
      checks.osTargeting = {
        pass: osPass,
        reason: osPass
          ? "OS is in targeting list"
          : `OS not in targeting list (requested: ${userContext.os})`,
        details: {
          targetOs: campaign.target_os,
          requestedOs: userContext.os,
        },
      };
      if (!osPass) {
        isEligible = false;
        reasons.push(checks.osTargeting.reason);
      }
    } else {
      checks.osTargeting = {
        pass: true,
        reason: "No OS targeting restrictions",
      };
    }

    // 10. Browser targeting check
    if (
      campaign.target_browsers &&
      campaign.target_browsers.length > 0 &&
      userContext?.browser
    ) {
      const browserPass = campaign.target_browsers.includes(userContext.browser);
      checks.browserTargeting = {
        pass: browserPass,
        reason: browserPass
          ? "Browser is in targeting list"
          : `Browser not in targeting list (requested: ${userContext.browser})`,
        details: {
          targetBrowsers: campaign.target_browsers,
          requestedBrowser: userContext.browser,
        },
      };
      if (!browserPass) {
        isEligible = false;
        reasons.push(checks.browserTargeting.reason);
      }
    } else {
      checks.browserTargeting = {
        pass: true,
        reason: "No browser targeting restrictions",
      };
    }

    // 11. Schedule check (hours and days)
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

    let schedulePass = true;
    let scheduleReason = "Within schedule";

    if (campaign.active_hours && campaign.active_hours.length > 0) {
      if (!campaign.active_hours.includes(currentHour)) {
        schedulePass = false;
        scheduleReason = `Current hour (${currentHour}:00) not in active hours`;
      }
    }

    if (schedulePass && campaign.active_days && campaign.active_days.length > 0) {
      if (!campaign.active_days.includes(currentDay)) {
        schedulePass = false;
        scheduleReason = `Current day (${currentDay}) not in active days`;
      }
    }

    checks.schedule = {
      pass: schedulePass,
      reason: schedulePass ? "Within campaign schedule" : scheduleReason,
      details: {
        activeHours: campaign.active_hours,
        activeDays: campaign.active_days,
        currentHour,
        currentDay,
      },
    };
    if (!schedulePass) {
      isEligible = false;
      reasons.push(checks.schedule.reason);
    }

    // 12. Publisher status check
    const publisherStatusPass = publisher.status === "active" && publisher.domain_verified;
    checks.publisherStatus = {
      pass: publisherStatusPass,
      reason: publisherStatusPass
        ? "Publisher is active and verified"
        : !publisher.domain_verified
        ? "Publisher domain not verified"
        : `Publisher status is ${publisher.status}`,
    };
    if (!publisherStatusPass) {
      isEligible = false;
      reasons.push(checks.publisherStatus.reason);
    }

    return NextResponse.json({
      isEligible,
      reasons,
      checks,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
      },
      publisher: {
        id: publisher.id,
        domain: publisher.domain,
        status: publisher.status,
      },
    });
  } catch (error) {
    console.error("Error testing eligibility:", error);
    return NextResponse.json(
      { error: "Failed to test eligibility" },
      { status: 500 }
    );
  }
}
