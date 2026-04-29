import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import WordExporter from "./components/WordExporter";
import EventIntake from "./EventIntake";

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";

const T = {
  bg:      "#F5F0E8",
  surface: "#EDE8DE",
  ink:     "#2C1810",
  accent:  "#8B5E3C",
  gold:    "#C4A050",
  muted:   "#8B7355",
  border:  "#D4C4A8",
  body:    "#5C4033",
  rule:    "rgba(44,24,16,0.12)",
};

const serif = "'Libre Baskerville', serif";
const font = "'Source Sans 3', sans-serif";
const mono = "monospace";

const ARTICLES = [
  {
    slug: "napa-lodging-pricing-2026",
    headline: "Napa Valley Adds Rooms While Demand Lags",
    publication: "Napa Valley Features",
    date: "May 2, 2026",
  },
  {
    slug: "lakeco-housing-reset-2026",
    headline: "Lake County’s Housing Reset Is Uneven — and the Labor Market Is Moving First",
    publication: "Lake County Features",
    date: "April 26, 2026",
  },
  {
    slug: "napa-constellation-2026",
    headline: "From Selling Napa to Defending It",
    publication: "Napa Valley Features",
    date: "April 22, 2026",
  },
  {
    publication: "Napa Valley Features",
    headline: "The Reset Spreads",
    deck: "Closures are moving beyond wineries into Napa\u2019s visitor economy. Transactions are becoming more defensive. The regional footprint is contracting \u2014 quietly, and across systems.",
    slug: "napa-structural-reset-2026",
    publishedAt: "2026-04-04",
  },
  {
    publication: "Napa Valley Features",
    headline: "Under the Hood: Where Napa\u2019s Growth Actually Lives",
    deck: "Napa County added 709 residents in 2024. American Canyon accounted for 639 of them. Across 25 years of state and census records, the pattern is the same: population growth concentrates in one city at the southern edge of the county, while the rest of the valley stays flat or shrinks.",
    slug: "napa-population-2025",
    publishedAt: null,
  },
  {
    publication: "Napa Valley Features",
    headline: "How a Global Supply Shock Reaches Napa Valley",
    deck: "War with Iran has cut Hormuz tanker traffic 94%. This traces the supply chain from the strait to the Napa farm gate \u2014 and shows why the local economy has less cushion than the numbers suggest.",
    slug: "napa-supply-chain-2026",
    publishedAt: "2026-03-27",
  },
  {
    publication: "Napa Valley Features",
    headline: "Napa Cabernet Prices Break the Growth Curve",
    deck: "The weighted average price of Napa County cabernet sauvignon has declined for two consecutive years \u2014 the first such decline in the modern data series.",
    slug: "napa-cab-2025",
    publishedAt: "2026-03-19",
  },
  {
    publication: "Sonoma County Features",
    headline: "Sonoma Grape Prices Fall for a Second Year",
    deck: "Sonoma County\u2019s weighted average grape price declined for the second consecutive year in 2025, with cabernet sauvignon leading the drop.",
    slug: "sonoma-cab-2025",
    publishedAt: "2026-03-21",
  },
  {
    publication: "Lake County Features",
    headline: "Lake County Grape Prices Have Fallen 38% in Two Years",
    deck: "Lake County\u2019s weighted average grape price has dropped 38% since 2023, with chardonnay prices collapsing 70% in two years.",
    slug: "lake-county-cab-2025",
    publishedAt: "2026-03-21",
  },
  {
    publication: "Napa Valley Features",
    headline: "Napa\u2019s Economy Looks Bigger Than It Is",
    deck: "Nominal GDP rose 35.8% since 2016. Real GDP grew 4.6%. Of the apparent $3.84 billion in growth, 87% was inflation \u2014 and the jobs engine has stalled.",
    slug: "napa-gdp-2024",
    publishedAt: "2026-03-24",
  },
  {
    publication: "Napa Valley Features",
    headline: "When the Price Gives Way",
    deck: "Three Napa wine-industry assets have moved through the market in ways that expose a widening gap between what sellers expected and what buyers were willing to pay. Together, they mark the first legible pattern of asset-level repricing across Napa\u2019s wine and hospitality economy.",
    slug: "napa-price-discovery-2026",
    publishedAt: "2026-04-12",
  },
];

// ─── Full article data for Word export ─────────────────────────────────────
// Body arrays use typed objects: { type: 'paragraph'|'header'|'chart', text?, number? }

const t = (text) => ({ type: "paragraph", text });
const h = (text) => ({ type: "header", text });
const c = (number) => ({ type: "chart", number });

const EXPORT_DATA = {
  "napa-lodging-pricing-2026": {
    headline: "Napa Valley Adds Rooms While Demand Lags",
    publication: "Napa Valley Features",
    deck: "Data shows Napa County hotel revenue up year to date, but gains are driven more by higher rates than by a meaningful increase in room demand. Occupancy remains well below 2019 and Napa’s year-to-date occupancy growth is the slowest among major California regions, pointing to a recovery stalled on volume even as prices hold. Against that backdrop, downtown projects are under construction and approvals continue. The result is a market expanding on the supply side while demand lags.",
    summary: "Year-to-date through March 2026, Napa County hotel revenue is up 5%, occupancy is up and ADR is up — but Napa’s 1.8% YTD occupancy growth is the slowest among major California coastal markets. The pattern visible across GDP, lodging revenue and hospitality jobs is one in which apparent growth is driven by price rather than volume. A 627-room downtown lodging pipeline — including 116 rooms under construction and 513 entitled, and a Board approval on April 28 for a 79-room luxury resort — would extend supply into a market whose visitor recovery is already lagging.",
    slug: "napa-lodging-pricing-2026",
    dateline: "NAPA VALLEY, Calif.",
    body: [
      h("Opening"),
      t("NAPA VALLEY, Calif. — Visit Napa Valley released its March 2026 lodging report this week, and the headline numbers tell a familiar story. Year-to-date through March, Napa County hotel revenue is up 5% over the same period in 2025. Occupancy is up. Average daily rate is up. RevPAR — the lodging industry’s preferred composite measure — is up 4.4%."),
      t("Read alone, those numbers describe a recovery in progress."),
      t("Read against the rest of the local data, they describe something different: a recovery whose engine is price, not visitors, and a pattern that two prior installments of this column have already begun to identify. In January 2026, this publication noted that Napa hotel revenue gains were being driven almost entirely by rate rather than volume. In March, when one month’s data showed occupancy and ADR declining together for the first time in the post-pandemic period, the column asked whether the lever could continue to carry the load. The March 2026 STR report does not answer that question. What it does is extend a record now visible on three different economic surfaces — gross domestic product, lodging revenue and hospitality jobs — and on each surface the same arithmetic is at work. Price is doing the work that volume is not."),
      t("Of every dollar of apparent growth in Napa County’s gross domestic product since 2016, roughly 87 cents was inflation. The remaining 13 cents was real output. The 87-cent figure is the one most likely to recur — and it is now recurring on a second surface, on a third, and increasingly visibly on a fourth: the supply of rooms and tasting capacity now in or moving through the pipeline."),
      c(1),
      h("A Forecast That Landed"),
      t("In [“Napa Valley finds itself between a rock and a hard place” (October 3, 2023)](https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between), this publication described a region caught between a luxury-positioning strategy and a structural decline in volume. In [“Under the Hood: Napa’s Tasting Rooms Face a Numbers Problem” (July 5, 2025)](https://napavalleyfocus.substack.com/p/under-the-hood-napas-tasting-rooms), the column ran the arithmetic of tasting rooms — what it would actually take to recover 2023 revenue at 2025 order values — and found the figures untenable. In [“Under the Hood: More Rooms Has Equaled Fewer Jobs in Napa County” (August 23, 2025)](https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled), the column documented what had happened to hospitality employment since 2019: room counts up, jobs down. In [“Under the Hood: Price Continues to Carry Napa Hotel Market as Room-Night Demand Lags” (January 9, 2026)](https://napavalleyfocus.substack.com/p/under-the-hood-price-continues-to), the column showed the same pattern in the lodging revenue line: rate up, demand sluggish. In [“Under the Hood: When Room Price Can No Longer Carry the Load” (March 12, 2026)](https://napavalleyfocus.substack.com/p/when-room-price-can-no-longer-carry), the column noted the first simultaneous decline in both occupancy and ADR since the pandemic. Two weeks later, in [“Under the Hood: Napa Valley’s Economy Looks Bigger Than It Is” (March 24, 2026)](https://napaserve.org/under-the-hood/napa-gdp-2024), the column ran the GDP arithmetic. Nominal county output had risen 35.8% since 2016. Real output had risen 4.6%. The remainder was the price level adjusting upward."),
      t("Six pieces, two and a half years, one observation: the headline numbers describing Napa’s economy are mostly about price. The volume underneath them has not moved much."),
      t("What changed in April 2026 is that another quarter’s lodging data became available and confirmed the pattern is still operating — alongside an active hotel pipeline that, on paper, could substantially expand supply over the next several years."),
      h("The Three Surfaces"),
      t("**Surface one: gross domestic product.** Napa County’s nominal GDP rose from $10.75 billion in 2016 to $14.59 billion in 2024, an apparent gain of $3.84 billion. Adjusted for inflation, the same economy grew 4.6% — a real increase of roughly $500 million. The gap, about $3.34 billion or 87% of the apparent growth, was the price level adjusting upward. The county’s deflator rose 29% since 2017. A worker earning the county’s 2022 average wage of $67,518 needs roughly $87,000 today to maintain equivalent purchasing power. From the county’s perspective, nominal revenues, sales tax receipts and transient occupancy collections look stable. From a worker’s perspective, the same dollars buy substantially less. Both are true simultaneously."),
      c(6),
      t("**Surface two: lodging revenue.** Through March 2026, Napa County hotels sold 258,248 room-nights, an increase of 2.3% over the same period last year. Total revenue rose 5% to $88.0 million. Average daily rate rose 2.6%. Supply expanded 0.5%. Revenue per available room rose 4.4%, and most of that increase reflects what hotels charged rather than how many rooms they sold. Earlier installments in this series demonstrated the same pattern at the annual level: in 2025, hotel revenue exceeded recent years even though demand was below pre-pandemic baselines. The Q1 2026 figures continue that trajectory. Napa County’s YTD occupancy at 54.4% remains roughly 17 percentage points below the 71.1% recorded in 2019."),
      h("The Best Year Since 2019 Was Still Below 2019"),
      t("The most recent year on the books was also the strongest since the pandemic. Napa County hotels sold 1,253,064 room-nights in 2025, the highest annual demand since 2019 and a 2.5% gain over 2024. Occupancy reached 64.6%, a six-year high. ADR climbed to $422.52, a six-year high. Revenue reached $529.4 million, a six-year high. And demand still finished 4.4% below 2019, against supply that has grown 5.2% over the same period. The strongest year of the recovery did not return the county to where it started. It returned the county to 95.6% of where it started, with rates 29% higher."),
      t("The shape of that gap is seasonal. Through 2025, only one month — October — exceeded its 2019 demand baseline, at 103%. Five months landed within four points of 2019. The recovery is concentrated in fall and softens at the shoulders. January and February closed the year at 87% and 86% of 2019, the deepest gap in any month. Spring sits in between. The pattern is consistent with what high-end leisure travel markets have shown across coastal California: peak season is intact, off-season is not."),
      c(5),
      c(2),
      t("**Surface three: hospitality employment.** Between 2019 and 2025, Napa County added approximately 382 hotel rooms — a 7.6% increase in lodging supply. During the same period, the leisure and hospitality sector lost approximately 200 jobs, and the restaurant and bar subsector lost approximately 470 jobs. The combined figure is 670 jobs subtracted from the visitor economy while 382 rooms were added to it. From 2009 through 2019, more rooms in Napa County had reliably meant more jobs. Since 2019, that relationship has reversed. Larger resorts operate with leaner per-guest staffing. On-property dining, retail and tasting capture spending that previously circulated to independent operators. Higher per-room revenue can coexist with — and contribute to — fewer per-room jobs."),
      c(7),
      t("Three surfaces. One arithmetic."),
      c(3),
      h("What’s Different in 2026"),
      t("The March 2026 STR report contains a more positive single-month line. Napa County’s March-only occupancy was up 1.2%, ADR up 4.9% and RevPAR up 6.2%. Visit Napa Valley’s commentary attributed coastal-region strength to a March heatwave. The single-month bounce is real. The contextual problem is harder."),
      t("Year-to-date through March, Napa County’s occupancy growth of 1.8% is the smallest of any major coastal California market. San Francisco’s YTD occupancy is up 13.8%. Sonoma is up 7.0%. Monterey is up 6.4%. San Luis Obispo is up 5.4%. Santa Barbara is up 4.0%. The competitive set is recovering on visitors. Napa is recovering on price. A 12-percentage-point gap between gateway-market occupancy growth and Napa County occupancy growth in the same quarter does not resolve as a one-month weather story."),
      t("What is unambiguously new in 2026 is the supply side. [On April 19, the San Francisco Chronicle reported](https://www.sfchronicle.com/bayarea/article/napa-downtown-hotel-room-22208332.php) that the city of Napa alone has roughly 627 existing hotel rooms downtown, 116 currently under construction and 513 additional rooms entitled — a pipeline that, on paper, could push downtown alone past 1,200 rooms. Countywide inventory could grow from approximately 5,500 rooms today to roughly 6,350 by 2030. Some of those entitled projects have languished for years; not all will clear financing. But the direction is clear: more rooms are being approved into a market whose YTD occupancy is the lowest in coastal California."),
      t("[City of Napa figures attached to the largest of those projects](https://www.cityofnapa.org/m/newsflash/Home/Detail/908) — the 161-room First Street Phase II hotel and 78-unit residential condominium development on the former Kohl’s site, which broke ground in late 2025 and is projected to open in 2027 — anticipate roughly 177 daily full-time-equivalent jobs and approximately $5.2 million in annual transient occupancy tax revenue during the first five years of operation. The fiscal case to the city is straightforward and substantial. Whether the regional jobs ratio holds is a different question. [The August 2025 analysis in this series](https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled) found that the rooms-to-jobs relationship reversed after 2019, and the most recent monthly employment data has not yet shown that reversal correcting."),
      t("The on-record industry view differs sharply. [Linsey Gallagher, president and CEO of Visit Napa Valley, told the Chronicle](https://www.sfchronicle.com/bayarea/article/napa-downtown-hotel-room-22208332.php) that Napa Valley’s limited supply makes it “a boutique but high-impact” destination, and that the region can take on more lodging without oversaturation. [Napa Mayor Scott Sedgley, walking through the construction-active downtown corridor, told the Chronicle](https://www.sfchronicle.com/bayarea/article/napa-downtown-hotel-room-22208332.php) that “just like grapes, a town will shrivel up if you don’t harvest what you have.”"),
      t("The most concrete recent statement of the price strategy, however, is the renovation that reopened on April 20. Robert Mondavi Winery, owned by Constellation Brands, returned to public visitation this week after a three-year closure and a renovation that [San Francisco Chronicle wine reporter Jess Lander described](https://www.sfchronicle.com/food/wine/article/robert-mondavi-winery-california-22198118.php) as “the most exhaustive, expensive and beautiful transformation Wine Country has ever seen.” Lander reported that the entry-level tasting fee rose from $45 to $60, a 33% increase. The food and wine offering runs $95. The full tour and tasting runs $150. Mondavi’s parent company has, over the past two years, sold off Woodbridge and most of its lower-priced wine brands and laid off more than 200 workers at a major production facility. The reopening of Mondavi at higher price points, into a county where YTD occupancy is the slowest-growing on the coast, is the price strategy made physical."),
      t("A second outside-the-publication confirmation arrived this week — and from the trade itself. [In Forbes, Noel Burgess described](https://www.forbes.com/sites/noelburgess/2026/04/24/downtown-napa-wine-tasting-without-reservations-is-changing-napa/) downtown Napa’s tasting-room model as a structural shift toward walkable, no-reservation, lower-cost formats. [The North Bay Business Journal reported the same week](https://www.pressdemocrat.com/2026/04/15/napa-county-winery-vineyard-land-use-policy/) that one of the 23 immediate reforms in [the four-trade-group petition filed with the Napa County Board of Supervisors on April 14](https://www.pressdemocrat.com/2026/04/15/napa-county-winery-vineyard-land-use-policy/) is a request to modify the county’s “by appointment only” signage requirement, allowing winery tasting rooms to welcome walk-in visitors. [Michelle Novi, counsel and senior director of industry relations at Napa Valley Vintners, told the Press Democrat](https://www.pressdemocrat.com/2026/04/15/napa-county-winery-vineyard-land-use-policy/) the change reflected a practical adjustment to match visitor expectations with current operations. “It’s not 1990 anymore, and what served us then may not still entirely serve us now,” she said. The 1990 framework was built when visitor demand outpaced capacity. Today’s framework adjustment is being requested for the opposite reason. The appointment-only model was a feature of the high-rate luxury strategy. Letting it go is the trade itself acknowledging the strategy now has a ceiling."),
      t("Industry data published this month by Terrain, the research division of American AgCredit, reaches a similar conclusion. The report notes that direct-to-consumer bottle prices rose 11% in 2025 alone and are now 40% higher than in 2019, against a 26% rise in the consumer price index. The report’s author observes that “tasting room fees and wine country travel costs have also risen sharply in the 2020s,” and concludes that the experience “has become more exclusive and may be out of reach for less affluent consumers and young adults.” The Winescape report comes from inside the agricultural-finance establishment. It describes the same arithmetic this column has been describing since 2023."),
      t("The supply pipeline is committed to more rooms, more capacity, and higher price points. The data shows that none of those choices is closing the gap between Napa and its peers on the metric most directly tied to visitors: occupancy growth."),
      c(4),
      h("What to Watch"),
      t("Five tests in the next ninety days will indicate whether the pattern is bending or extending."),
      t("**The Inn at the Abbey approval.** On April 28, [the Napa County Board of Supervisors approved](https://napa.legistar.com/LegislationDetail.aspx?ID=7991995&GUID=1347882E-CF19-46F6-B74B-0B3B88630C13&FullText=1) Jackson Family Investments III, LLC’s proposed 79-room hotel complex along Lodi Lane and Highway 29 just north of St. Helena, certifying the Final Environmental Impact Report and adopting CEQA findings. The approval authorizes demolition of existing structures and 78,500 square feet of new construction across six parcels totaling 15.13 acres. [Three substantive commitments are layered into the Development Agreement](https://napa.legistar.com/View.ashx?M=F&ID=15410707&GUID=9D28317D-C725-4EF5-98E0-A508DF952124): five new off-site affordable housing units in Napa County in lieu of housing fees, a $250,000 contribution to county fuel-reduction efforts paid over five years and a sustainability and groundwater-monitoring package including evapotranspiration sensors shared with the Napa County Groundwater Sustainability Agency, a public-facing air quality monitor and minimum LEED Gold construction. The Planning Commission had earlier issued a unanimous 4–0 advisory recommendation. Staff had identified a Reduced Development Alternative — a 63-room version, roughly 20% smaller — as environmentally superior; the Board approved the larger configuration. The vote ratifies the supply-expansion direction this article describes: a luxury resort at full proposed scale, moving forward into a market whose YTD occupancy growth is the slowest among major California coastal destinations."),
      t("**The April–June STR sequence.** A single warm month does not establish a trajectory. Q2 data will show whether the YTD recovery is rate-dependent or whether visitor counts begin to close the gap with coastal comps."),
      t("**Tasting room order values.** Terrain’s industry report shows tasting room average order value flat in 2025 and revenue per visitor flat. The 2026 first-half data will indicate whether downtown and estate operators are capturing recovered spending — or whether [the price ceiling described in the July 2025 piece](https://napavalleyfocus.substack.com/p/under-the-hood-napas-tasting-rooms) is now binding at a lower level."),
      t("**Hospitality employment.** The Bureau of Labor Statistics’ Napa County leisure and hospitality series will tell the third surface’s story month-by-month through the spring. A continued widening of the rooms-added-to-jobs-lost gap would confirm the inversion is durable rather than cyclical, including as the First Street Phase II project moves toward its 2027 opening."),
      t("**The May 9 follow-up.** This piece is the fourth installment of an April–May series. The next installment will examine the structural arithmetic of the marketing infrastructure that underwrote the strategy whose limits this piece describes — Napa Valley Vintners’ tax filings, Visit Napa Valley’s transient occupancy tax budget, and the disproportion between Napa’s share of California wine licenses and California wine production."),
      t("Eighty-seven cents of every dollar of apparent growth has been price. The remaining thirteen cents has been the part of the economy that creates jobs, supports tax bases and circulates back to local operators. That ratio held through a decade of nominal expansion. Where it settles next, with more than 500 entitled rooms still moving through the city of Napa pipeline alone, will determine whether the next decade looks like the last one — or doesn’t."),
    ],
    pullQuote: "Eighty-seven cents of every dollar of apparent growth has been price.",
    captions: [
      { number: 1, title: "Three surfaces, one pattern: Napa County, 2016–2026", description: "Across GDP, lodging revenue and hospitality jobs, the post-2019 decade has produced apparent growth driven by price, not volume", source: "Bureau of Economic Analysis (FRED); Smith Travel Research data via Visit Napa Valley monthly reports; Bureau of Labor Statistics" },
      { number: 2, title: "Demand and rate, indexed to 2019", description: "Across six years, ADR rose 29% while demand fell 4%. The two lines diverged in 2021 and have not reconverged", source: "Smith Travel Research data via Visit Napa Valley monthly reports" },
      { number: 3, title: "Year-to-date March 2026 occupancy growth, California coastal markets", description: "Napa’s 1.8% trails every major peer, including Sonoma at 7.0% and San Francisco at 13.8%", source: "Smith Travel Research data via Visit Napa Valley monthly reports" },
      { number: 4, title: "Three-surface scenario calculator", description: "Adjust the rate and visitor sliders to model first-order changes to lodging revenue, hospitality jobs and indirect GDP impact. Asset base: Q1 2026 STR data", source: "Napa Valley Features analysis based on Smith Travel Research data, BLS, and BEA" },
      { number: 5, title: "Monthly pace to 2019", description: "Each bar shows 2025 demand as a share of 2019 demand for that month. Only October exceeded the 2019 baseline. January and February remained the weakest months", source: "Smith Travel Research, December 2025 YTD report (Visit Napa Valley)" },
      { number: 6, title: "Nominal vs. Real GDP — Napa County, 2016–2024", description: "Nominal GDP (blue) vs. real GDP in chained 2017 dollars (green), with inflation gap shaded. Filename: chart-gdp_napa-lodging-pricing-2026_nvf.png", source: "Bureau of Economic Analysis via FRED — GDPALL06055 (nominal), REALGDPALL06055 (real)" },
      { number: 7, title: "Napa MSA leisure and hospitality employment: 12-month trailing average vs. projected (2009–2035)", description: "The trailing average rose from roughly 8,900 in 2009 to 13,600 in mid-2019, a trend that implied roughly 21,500 jobs by 2035 if continued. Instead, the trailing average plateaued near 13,300 in 2025, leaving a substantial gap relative to that earlier trend. Filename: chart-bls-trendlines_napa-lodging-pricing-2026_nvf.png", source: "BLS (NAPA906LEIHN), author’s analysis" },
    ],
    relatedCoverage: [
      { title: "\"When Room Price Can No Longer Carry the Load\"", publication: "Napa Valley Features", date: "March 12, 2026", url: "https://napavalleyfocus.substack.com/p/when-room-price-can-no-longer-carry" },
      { title: "\"Under the Hood: Napa Valley’s Economy Looks Bigger Than It Is\"", publication: "Napa Valley Features", date: "March 24, 2026", url: "https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-economy" },
      { title: "\"Under the Hood: More Rooms Has Equaled Fewer Jobs in Napa County\"", publication: "Napa Valley Features", date: "August 23, 2025", url: "https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled" },
      { title: "\"Under the Hood: Napa’s Tasting Rooms Face a Numbers Problem\"", publication: "Napa Valley Features", date: "July 5, 2025", url: "https://napavalleyfocus.substack.com/p/under-the-hood-napas-tasting-rooms" },
    ],
    substackPolls: [
      {
        question: "What best explains Napa’s recent lodging revenue gains?",
        options: [
          "More visitors are coming",
          "Same visitors paying higher rates",
          "A few luxury travelers paying more",
          "A temporary post-pandemic pattern",
          "Too soon to tell",
        ],
      },
      {
        question: "When did you last book a Napa hotel or inn?",
        options: [
          "In the past 6 months",
          "6 to 18 months ago",
          "18 months to 3 years ago",
          "More than 3 years ago",
          "I have not booked one",
        ],
      },
      {
        question: "What happens to Napa lodging rates over the next 12 months?",
        options: [
          "Continue rising",
          "Hold roughly steady",
          "Soften 5 to 10%",
          "Drop sharply",
          "Luxury holds, mid-tier falls",
        ],
      },
    ],
    sources: [
      "Tim Carl, [\"Napa Valley Finds Itself Between a Rock and a Hard Place,\"](https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between) Napa Valley Features, October 3, 2023.",
      "Tim Carl, [\"Under the Hood: Napa’s Tasting Rooms Face a Numbers Problem,\"](https://napavalleyfocus.substack.com/p/under-the-hood-napas-tasting-rooms) Napa Valley Features, July 5, 2025.",
      "Tim Carl, [\"Under the Hood: More Rooms Has Equaled Fewer Jobs in Napa County,\"](https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled) Napa Valley Features, August 23, 2025.",
      "Tim Carl, [\"Under the Hood: Price Continues to Carry Napa Hotel Market,\"](https://napavalleyfocus.substack.com/p/under-the-hood-price-continues-to) Napa Valley Features, January 9, 2026.",
      "Tim Carl, [\"When Room Price Can No Longer Carry the Load,\"](https://napavalleyfocus.substack.com/p/when-room-price-can-no-longer-carry) Napa Valley Features, March 12, 2026.",
      "Tim Carl, [\"Under the Hood: Napa Valley’s Economy Looks Bigger Than It Is,\"](https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-economy) Napa Valley Features, March 24, 2026.",
      "Tim Carl, [\"Under the Hood: The Reset Spreads,\"](https://napavalleyfocus.substack.com/p/under-the-hood-the-reset-spreads) Napa Valley Features, April 4, 2026.",
      "Visit Napa Valley, [\"March 2026 STR Data\"](https://assets.simpleviewinc.com/simpleview/image/upload/v1/clients/napavalley/VNV_March_2026_STR_Data_b5019bb9-d1f1-44ae-a4f9-5c2c9ac8bd46.pdf) (PDF).",
      "Julie Johnson, [\"Is a hotel room boom about to reshape one of the Bay Area’s most expensive destinations?\"](https://www.sfchronicle.com/bayarea/article/napa-downtown-hotel-room-22208332.php) San Francisco Chronicle, April 19, 2026.",
      "Jess Lander, [\"Robert Mondavi has set the bar for all future winery renovations,\"](https://www.sfchronicle.com/food/wine/article/robert-mondavi-winery-california-22198118.php) San Francisco Chronicle, April 23, 2026.",
      "Angela Woodall, [\"Inn At Abbey Jackson Family 79-Room Hotel Complex Tests Napa Limits,\"](https://patch.com/california/napavalley/inn-abbey-jackson-family-79-room-hotel-complex-tests-napa-limits) Patch, April 24, 2026.",
      "Noel Burgess, [\"Downtown Napa Wine Tasting Without Reservations Is Changing Napa,\"](https://www.forbes.com/sites/noelburgess/2026/04/24/downtown-napa-wine-tasting-without-reservations-is-changing-napa/) Forbes, April 24, 2026.",
      "Jeff Quackenbush, [\"Wine groups ask Napa County for two dozen reforms to help industry survive,\"](https://www.pressdemocrat.com/2026/04/15/napa-county-winery-vineyard-land-use-policy/) Press Democrat · North Bay Business Journal, April 15, 2026.",
      "City of Napa, [\"First Street Kohl’s Redevelopment notice,\"](https://www.cityofnapa.org/m/newsflash/Home/Detail/908) January 6, 2026.",
      "Napa County Legistar File #26-215, [\"Inn at the Abbey Use Permit Modification,\"](https://napa.legistar.com/LegislationDetail.aspx?ID=7991995&GUID=1347882E-CF19-46F6-B74B-0B3B88630C13&FullText=1) April 28, 2026.",
      "Napa County, [\"Attachment D — Recommended Conditions of Approval, P19-00038-MOD\"](https://napa.legistar.com/View.ashx?M=F&ID=15410707&GUID=9D28317D-C725-4EF5-98E0-A508DF952124) (April 28, 2026 hearing).",
      "Terrain · American AgCredit, \"Winescape Spring 2026.\"",
      "Bureau of Economic Analysis via FRED — [GDPALL06055](https://fred.stlouisfed.org/series/GDPALL06055), [REALGDPALL06055](https://fred.stlouisfed.org/series/REALGDPALL06055).",
      "Bureau of Labor Statistics — [NAPA906LEIHN, SMU06349007072200001SA](https://www.bls.gov/).",
    ],
    links: [
      { label: "Read interactive version", url: "https://napaserve.org/under-the-hood/napa-lodging-pricing-2026" },
    ],
  },
  "lakeco-housing-reset-2026": {
    headline: "Lake County’s Housing Reset Is Uneven — and the Labor Market Is Moving First",
    publication: "Lake County Features",
    deck: "In Lake County, lower-priced submarkets are falling fastest — an inversion of the usual housing cycle — and the labor market moved first.",
    summary: "Lake County home values are down 3.2% year over year as of March, but the variation inside the county is wider than the headline suggests. The countywide average of $305,226 masks a spread of more than $114,000 between communities and declines that range from 0.8% in Upper Lake to 5.5% in Clearlake. Unemployment has moved more abruptly, reaching 8.2% in January 2026 — the highest of any North Bay county and nearly twice the state average. The data point to a sequencing issue: employment conditions are weakening faster than housing prices are adjusting, and the steepest declines are concentrated in the county’s lower-priced submarkets, an inversion of the usual pattern that raises questions the data do not yet answer.",
    slug: "lakeco-housing-reset-2026",
    dateline: "LAKE COUNTY, Calif.",
    body: [
      h("A County Average That Hides Local Divergence"),
      t("LAKE COUNTY, Calif. — The Zillow Home Value Index for March puts Lake County’s countywide average home value at $305,226, down 3.2% from a year earlier. That figure smooths over a wide spread among the county’s submarkets, with directional consistency masking meaningful differences in magnitude."),
      t("Zillow’s March data show three distinct tiers. Upper Lake stands at $319,003, down 0.8%. The countywide figure of $305,226 is down 3.2%. Clearlake Oaks is at $254,579, down 3.8%. Clearlake, the lowest-priced of the major submarkets, is at $204,858, down 5.5%."),
      t("The directional consistency matters — all major submarkets are declining — but the magnitude differs. Lower-priced markets are falling faster, while higher-priced areas are closer to flat. That pattern is the opposite of what conventional cycle theory predicts, where high-end discretionary buyers typically pull back first while entry-level inventory holds up. In Lake County, the inverse is happening."),
      t("This aligns with [earlier reporting](https://lakecountyfeatures.substack.com/p/under-the-hood-reading-lake-countys) that Lake County’s housing signal entering 2026 was softer but not collapsing, with homes taking roughly 65 to 85 days to go pending. It also extends the question raised in [this series’ March 9 piece on the county’s affordability edge](https://lakecountyfeatures.substack.com/p/under-the-hood-lake-countys-affordability): whether the math between local incomes and housing costs continues to compress from both sides, and whether that compression is now happening unevenly by submarket."),
      c(1),
      h("Inventory Is Not Tight Enough to Support Prices"),
      t("Countywide inventory stood at 429 listings as of March 31, with 69 new listings that month. Two additional indicators reinforce a buyer-leaning market, both as of February — the most recent month reported by Zillow: the median sale-to-list ratio is 0.981, and 57.2% of sales closed below list price. That combination — below-list transactions and extended time to pending — indicates sellers are adjusting expectations."),
      t("This is not a distressed market in the conventional sense. It is a negotiated market, where price discovery is happening transaction by transaction rather than through rapid repricing."),
      h("The Labor Market Has Moved Ahead of Housing"),
      t("The more consequential shift is not in housing — it is in employment. Unemployment in December 2025 stood at 7.7%. In January 2026, it rose to 8.2%, according to FRED series CALAKE3URN, last updated April 16. The figure was confirmed in the California Employment Development Department’s April 3 release, which reported January 2026 county-level unemployment data on a delayed schedule following last year’s federal shutdown."),
      c(2),
      t("That move reverses the late-summer improvement documented in [prior reporting](https://lakecountyfeatures.substack.com/p/under-the-hood-reading-lake-countys) and pushes the county further above neighboring labor markets. In January 2026, EDD reported Marin County at 4.2%, Sonoma at 4.6%, Napa at 4.9%, Solano at 5.5% and Mendocino at 6.5%. California’s statewide rate was 5.4%. Lake County’s 8.2% was the highest in the North Bay region and nearly twice the state figure."),
      c(3),
      t("The sequencing matters. Employment weakened first, late in 2025 and into early 2026. Housing is now adjusting, but gradually."),
      h("Price Declines Are Concentrated Where Risk Is Already High"),
      t("The geographic pattern in Zillow’s data overlaps with other stress indicators previously documented in this series. [Recent reporting](https://lakecountyfeatures.substack.com/p/under-the-hood-three-weeks-that-measured) noted that Lake County’s fiscal stress surfaced through three concurrent events in March: a 316-parcel tax-defaulted land sale, a $2.1 million clawback of overpayments to local agencies and the closure of the county’s Wellness Centers. Clearlake, which now shows the steepest home value decline at 5.5%, was identified in the March 3 Board of Supervisors discussion as carrying a disproportionate share of the county’s tax-delinquent inventory."),
      t("That linkage reinforces a key point: this is not just a housing cycle. It is a local income and balance sheet question expressing itself through housing."),
      h("What the Data Don’t Yet Explain"),
      t("The pattern visible in Zillow’s March data raises a question the available indicators cannot fully answer: why are Lake County’s lower-priced submarkets falling faster than its higher-priced ones? In a typical downturn, the opposite tends to hold — high-end discretionary buyers retreat first, while entry-level inventory finds a floor of priced-out demand. Lake County is showing the inverse."),
      t("Several explanations are plausible, and the available data do not cleanly distinguish among them. Investor exit rather than owner-occupant exit: Clearlake has historically carried significant non-owner-occupied inventory — small landlords, second-home owners and investor-held parcels. When carrying costs rise and rental yields compress, investors exit before owner-occupants do. The concentration of tax-defaulted parcels in Clearlake is consistent with this pattern. Insurance and risk-cost shock falling unevenly: California fire insurance has restructured significantly in the last 24 months, and insurance now represents a much larger share of monthly carrying cost on a $200,000 home than on a $400,000 home. When premiums rise sharply, the math breaks at the bottom of the market first. Buyer-pool composition: lower-priced inventory depends heavily on FHA and USDA financing, cash investors and first-time buyers — all of which are interest-rate sensitive in different ways. Higher-priced inventory tends to attract retirees and second-home buyers using equity from elsewhere, who are less rate-sensitive. Local income concentration: the 8.2% county unemployment figure almost certainly conceals higher rates in Clearlake specifically, and local income shock hits local home prices, particularly in submarkets where buyers and sellers tend to come from the same labor pool."),
      t("Distinguishing among these would require data this piece does not have: HMDA buyer-composition figures, owner-occupancy rates by ZIP from the Census ACS, sub-county unemployment readings and city-level insurance cost data. Those are obtainable in coming weeks. For now, the pattern itself is the finding."),
      h("Housing Is Softer — but Not Leading the Cycle"),
      t("Recent reporting in this series frames the baseline. Home values were already down roughly 3.7% to 3.9% entering early 2026. Lake County’s [district-wide weighted average grape price fell 38% between 2023 and 2025](https://lakecountyfeatures.substack.com/p/under-the-hood-lake-county-grape), according to the preliminary 2025 grape crush report. Fiscal stress surfaced in March through the tax-defaulted land sale, the $2.1 million clawback and the Wellness Center closures."),
      t("The Zillow data does not contradict that narrative. It refines it. Housing is adjusting, but not collapsing. Declines are uneven and concentrated. Labor conditions are deteriorating faster than prices."),
      h("What to Watch Next"),
      t("Three signals will help determine whether this becomes a deeper correction or stabilizes. The first is the unemployment trajectory — whether 8.2% is a peak or a midpoint. The next county-level release from EDD is expected in May, when February 2026 figures are scheduled to be published. The second is days to pending, currently around 85 days countywide; any extension signals weakening demand. The third is submarket divergence — whether Clearlake and Clearlake Oaks continue to fall faster than the county average, and whether the explanations outlined above can be tested against incoming HMDA, ACS and EDD data."),
      t("The data do not show a housing collapse. They show a lag. Lake County’s housing market is adjusting downward across all major communities, with sharper declines in lower-cost areas. At the same time, unemployment has already moved higher, reaching 8.2% in January — the highest rate among North Bay counties. The sequence — labor softening first, housing following unevenly — suggests the market is still in the early phase of repricing rather than the end of it."),
      t("Whether the next round of EDD labor data confirms 8.2% as a turning point or a midpoint is the question that will shape how the rest of the year reads."),
    ],
    pullQuote: "The data do not show a housing collapse. They show a lag.",
    captions: [
      { number: 1, title: "Lake County Submarket Home Values, March 2026", description: "All major Lake County submarkets are declining year over year, but the magnitude differs sharply — from −0.8% in Upper Lake to −5.5% in Clearlake", source: "Zillow Home Value Index (March 31, 2026)" },
      { number: 2, title: "Lake County Unemployment, January 2024 – January 2026", description: "The county’s unemployment rate fell from 8.3% in January 2024 to a three-year low of 7.0% in September 2025 before reversing to 8.2% by January 2026 — the highest level in more than two years. Reference points show January 2026 figures for neighboring counties and California. October 2025 data not reported", source: "U.S. Bureau of Labor Statistics / FRED series CALAKE3URN (updated April 16, 2026); California EDD January 2026 release (April 3, 2026)" },
      { number: 3, title: "North Bay County Unemployment, January 2026", description: "Lake County’s January 2026 unemployment rate of 8.2% is the highest in the North Bay region — nearly twice the California state rate of 5.4% and almost double Napa’s 4.9%", source: "California Employment Development Department, January 2026 county-level release (April 3, 2026)" },
    ],
    relatedCoverage: [
      { title: "\"Under the Hood: Three Weeks That Measured Lake County’s Fiscal Stress\"", publication: "Lake County Features", date: "April 13, 2026", url: "https://lakecountyfeatures.substack.com/p/under-the-hood-three-weeks-that-measured" },
      { title: "\"Under the Hood: Lake County Grape Prices Have Fallen 38% in Two Years — and Chardonnay Has Nearly Vanished\"", publication: "Lake County Features", date: "March 30, 2026", url: "https://lakecountyfeatures.substack.com/p/under-the-hood-lake-county-grape" },
      { title: "\"Under the Hood: Reading Lake County’s Early 2026 Signals\"", publication: "Lake County Features", date: "February 16, 2026", url: "https://lakecountyfeatures.substack.com/p/under-the-hood-reading-lake-countys" },
    ],
    substackPolls: [
      {
        question: "How has your housing situation in Lake County changed in the past year?",
        options: [
          "Bought a home or land",
          "Sold a home",
          "Tried to buy or sell, no deal",
          "Stayed in place, watching market",
          "Moved here or left the county",
        ],
      },
      {
        question: "Which Lake County community do you know best?",
        options: [
          "Clearlake",
          "Clearlake Oaks",
          "Kelseyville",
          "Lakeport or Upper Lake",
          "Lower Lake or Middletown",
        ],
      },
      {
        question: "What’s the biggest housing-cost headwind in Lake County?",
        options: [
          "Property tax bills",
          "Insurance premiums",
          "Mortgage rates",
          "Maintenance, aging homes",
          "Wages not keeping up",
        ],
      },
    ],
    sources: [
      "[Zillow Home Value Index, March 31, 2026 — Lake County](https://www.zillow.com/home-values/217/lake-county-ca/).",
      "[Zillow Home Value Index, March 31, 2026 — Upper Lake](https://www.zillow.com/home-values/48103/upper-lake-ca/).",
      "[Zillow Home Value Index, March 31, 2026 — Clearlake Oaks](https://www.zillow.com/home-values/55547/clearlake-oaks-ca/).",
      "[Zillow Home Value Index, March 31, 2026 — Clearlake](https://www.zillow.com/home-values/10850/clearlake-ca/).",
      "[U.S. Bureau of Labor Statistics / FRED series CALAKE3URN, updated April 16, 2026](https://fred.stlouisfed.org/series/CALAKE3URN).",
      "[California Employment Development Department, January 2026 county-level release, April 3, 2026](https://labormarketinfo.edd.ca.gov/data/unemployment-and-labor-force.html).",
      "Lake County Features, [\"Three Weeks That Measured Lake County’s Fiscal Stress,\"](https://lakecountyfeatures.substack.com/p/under-the-hood-three-weeks-that-measured) April 13, 2026.",
      "Lake County Features, [\"Lake County Grape Prices Have Fallen 38% in Two Years,\"](https://lakecountyfeatures.substack.com/p/under-the-hood-lake-county-grape) March 30, 2026.",
      "Lake County Features, [\"Lake County’s Affordability Edge and the Guenoc Question,\"](https://lakecountyfeatures.substack.com/p/under-the-hood-lake-countys-affordability) March 9, 2026.",
      "Lake County Features, [\"Reading Lake County’s Early 2026 Signals,\"](https://lakecountyfeatures.substack.com/p/under-the-hood-reading-lake-countys) February 16, 2026.",
    ],
  },
  "napa-constellation-2026": {
    headline: "From Selling Napa to Defending It",
    publication: "Napa Valley Features",
    deck: "Napa's four producer tiers are at four different stages of the same correction — and none of them yet name its cause.",
    summary: "Between April 5 and April 20, five public events revealed an industry reorienting itself under pressure. Constellation Brands reported a collapsing wine segment. A former Robert Mondavi chairman published an economic diagnosis estimating that 25% to 40% of small Napa wineries are not structurally viable. Three Napa producers won a Ninth Circuit revival of an economic-harm suit. Four trade groups filed a unified 23-reform petition with the county. And Constellation reopened Robert Mondavi Winery in Oakville after a major renovation. Each is a distinct event. Together they describe an industry whose marketing audience has shifted — from consumers to regulators, courts, and the investors watching its capital decisions.",
    slug: "napa-constellation-2026",
    dateline: "NAPA VALLEY, Calif.",
    body: [
      h("The Two Weeks Napa Stopped Pretending"),
      t("NAPA VALLEY, Calif. — In two weeks this April, five public events arrived that together read as something closer to a structural confession than a news cycle. A former chairman of Robert Mondavi Corporation published an essay estimating that 100 to 170 small Napa wineries are operating below long-term viability. Three days later, the largest corporate owner of Napa brands reported a 51% collapse in annual wine-segment revenue and withdrew its long-term guidance. Five days after that, a federal appellate panel revived an economic-harm suit from three Napa producers. The next day, four of the valley's principal trade groups filed a joint petition asking the county to rewrite the rules that govern how wineries can operate. A week later, Constellation Brands reopened its Robert Mondavi flagship after a three-year renovation."),
      t("The signals arrived from different directions — editorial, capital, legal, regulatory, hospitality — and from actors with little apparent coordination. But read together, they describe an industry that has changed its marketing audience. For two decades, Napa sold itself to consumers: through Visit Napa Valley, Auction Napa Valley, Premiere Napa Valley, the tasting-room network, the brand campaigns. The pivot visible this month is not that Napa has stopped marketing. It is that the audience has shifted. The industry is now marketing to regulators, to courts, to investors, and, in some quarters, to itself."),
      c(1),
      h("Capital: Constellation's Verdict"),
      t("Constellation Brands released its fiscal fourth-quarter results on April 8. The company reports its Wine & Spirits segment separately from its much larger Beer business — Modelo, Corona, Pacifico — which has driven most of Constellation's growth for the past decade. The Wine segment includes wineries across Napa, Sonoma, Washington, and several international portfolios."),
      t("For the full fiscal year, Wine & Spirits net sales fell 51% to $823.8 million. In the fourth quarter alone, net sales fell 58% to $194 million. The reported figures include the 2025 divestitures of Mondavi Private Selection, Ruffino, Cook's, and J. Rogét, which were sold to The Wine Group. Those brands represented most of the company's mid-tier volume, and their removal accounts for the steepness of the headline decline."),
      t("The organic numbers — the underlying demand signal — are more diagnostic. On an organic basis, stripping out the divested brands, Wine & Spirits net sales fell 14% for the year and 6% in the fourth quarter. Organic depletions, the measure of what distributors actually sold through to retailers and restaurants, fell 4.3%. The widening gap across these layers is the diagnostic part. Depletions are what consumers actually bought. Shipments are what Constellation sent to distributors. Net sales are what distributors paid. Constellation shipped less than distributors sold through; distributors sold through less than consumers bought. Inventory is backing up at every point in the chain."),
      t("One measure of how far Constellation has pulled back: it fell from the fifth-largest U.S. wine company in 2025 to the 28th-largest in 2026, according to Wine Business. Its wine-and-spirits segment made up just 9% of the fourth quarter's overall sales. The remaining ~91% is beer. That is the structural reality behind the restructured language in Fink's announcement — Constellation is now primarily a beer company that owns a handful of premium wine estates."),
      t("On the earnings call, chief financial officer Garth Hankinson cited tasting-room softness at the company's Napa-based wineries as a specific drag on the quarter. Five days later, on April 13, the company announced that chief executive Bill Newlands would be succeeded by Nicholas Fink. In the announcement, Fink described the Wine & Spirits business as having been restructured — a word that acknowledges the divestitures but also signals that the remaining portfolio is the one the new leadership intends to stand behind. Constellation withdrew its fiscal 2028 forward guidance entirely, citing limited near-term visibility."),
      t("The market read the release as confirmation of the company's beer-forward strategy. Shares of Constellation rose from $150 to $165 on the news. Investors were not rewarding the wine portfolio. They were rewarding the discipline of shrinking it."),
      c(2),
      h("Diagnosis: Denial Ends When the Insider Says It"),
      t("On April 5, three days before Constellation reported, Ted Hall published an essay titled [\"Napa's Luxury Squeeze\"](https://ted241.substack.com/p/napas-luxury-squeeze) on his Substack. Hall entered Napa in 2004 as chairman of Robert Mondavi Corporation during the year that ended with its sale to Constellation. He is a former senior partner at McKinsey & Company and a founder of the McKinsey Global Institute, and he now owns Long Meadow Ranch."),
      t("Hall's central estimate is that 100 to 170 Napa wineries — roughly 25% to 40% of a specific segment — are under significant economic pressure and unlikely to meet a standard of long-term viability without material change. He is careful about the framing. The estimate is not a forecast of failures, he writes; it is a description of current condition. The relevant population he identifies is the 424 Napa Valley Vintners members producing fewer than 10,000 cases a year. Within that segment, Silicon Valley Bank's wine-industry data show the share of profitable wineries fell from roughly 76% in 2021 to approximately 50% in 2024. Applied to the small-winery cohort, that implies roughly 200 wineries operating at or near break-even. Applied against a more demanding standard of long-term viability — debt service, facility maintenance, customer acquisition, reasonable return on capital — the at-risk cohort narrows to the 100-to-170 range."),
      t("Hall's comparison is with Bordeaux, which has 81 Classified Growths across red and white wines and a broader cru bourgeois category of roughly 250 estates, many priced below Napa's core luxury tier. Napa, he writes, has created several hundred wines aspiring to similar ultra-premium positioning at equal or higher prices from a valley one-sixth the size of Bordeaux. He calls the result unprecedented dilution rather than congestion — a region that overshot not in price but in positioning. To work through the resulting overcapacity at a reasonable pace, Hall arrives at roughly 35 to 40 exits, reversions, mergers, or major restructurings each year for the next three years. Not a natural rate of attrition. A serious structural reset."),
      t("None of Hall's underlying data is new. This publication and its contributors have been documenting the same structural condition for more than a decade — through the Vine Wise column in NorthBay Biz, through years of coverage in the Napa Valley Register, through reporting for The Washington Post, and, for the past three years, through Napa Valley Features. In [October 2023](https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between) we described the valley as caught between a rock and a hard place. In [January 2024](https://napavalleyfocus.substack.com/p/the-wine-boom-is-over) we asked whether the wine boom was over. In [January 2026](https://napavalleyfocus.substack.com/p/under-the-hood-the-accelerants-reshaping), two years of accumulated data let us answer the question plainly: yes, the boom is over. A companion piece the same month — [\"Napa County's Wine Market Is Clearing, Not Recovering\"](https://napavalleyfocus.substack.com/p/under-the-hood-napa-countys-wine) — framed what was happening not as a downturn but as a market clearing. The structural diagnosis has never been the scarce resource. Willingness inside the industry to name it has been."),
      t("That is what April 5 changed. Hall is not an outside critic. He is a former chairman of Mondavi and a senior figure in the valley's own agricultural establishment. When the diagnosis is published under that name, the industry's long internal posture — that the pressure was cyclical, that the valley's halo would absorb it, that aggressive marketing could restore the conditions of the previous decade — becomes harder to sustain. Hall did not break news. He ended a stance."),
      t("The stages of what comes next are already visible across the other four signals this month. The framework is a familiar one. Denial is the stance that is ending. What follows it, before acceptance, are anger, bargaining, and depression. The trade-group petition filed on April 14 is a textbook bargaining move: a request that the rules be rewritten so that the current operating model, which the market is rejecting, can continue. The Ninth Circuit suit revived on April 13 carries an edge of anger — three producers arguing that the framework itself is the cause of harm. Depression, the quiet, unglamorous stage of closures, reversions, and exits that no one announces, is already underway for some operators, and Hall's estimate is, in effect, a measurement of how far into it the valley already is. Acceptance, which is the stage at which the structure actually changes, is not yet present in the public record."),
      t("Read against the Constellation release three days later, the pairing is diagnostic. Hall described the condition. Constellation disclosed its exposure. Both describe the same underlying market. The difference is that Constellation has already moved to acceptance: it divested the brands that would not clear, invested behind the ones that would, and restructured around both. That is what the valley has not yet done."),
      h("Policy and the Courts: Anger and Bargaining, Arriving Together"),
      t("On April 13, the same day Constellation announced its leadership transition, the Ninth Circuit Court of Appeals reversed a district-court dismissal and revived constitutional claims brought by three Napa producers — Hoopes Vineyard, Smith-Madrone Winery, and Summit Lake Vineyards — against Napa County. A panel of the appeals court ruled that the producers' retaliation and First Amendment claims deserved adjudication rather than dismissal and sent the case back to federal district court. The producers argue that current regulatory restrictions — rules shaped over the past two decades with the industry's own participation — now prevent viable operation under present market conditions. The revival moves the case toward a substantive record, which, if the litigation proceeds, will begin to document in public filings the specific economics that the trade groups themselves are describing in policy language."),
      t("That trade-group petition arrived the next day. On April 14, four of the valley's principal industry organizations — the Napa Valley Vintners, the Napa Valley Grapegrowers, Coalition Napa Valley, and the Napa County Farm Bureau — filed a joint petition with the Napa County Board of Supervisors requesting 23 reforms to the regulatory framework governing winery operations. The requests include substantial changes to the Winery Definition Ordinance, revisions to visitation caps, adjustments to event-hosting rules, and expanded direct-to-consumer sales permissions."),
      t("What is unusual is not the content of the petition — most of its individual elements have been debated for years — but the signatories. The four groups represent nearly every organized producer interest in the valley. They have rarely acted in concert on substantive regulatory reform. Their joint filing is not an expansion request. It is, in the language of Hall's diagnosis, a collective acknowledgment that the rules as currently written assume a market that no longer exists."),
      t("The Ninth Circuit revival and the four-group petition point at the same underlying condition from opposite directions. The producers' suit argues that the rules prevent viable operation. The trade-group petition asks the county to rewrite the rules so operation becomes viable. Both concede what the earnings call, the essay, and the reopening confirm: the current framework does not fit the current market. Both also stop short of the recognition Hall names directly — that the number of operators the framework is meant to protect may itself be larger than the market can support. On the hospitality side, our [July 2025](https://napavalleyfocus.substack.com/p/under-the-hood-napas-tasting-rooms) analysis of tasting-room arithmetic and the [August 2025](https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled) analysis of rooms-versus-jobs have already shown why volume strategies no longer reach their historical payoff. The current petition does not address that arithmetic."),
      t("The Board of Supervisors is expected to respond by the June hearing cycle. That response will signal the direction the county intends to take — holding up the ag preserve or the market forces as the framework for the future."),
      h("The Barbell: Mondavi and What Capital Is Saying"),
      t("On April 20, after a three-year closure, Constellation reopened Robert Mondavi Winery in Oakville. As Jess Lander reported for [the San Francisco Chronicle](https://www.sfchronicle.com/food/wine/article/robert-mondavi-winery-napa-22081753.php), the renovation was the most ambitious in recent Napa Valley history — a reconstruction whose cost Constellation has not publicly disclosed but that observers place in the hundreds of millions. Mondavi, which hosted more than 350,000 visitors a year before the closure, had drifted over two decades into what Lander describes as a gateway or \"Disneyland\" winery for first-time visitors. The reopening repositions it toward the high end: entry tastings rise to $60 from $45 before closure, a Mondavi Table experience runs $95, and a full tour-and-tasting runs $150."),
      t("Constellation did not divest Mondavi as it divested Private Selection, Ruffino, Cook's, and J. Rogét. It invested at scale. The statement embedded in that decision is that Constellation believes Napa's future is barbell-shaped. The pattern is five years in the making: a 2021 sale of thirty lower-priced brands to Gallo for $810 million, followed by the 2025 sale of the remaining entry-level portfolio to The Wine Group, followed by a January 2026 closure of the Madera production facility. The capital that came out of those moves is being redirected to a trophy asset and a narrow band of premium labels above it. Everything in the middle — the crowded luxury lane Hall describes — gets neither."),
      t("That is the strategic message. Volume wine is going somewhere else. Beer, which is growing, absorbs most of Constellation's capital. The top of Napa's pyramid, which has historically been more defensive during category downturns, absorbs the rest. In that middle lane, owners are being asked to compete against the reopened Mondavi above them, against flexible formats below them, and against peers speaking the same language at the same price point all around."),
      t("Read beside Hall's diagnosis, the Mondavi reopening is not a contradiction. It is the complement. Hall describes what the middle is unlikely to sustain. Mondavi, reopened with a hundred-million-dollar-range investment, describes where the largest corporate owner of Napa brands believes the defensible position is. The five events across two weeks do not add up to a crisis narrative. They add up to something harder for the valley to absorb: a public, multi-sourced agreement — across an essay, an earnings call, a federal court docket, a regulatory petition, and a hospitality reinvestment — that the structure has to change, and that the change is large."),
      t("None of that agreement is yet acceptance. The Board of Supervisors has not responded. The Ninth Circuit docket has not been scheduled. The trade groups' petition asks for adaptation, not reduction. The 100-to-170 figure has not been addressed by any industry body that could act on it. Capital has moved. Policy has not. The reporting record has documented this transition for more than a decade, and as of this month the industry's own senior figures are, at last, naming it out loud."),
      t("Whether the next 90 days mark the beginning of acceptance or another round of bargaining is the question that will determine what kind of valley this becomes. Napa Valley Features will return to the marketing-machine arithmetic next Saturday, and to the demographic record the Saturday after that."),
    ],
    pullQuote: "Capital has moved. Policy has not.",
    captions: [
      { number: 1, title: "Five Signals in Two Weeks", description: "Between April 5 and April 20, five public events from actors with little apparent coordination described the same industry pivot — from marketing to consumers toward marketing to regulators, courts, and investors", source: "Ted Hall Substack (April 5, 2026); Constellation Brands Q4 FY26 Earnings Release (April 8, 2026); Ninth Circuit Court of Appeals docket (April 13, 2026); Napa County Board of Supervisors (April 14, 2026); San Francisco Chronicle (April 17, 2026)" },
      { number: 2, title: "Constellation Wine & Spirits, Full-Year FY26", description: "Reported net sales fell 51% to $823.8 million, including the 2025 divestitures of Mondavi Private Selection, Ruffino, Cook's, and J. Rogét. Stripping those out, organic net sales fell 14% — the underlying demand signal", source: "Constellation Brands Q4 FY26 Earnings Release (April 8, 2026)" },
    ],
    relatedCoverage: [
      { title: "\"Napa Valley Finds Itself Between a Rock and a Hard Place\"", publication: "Napa Valley Features", date: "October 2023", url: "https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between" },
      { title: "\"Is the Wine Boom Over?\"", publication: "Napa Valley Features", date: "January 2024", url: "https://napavalleyfocus.substack.com/p/the-wine-boom-is-over" },
      { title: "\"Under the Hood: How Accelerants — From GLP-1s to Politics — Are Reshaping Wine Demand\"", publication: "Napa Valley Features", date: "January 2026", url: "https://napavalleyfocus.substack.com/p/under-the-hood-the-accelerants-reshaping" },
      { title: "\"Under the Hood: Napa County's Wine Market Is Clearing, Not Recovering\"", publication: "Napa Valley Features", date: "January 2026", url: "https://napavalleyfocus.substack.com/p/under-the-hood-napa-countys-wine" },
    ],
    sources: [
      "Ted Hall, [\"Napa's Luxury Squeeze,\"](https://ted241.substack.com/p/napas-luxury-squeeze) Tell the Truth and Do the Right Thing Substack, April 5, 2026.",
      "Constellation Brands, [\"Fourth Quarter and Fiscal Year 2026 Results,\"](https://www.cbrands.com/investors) April 8, 2026.",
      "Press Democrat, [\"Constellation Brands flags Napa tasting-room softness; Mondavi to reopen April 20,\"](https://www.pressdemocrat.com/2026/04/14/constellation-brands-napa-mondavi-q4-wine-spirits-beer/) April 14, 2026.",
      "Press Democrat, [\"Federal appeals court reverses dismissal of some claims against Napa County in Hoopes Vineyard case,\"](https://www.pressdemocrat.com/2026/04/14/federal-appeals-court-reverses-dismissal-of-some-claims-against-napa-county-in-hoopes-vineyard-case/) April 14, 2026.",
      "Napa Valley Vintners, Napa Valley Grapegrowers, Coalition Napa Valley, and Napa County Farm Bureau, joint petition to the Napa County Board of Supervisors, April 14, 2026.",
      "Jess Lander, [\"Inside the most anticipated California winery opening of the year, or maybe ever,\"](https://www.sfchronicle.com/food/wine/article/robert-mondavi-winery-napa-22081753.php) San Francisco Chronicle, April 17, 2026.",
      "Tim Carl, [\"Napa Valley Finds Itself Between a Rock and a Hard Place,\"](https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between) Napa Valley Features, October 3, 2023.",
      "Tim Carl, [\"Is the Wine Boom Over?\"](https://napavalleyfocus.substack.com/p/the-wine-boom-is-over) Napa Valley Features, January 4, 2024.",
      "Tim Carl, [\"Under the Hood: Napa's Tasting Rooms Face a Numbers Problem,\"](https://napavalleyfocus.substack.com/p/under-the-hood-napas-tasting-rooms) Napa Valley Features, July 5, 2025.",
      "Tim Carl, [\"Under the Hood: More Rooms Has Equaled Fewer Jobs in Napa County,\"](https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled) Napa Valley Features, August 23, 2025.",
      "Tim Carl, [\"Under the Hood: How Accelerants — From GLP-1s to Politics — Are Reshaping Wine Demand,\"](https://napavalleyfocus.substack.com/p/under-the-hood-the-accelerants-reshaping) Napa Valley Features, January 2026.",
      "Tim Carl, [\"Under the Hood: Napa County's Wine Market Is Clearing, Not Recovering,\"](https://napavalleyfocus.substack.com/p/under-the-hood-napa-countys-wine) Napa Valley Features, January 2026.",
      "Silicon Valley Bank, [State of the U.S. Wine Industry](https://www.svb.com/trends-insights/reports/wine-report), 2024 and 2025 editions.",
    ],
  },
  "napa-structural-reset-2026": {
    headline: "The Reset Spreads",
    publication: "Napa Valley Features",
    slug: "napa-structural-reset-2026",
    dateline: "NAPA VALLEY, Calif.",
    body: [
      t("NAPA VALLEY, Calif. \u2014 The story is not about one winery, one auction or one bad quarter. As of April 2026, Napa\u2019s structural adjustment is no longer contained within wine production. It is now visible in restaurants, tasting rooms and hospitality-facing businesses \u2014 the front-of-house layer of the local economy \u2014 while capital is simultaneously becoming more conditional through restructurings, split-asset deals, foreclosures and selective portfolio moves."),
      t("Napa Valley Features has been tracking this pattern since December 2023, when \u201CNapa Valley\u2019s M&A Surge: From Bohemia to Boardroom\u201D documented a shift in deal character: transactions becoming more capital-dominant, less favorable to smaller operators. By September 2024, that frame had widened into a structural reset thesis. By October 2025, the pressures were materializing in distressed conditions and harder exits. The new development as of April 2026 is not that the wine economy is under pressure \u2014 it is that the pressure has spread outward and is now measurable in real closures and real transactions."),
      h("The Visitor Economy Begins to Show It"),
      t("Charlie Palmer Steak at Archer Hotel Napa, 1230 First St., will close April 12, 2026, according to a March 31 joint news release from the restaurant group and the hotel. Archer Hotel plans to redevelop the space as a lobby lounge. Charlie Palmer Collective is pursuing a new wine country location."),
      t("The restaurant opened in November 2017, the same month as the hotel, and operated for nearly a decade on the First Street corridor. On its own, one restaurant closure is not a trend. In context \u2014 a high-profile, full-service steakhouse inside a purpose-built luxury hotel, closing after nearly a decade \u2014 it is a meaningful signal. It fits the quiet contraction thesis because it is being handled as a repositioning, not a crisis. That is precisely how this kind of contraction tends to arrive: orderly on the surface, cumulative in effect."),
      t("The Charlie Palmer platform\u2019s parallel activity is worth noting without overstating. While the Napa steakhouse closes, Charlie Palmer and hospitality executive Christopher Hunsberger are expanding through Appellation Healdsburg \u2014 a newly opened culinary-driven hotel in Healdsburg\u2019s North Village, with Folia Bar & Kitchen as its main restaurant. This is not a simple Napa-to-Sonoma shift. It is selective geographic repositioning within the North Bay experience economy \u2014 the same hospitality platform closing a long-running Napa flagship while opening inside a newer Healdsburg luxury development. That pattern is visible across several operators."),
      t("Boisset Collection provides a second data point. Jean-Charles Boisset closed Chateau Buena Vista in downtown Napa and the JCB Tasting Salon in Yountville in late 2025 and early January 2026, the San Francisco Chronicle reported, with spokesperson Patrick Egan confirming both closures. The JCB Yountville location closed when its lease expired; Chateau Buena Vista experiences are being consolidated to the Buena Vista Winery estate in Sonoma. The JCB Tasting Salon was Boisset\u2019s last business in Yountville\u2019s JCB Village, which had previously included Atelier by JCB and Senses by JCB, both already closed. Two JCB locations remain: Raymond Vineyards and a new St. Helena Main Street location, with a permanent Rutherford home planned."),
      t("Three named Napa hospitality closures \u2014 Charlie Palmer Steak, Chateau Buena Vista, JCB Yountville \u2014 in a four-month window, each handled as a repositioning, none described as a crisis. That is what quiet contraction looks like."),
      h("Production and Capacity Rationalization"),
      t("E. & J. Gallo will permanently close The Ranch Winery at 105 Zinfandel Lane, St. Helena, effective April 15, 2026. The closure eliminates 56 positions at that facility, with 37 additional layoffs planned at Louis M. Martini Winery, Orin Swift Tasting Room, J Vineyards & Winery and Frei Ranch in Healdsburg \u2014 93 total across five North Coast sites. WARN notices were filed February 12, 2026."),
      t("Gallo acquired The Ranch Winery in December 2015 as a 30,000-ton crush facility intended to build its super-premium and luxury wine presence in Napa. That investment did not produce the expected returns. The spokesperson language \u2014 \u201Caligning parts of our operations with our long-term business strategy to ensure we remain well-positioned for future success\u201D \u2014 is the language of capacity rationalization. In September 2025, Gallo also closed its Courtside Cellars winery in San Luis Obispo County, eliminating 47 additional jobs. The world\u2019s largest wine producer by volume is explicitly removing fixed production capacity from the Napa and Sonoma system simultaneously. That is a system-level signal, not a one-company story."),
      t("The production-side context is documented in \u201C2025 Napa Grape Prices Slip After a Record High\u201D (March 2026): North Coast bulk wine availability has surged and inventory remains elevated, creating conditions in which large operators have strong incentive to remove fixed costs from the system."),
      h("When Deals Stop Moving Whole"),
      t("The most structurally significant transactions of this period are not the closures. They are the deals that completed \u2014 and how they completed."),
      t("Third Leaf Partners, a San Francisco investment firm, quietly acquired the Cain Vineyards & Winery brand and inventory in December 2025. The 500-acre Spring Mountain estate is being sold separately to an undisclosed buyer. A long-term grape supply agreement is being negotiated to keep the brand connected to the land it no longer owns. Long-time winemaker Chris Howell noted that roughly two-thirds of the vineyard has been replanted following the 2020 Glass Fire, with full restoration expected by 2030."),
      t("In an expansion era, estates like Cain moved whole \u2014 land, brand, winery, grapes and reputation bundled together. This transaction separates them. The brand is owned by one party. The land is being sold to another. The grapes will be connected through a supply contract. That is a fundamentally different structure, and it matters for what it implies about how buyers are now underwriting risk in Napa. The Real Deal reported that MGG Investment Group took over nearby Spring Mountain Vineyard following a $185 million loan default \u2014 a second lender-driven transaction in the same appellation in the same period."),
      t("Trinchero Family Wine & Spirits announced the acquisition of Mumm Napa from Pernod Ricard on December 11, 2025 \u2014 a deal that includes Mumm\u2019s Rutherford winery, brand, inventory and a long-term lease on Deveaux Ranch in Carneros. Mumm produced approximately 334,000 cases in the prior year. Separately, Trinchero listed Haystack Vineyard on Atlas Peak ($5.5 million asking) and Clouds Nest Vineyard on Mount Veeder ($4.5 million asking) for sale in February 2026. Trinchero VP of communications Elizabeth Hooker described the vineyard sales as a \u201Cproactive step\u201D to ensure long-term, sustainable growth, and stated the sales are unrelated to the Mumm acquisition."),
      t("Whether or not the moves are financially connected, they are temporally and strategically connected. Selling premium mountain vineyard assets while simultaneously acquiring a category platform is selective capital redeployment. In a growth era, this would look contradictory. In a structural reset, it looks like exactly the kind of portfolio pruning sophisticated operators make when they can no longer grow everything at once."),
      h("What Stanly Ranch Tells Us"),
      t("The clearest valuation-reset signal of the period is a transaction on the steps of the Napa County courthouse. Blackstone Real Estate acquired the hotel portion of Stanly Ranch at a foreclosure auction on March 27, 2026. The sale price was $195 million, per the deed recorded with Napa County. The previous owners, SRGA LP, had defaulted on a loan that had grown to $243.6 million in total debt. The original loan was approximately $220 million; the default notice was recorded in October 2025."),
      t("The math produces two figures depending on measurement: $195 million against the original $220 million loan implies an 11% discount; against the total $243.6 million debt stack it implies a 20% discount. Both are documented. Operations continue. Auberge Resorts Collection continues to manage the property. But the capital structure was rewritten through distress, and the transaction cleared below the debt stack. That is repricing, not rescue."),
      t("Stanly Ranch opened in April 2022 on more than 700 acres in Napa\u2019s Carneros region. It has 135 guest rooms, three outdoor pools and 19,000 square feet of meeting space, and earned a Michelin key. Starting nightly rates run approximately $700."),
      t("Blackstone\u2019s involvement adds another layer. The firm remains one of the largest and most sophisticated players in private capital, overseeing more than $1 trillion in assets. But its arrival here also underscores how deeply Napa\u2019s hospitality assets are now tied to broader capital-market conditions \u2014 including a period of tighter liquidity and more visible stress in high-end discretionary real estate. Blackstone\u2019s own framing cited rising group and leisure demand for wellness and experiential travel and continued growth in corporate travel tied to AI sector activity. That is a different demand thesis than the one that built Stanly Ranch."),
      t("The transaction\u2019s structure is also notable. The sale does not include the vineyard homes and villas at Stanly Ranch \u2014 a split-asset structure in which the hotel traded separately from the residential components. This is a second example, alongside Cain, of Napa assets being disaggregated rather than bundled. A separate $100 million lawsuit filed March 6, 2026, in New York State Supreme Court by The Nichols Partnership and Stanly Ranch Resort Napa LLC against GA Development Napa Valley LP and Mandrake Capital Partners adds further complexity to the transaction\u2019s full accounting."),
      h("A Regional Pattern, Not a List of Incidents"),
      t("What looks, at first glance, like a series of isolated adjustments \u2014 a steakhouse closure, a tasting-room retreat, a foreclosure sale, a vineyard listing, a split-asset transaction \u2014 increasingly reads as one regional pattern. Napa\u2019s operating footprint is shrinking while capital becomes more selective, more defensive and more complex."),
      t("Public capital markets have already moved. RH \u2014 the luxury furniture and restaurant company that operates a prominent location in Yountville \u2014 has seen its stock decline approximately 80% over five years. The point is narrower than a direct comparison: public markets repriced an adjacent luxury-experience model dramatically, while Napa\u2019s physical assets and operating footprint are only now showing comparable repricing through closures and transactions."),
      t("The distribution layer is also under stress. Republic National Distributing Company exited California entirely effective September 2, 2025, disrupting more than 2,500 beverage brands. The company cited rising operational costs, industry headwinds and supplier losses. As documented in \u201CUnder the Hood: How a Global Supply Shock Reaches Napa Valley\u201D (March 2026), distribution-layer disruption compounds production-layer stress across multiple points in the system simultaneously."),
      t("\u201CSonoma Grape Prices Fall for a Second Year as Cab Sauv Leads the Decline\u201D (March 2026) and \u201CLake County Grape Prices Have Fallen 38% in Two Years \u2014 and Chardonnay Has Nearly Vanished\u201D (March 2026) show that the pressure is not unique to Napa but is playing out across the North Coast system. Major producers have reported impairment charges tied to U.S. wine assets \u2014 formal acknowledgments that prior valuations no longer hold."),
      t("This is not a cycle. Regional economies built around one dominant growth engine do not simply reset and resume. They reorganize \u2014 slowly, selectively and unevenly \u2014 around what survives."),
      h("What Quiet Contraction Looks Like Next"),
      t("In mature regional economies built around one dominant growth engine, contraction tends to arrive through several mechanics before it shows up in aggregate statistics. Slower reinvestment arrives first: capital that flowed freely into new facilities, expansions and luxury buildouts becomes more cautious. Projects are delayed. Reopenings take longer. New entrants become rarer."),
      t("Deal terms become increasingly defensive: seller financing, earn-outs, split-asset structures and lender involvement become more common as buyers seek downside protection that was unnecessary in a growth market. The distance between trophy assets and everything else grows. Strong brands, strong locations and well-capitalized operators pull away; mid-tier operators face harder choices with fewer options."),
      t("Employment changes arrive quietly: not dramatic layoff announcements but slower hiring, reduced seasonal staffing, attrition that is not backfilled. Old steel-producing regions, tobacco belt counties, legacy newspaper markets and resort towns that built for a visitor peak that did not hold have all moved through this sequence \u2014 not as direct parallels to Napa, but as examples of how contraction spreads through a regional system quietly rather than theatrically."),
      t("The useful question is not whether Napa is in decline. It is: how much of the operating footprint was built for a level of demand that no longer exists? And what happens when the cost of maintaining that footprint exceeds what the current market will support? \u201CNapa\u2019s Economy Looks Bigger Than It Is\u201D (March 2026) documented that 87% of Napa\u2019s apparent GDP growth since 2016 was attributable to inflation rather than real expansion \u2014 a structural context that matters for understanding how much of the current footprint was built on durable demand versus price-level effects."),
      h("What to Watch"),
      t("Several regional signals are worth tracking in the months ahead. Further hospitality retrenchment: more tasting room consolidations, hotel restaurant repositionings, longer vacancy periods in premium retail and hospitality space on the First Street corridor and in Yountville. The pace at which vacancies are backfilled \u2014 and at what price point, by what kind of operator \u2014 will indicate whether what is happening is a temporary pause or a durable reset."),
      t("More split-asset transactions: additional deals in which land, brand, operations and financing move separately rather than together, using the Cain and Stanly Ranch structures as a template. Wider bid-ask spreads: sellers anchored to 2018\u20132022 valuations meeting buyers pricing in structural uncertainty. Deals that take longer, require more seller flexibility or fall through are signals worth tracking alongside deals that do close."),
      t("The employment signal: Napa County food service and hospitality employment data from the California Employment Development Department will show whether what is visible in individual closure announcements is accumulating into a broader labor-market shift. Watch for slower hiring, reduced seasonal staffing and attrition that is not backfilled."),
    ],
    pullQuote: "What looks, at first glance, like a series of isolated adjustments \u2014 a steakhouse closure, a tasting-room retreat, a foreclosure sale, a vineyard listing, a split-asset transaction \u2014 increasingly reads as one regional pattern.",
    links: [
      { label: "Interactive article", url: "https://napaserve.org/under-the-hood/napa-structural-reset-2026" },
    ],
    sources: [
      "SF Chronicle, \u201CCharlie Palmer Steak to close at Archer Hotel Napa,\u201D Apr. 1, 2026.",
      "Napa Valley Register, \u201CStanly Ranch Napa resort sold for $195M in foreclosure,\u201D Apr. 1, 2026.",
      "Bloomberg, \u201CBlackstone Acquires Napa Valley Resort in a Foreclosure Sale,\u201D Mar. 30, 2026.",
      "SF Chronicle, \u201CNapa\u2019s Cain Vineyards & Winery sold to SF firm Third Leaf Partners,\u201D Apr. 1, 2026.",
      "CBS SF \u00B7 Press Democrat, \u201CWine giant Gallo closing Napa Valley facility, laying off dozens,\u201D Feb. 2026.",
      "Bureau of Economic Analysis, FRED series REALGDPALL06055, Napa County real GDP 2001\u20132024.",
    ],
  },
  "napa-supply-chain-2026": {
    headline: "How a Global Supply Shock Reaches Napa Valley",
    publication: "Napa Valley Features",
    slug: "napa-supply-chain-2026",
    dateline: "NAPA, Calif.",
    body: [
      t("NAPA VALLEY, Calif. \u2014 A vineyard manager prices diesel for a week of tractor work. A winery waits on a part for a cooling system. A packaging order gets harder to quote. A hotel manager watches booking patterns for signs that visitors are pulling back."),
      t("Those are routine decisions in Napa Valley. They no longer sit inside a routine global economy."),
      t("The current shock begins in a place many readers know by name but may not fully grasp as a system: the Strait of Hormuz. On Feb. 28, coordinated U.S.-Israeli airstrikes on Iran triggered a sequence of events that has brought the global economy to the edge of one of its worst energy crises in decades. Iran\u2019s Islamic Revolutionary Guard Corps declared the strait closed, tanker traffic ground to a near halt, and oil prices surged faster than during any other conflict in recent history."),
      h("What the Strait of Hormuz Actually Moves"),
      t("The Strait of Hormuz is a 21-mile-wide channel between Iran and Oman at the mouth of the Persian Gulf. It is the single most important chokepoint in the global energy system."),
      t("Before the Feb. 28 closure, approximately 110 ships passed through daily \u2014 roughly 20% of the world\u2019s oil supply, 20% of global liquefied natural gas and significant volumes of LPG, fertilizers and dry bulk commodities including grain and metals. There is no viable alternative route for most of this volume. The pipelines that bypass the strait have a combined capacity of roughly 6 million barrels per day, far below the 20 million barrels that previously transited the strait daily."),
      c(1),
      h("The Transmission Chain to Napa"),
      t("Napa Valley does not import oil directly from the Persian Gulf. The connection is indirect but real, running through three channels: energy prices, materials costs and visitor economies."),
      t("Energy prices are the most visible channel. California diesel prices surged past $6.50 per gallon within days of the closure and continued higher as global crude benchmarks rose. Napa\u2019s agricultural economy runs on diesel \u2014 tractors, trucks, generators, pumps and harvest equipment. A sustained price increase at the pump translates directly to operating costs for every vineyard and winery in the county."),
      t("Materials costs are the less visible channel. The strait carries not just oil and gas but the industrial inputs that flow through global manufacturing: aluminum, steel, fertilizers, specialty chemicals and the components embedded in the equipment that vineyards, wineries, hotels and restaurants rely on. It also reaches Napa indirectly through visitor-origin economies in Europe and Asia, where households and businesses are absorbing the same energy squeeze. The same conflict that raises input costs here weakens spending power there."),
      c(2),
      h("How the Shock Travels Downstream"),
      t("The chain from chokepoint to vineyard runs through several transmission layers, not just pump prices."),
      t("Oil and refined products are the most visible layer. Diesel powers tractors, trucks and generators. Freight rates for oil tankers have surged alongside war risk insurance premiums and marine fuel costs, increasing shipping costs across supply chains."),
      t("Natural gas feeds industrial production across multiple sectors at a level most readers do not track. When Qatar\u2019s Ras Laffan went offline, the ripple moved immediately into materials that have nothing obvious to do with energy. Aluminum is one example \u2014 Hydro reported that its Qatalum joint venture in Qatar initiated a controlled shutdown on March 3 after QatarEnergy informed the facility of a forthcoming suspension of gas supply. By March 12, the company said reduced gas would continue and Qatalum would maintain production at about 60% of capacity \u2014 stabilized, not in shutdown. That is a direct illustration of how a gas shock becomes a materials shock."),
      t("Helium is another example \u2014 a case study in how deep the chain runs. Helium is used in semiconductor manufacturing because it provides a stable inert atmosphere and improves heat transfer. When helium supply tightens, the constraint does not announce itself at the pump. It shows up quarters later in lead times, component costs and equipment availability."),
      t("Fertilizers and agricultural chemicals complete the picture. The strait carries roughly a third of global urea exports, about 30% of ammonia and approximately 20% of phosphate fertilizer, according to CRU Group data cited by the Financial Times. Sulfur exports out of the Persian Gulf account for roughly half of global seaborne trade, according to Bloomberg Intelligence \u2014 a supply chain exposure that translates directly into fertilizer and chemical costs for agricultural operations worldwide."),
      t("Manufacturing trade friction adds a parallel layer. On March 11, the Office of the U.S. Trade Representative opened new Section 301 investigations into structural excess manufacturing capacity across 16 economies \u2014 with China as the primary subject \u2014 a signal that trade friction is rising again at precisely the moment energy and shipping systems are under strain. For Napa, that means more uncertainty around pumps, fittings, refrigeration components, warehouse materials, fabricated parts and the small industrial goods that make a premium agricultural region run on time."),
      c(3),
      h("What This Means for Napa\u2019s Economy"),
      t("The most direct exposure is operating costs. Every vineyard and winery that runs diesel equipment, purchases fertilizers, sources packaging materials or maintains refrigeration systems is absorbing higher input costs. The direction is clear and the timeline is compressed."),
      t("The less direct but potentially larger channel is visitor spending. Napa Valley\u2019s tourism economy depends on discretionary spending by visitors who are themselves absorbing higher energy costs and greater economic uncertainty. European and Asian visitors, who account for a meaningful share of Napa\u2019s high-end tourism, are facing the same commodity shock in their home economies."),
      t("The third channel is capital markets. Vineyard land values, winery financing and the investment activity that supports Napa\u2019s premium agricultural economy are sensitive to interest rates and credit conditions. A sustained energy shock that pushes inflation higher would apply additional pressure to an agricultural real estate market already navigating a grape price correction."),
      c(4),
      h("The Scenario Calculator"),
      t("The interactive calculator below allows readers to model how different levels of diesel price increase translate to estimated annual cost increases for a typical Napa vineyard operation. The estimates are illustrative, not predictive."),
      c(5),
      h("What to Watch"),
      t("The Hormuz closure is weeks old. The full transmission of the shock through supply chains, energy markets and visitor economies will take months to appear in local data. California diesel prices at the pump are the most immediate signal. Napa County lodging data will show visitor response within 60 to 90 days. Grape and bulk wine contract activity will reflect whether buyers are pulling back or accelerating purchases ahead of further cost increases."),
      t("The planners, policymakers, community members and civic leaders who shape Napa Valley\u2019s economic future are making decisions now that will interact with this shock over the next 12 to 24 months. The data above is a starting point for understanding what is already moving through the system."),
    ],
  },
  "napa-cab-2025": {
    headline: "Napa Cabernet Prices Break the Growth Curve",
    publication: "Napa Valley Features",
    slug: "napa-cab-2025",
    dateline: "NAPA, Calif.",
    body: [
      t("NAPA, Calif. \u2014 The weighted average price of Napa County cabernet sauvignon reached $9,235 per ton in 2023, the highest on record. Two years later it stands at $8,933."),
      t("The decline is modest \u2014 roughly 3.3% from the peak. In the context of Napa\u2019s long economic trajectory, however, the shift carries far larger implications. For nearly five decades, growers, wineries and lenders built their expectations around a growth curve that steadily pushed cabernet prices higher. Depending on which historical period is used as a benchmark, the weighted average price of Napa cabernet in 2025 would be expected to fall somewhere between $10,100 and $11,800 per ton."),
      t("Instead, the preliminary crush data show prices moving in the opposite direction for two consecutive years \u2014 the first sustained decline in the modern era of Napa viticulture."),
      t("The gap between those two paths \u2014 the trajectory the market expected and the one now appearing in the data \u2014 reveals a structural shift that could reshape vineyard economics across Napa Valley."),
      h("The 2025 Crush Report: A Brief Summary"),
      t("California wineries crushed 2.62 million tons of grapes in 2025 \u2014 the lightest crop since 1999 and 23% below the five-year average. Total red wine production declined 9% and white wine production declined 6%. The total crop value statewide fell 16% from the prior year to $2.414 billion, according to Turrentine Brokerage, which characterized the vintage as one of the most challenging for the wine industry since Prohibition."),
      t("The volume decline was driven by a combination of weather, acreage removals and a persistent lack of demand that left significant tonnage uncontracted and unharvested. An estimated 57,000 acres were removed statewide in 2025, with considerably more left unpicked."),
      t("\u201CThe 2025 vintage highlights the industry\u2019s directional shift of declining production and an overall restructure of the industry,\u201D said Audra Cooper, vice president at Turrentine Brokerage. \u201CBetween a cooler growing season, reduced vineyard inputs, and multiple rain events which led to excessive late-season disease pressure and combined with soft demand, 2025\u2019s challenges were relentless.\u201D"),
      t("For Napa Valley specifically, Cabernet Sauvignon tonnage came in at roughly 77,000 tons \u2014 just a 1.3% decline from 2024, smaller than many in the industry had predicted. The price, however, continued lower."),
      c(6),
      h("A Half-Century Price Curve"),
      t("Since the late 1970s, following enactment of California\u2019s Clare Berryhill Grape Crush Act of 1976, the California Department of Food and Agriculture has published annual grape crush data in cooperation with USDA\u2019s National Agricultural Statistics Service. Napa cabernet prices have followed one of the most consistent upward trajectories in American agriculture."),
      t("In 1976 the weighted average price of Napa cabernet was $461 per ton. By the early 2000s it had climbed above $3,000. Two decades later it exceeded $9,000. The rise was not perfectly smooth. Prices slowed during recessions and fluctuated with harvest conditions \u2014 most notably in 2020, when the pandemic and a devastating wildfire season pushed the average to $6,260 \u2014 but the broader direction remained unmistakable."),
      t("Over time the curve became a defining feature of Napa Valley\u2019s agricultural economy. Growers planted vineyards assuming the trend would continue. Wineries structured long-term grape contracts around rising fruit costs. Banks financed vineyard development using projections that incorporated the same trajectory."),
      t("Across multiple historical periods, Napa cabernet prices expanded at a compound annual growth rate between 4.7% and 6.9%. The long-run rate from 1976 to 2023 was 6.6% per year. The more recent period from 2011 to 2019 ran at 6.9% annually. Even the conservative modern period from 2000 to 2023 compounded at 4.75% per year. These rates reflect different historical windows \u2014 each a reasonable benchmark depending on when a grower planted, borrowed or signed a contract."),
      t("Those are not abstract statistics. They are the numbers embedded in loan covenants, vineyard appraisals and long-term supply contracts across the valley."),
      c(1),
      h("The Expectation Gap"),
      t("The weighted average price of Napa County cabernet sauvignon peaked at $9,235 per ton in 2023. It slipped to $9,146 in 2024 and to $8,933 in 2025. Two consecutive years of decline have not occurred in the modern crush report era."),
      t("If the historical price trajectory is projected forward from the 2023 peak using any of the growth rates observed in prior expansion periods, the expected price of Napa cabernet in 2025 would fall well above current levels."),
      t("Using the long-run 1976-2023 growth rate of 6.6%, the projected 2025 price would be approximately $10,492 per ton. Using the recent 2011-2019 rate of 6.9%, the projection rises to roughly $11,847. Even the most conservative projection, using the 2000-2023 rate of 4.75%, produces an expected price of about $10,134."),
      t("The actual 2025 price of $8,933 falls $1,200 to $2,900 per ton below where any of those trajectories would predict \u2014 an expectation gap of 13% to 33% depending on the benchmark used."),
      t("For a vineyard block producing three tons per acre, the difference between the 2023 peak and the 2025 price represents roughly $900 in lost gross revenue per acre. Multiplied across thousands of vineyard acres, the scale of the shift becomes clearer. As we detailed in \u201CUnder the Hood: The Dismal Math of Napa\u2019s Skipped Acres\u201D (November 2025), even modest per-acre revenue shifts propagate through wages, suppliers and local government revenues over a multi-year period."),
      c(2),
      h("The Maximum Price Signal"),
      t("Another indicator warrants attention: the highest price paid for any individual lot of Napa cabernet sauvignon."),
      t("During the expansion years, the maximum price paid rose alongside the weighted average, reinforcing the expectation that the top of the market would continue appreciating. The record price reached $69,125 per ton in 2024. In 2025 it retreated to $67,200 \u2014 matching the 2023 record rather than surpassing it."),
      t("Taken alone, a single-year movement in the maximum price is not conclusive. But the flattening of the maximum price at the same moment the weighted average has begun declining suggests the speculative premium at the top of the market may be losing momentum alongside the broader average. As we highlighted in \u201CNapa Valley Grape Prices See Continued Surge in 2023\u201D (February 2024), outlier transactions \u2014 lots trading above $60,000 per ton \u2014 represented a small share of total tonnage but exerted an outsized influence on market sentiment and vineyard valuations."),
      t("If those transactions no longer set new records, that signal is worth watching."),
      c(3),
      h("A Market That Once Protected Prices"),
      t("For years the Napa grape market contained mechanisms that helped sustain the long-term price trajectory even when demand softened. Growers and wineries often shared a common incentive to protect the county\u2019s reported average price. When supply temporarily exceeded demand, fruit was sometimes left unpicked rather than sold at prices that might drag down the weighted average in the crush report. That approach helped preserve the appearance of stability during earlier cycles."),
      t("The 2024 harvest report, which we explored in \u201CUnder the Hood: 2024 Harvest Report Reveals a Market Splitting in Two\u201D (February 2025), revealed a market already bifurcating: ultra-premium buyers remained engaged while mid-tier demand contracted sharply. Cabernet sauvignon tonnage fell 23% even as the weighted average price held near the 2023 peak \u2014 a signal that supply constraints, not demand strength, were doing much of the work to sustain reported prices."),
      t("The 2025 data confirm the floor is giving way. The weighted average has now declined for two consecutive years despite Napa tonnage holding relatively steady."),
      t("The contracts that once locked in Napa\u2019s premium are now contested terrain. A Napa Valley grower with nearly three decades of experience, who requested anonymity, said wineries have recently begun walking away from long-standing agreements \u2014 in some cases deals that had been in place for years. The grower said he is now preparing to pursue legal action against several buyers."),
      t("\u201CIf they think they can just walk away,\u201D he said, \u201Cthen we\u2019ll see them in court.\u201D"),
      h("Napa in Context: A Five-Varietal, Three-County Comparison"),
      t("The 2025 preliminary crush report allows a direct comparison of weighted average grower returns across five key varietals in three North Coast districts: Lake County (District 2), Sonoma County (District 3) and Napa County (District 4)."),
      t("For Cabernet Sauvignon, the gap remains wide. Napa growers received a weighted average of $8,933 per ton in 2025 \u2014 3.2 times the Sonoma average of $2,772 and 7.6 times the Lake County average of $1,171."),
      t("Pinot Noir tells a different story. Sonoma County growers received $3,817 per ton for Pinot Noir in 2025 \u2014 roughly a third more than the Napa average of $2,867 for the same variety. Napa\u2019s brand premium, which is deeply embedded in the Cabernet market, does not extend uniformly across varietals. The market has already made its judgment: Sonoma owns Pinot Noir."),
      t("The Lake County Chardonnay figure deserves particular attention: it fell from $965 per ton in 2023 to $288 in 2025 \u2014 a collapse of roughly 70% in two years, illustrating the severity of the pressure facing lower-tier appellations. Industry analysts note this figure may be influenced by thin volume and intra-company transfer pricing; the final report due April 30 may revise it."),
      t("One important caveat: Turrentine Brokerage\u2019s North Coast analyst noted that district average prices in the crush report are not representative of spot market prices for new contracts for the second consecutive year. The district averages blend older multi-year contracts signed at higher prices with new deals negotiated in current market conditions."),
      c(4),
      t("All five Napa varietals examined declined from their 2023 levels to 2025, with the exception of Cabernet Franc, which rose 4.7% \u2014 a figure that reflects a thin market where a handful of transactions at very high prices can swing the district average, not broad-based strengthening. Cabernet Sauvignon fell 3.3%, Pinot Noir fell 2.4%, Sauvignon Blanc fell 0.7% and Chardonnay fell 0.4%."),
      t("The chart below breaks down the price change by varietal from 2023 to 2025."),
      c(5),
      h("The Economics Facing Growers"),
      t("The changing price trajectory arrives at a moment when vineyard economics are already under severe pressure."),
      t("Labor, farming inputs and financing costs have all increased in recent years, narrowing margins for many growers. As we showed in \u201CUnder the Hood: The Dismal Math of Napa\u2019s Skipped Acres\u201D (November 2025), the economic impact of leaving vineyards unfarmed or pulling them out extends far beyond the grower\u2019s ledger. At a typical Napa yield of three tons per acre and a price near $8,933, each acre generates roughly $26,800 in gross revenue before harvest and hauling costs. A $1,000 decline in the per-ton price reduces that by $3,000 per acre \u2014 a meaningful shift when multiplied across hundreds or thousands of acres."),
      t("The per-acre math compounds through the broader economy. Each dollar of Napa grape value supports roughly $10.30 in local economic activity when traced through wineries, suppliers, tourism and household spending. A sustained price decline does not simply reduce grower income \u2014 it attenuates a multiplier that runs through the county\u2019s entire economic structure."),
      t("Napa\u2019s 2023 GDP was approximately $14.2 billion. Wine and grapes influence an estimated 75% of that. In that context, the price trajectory of a single varietal carries consequences that reach well beyond the farm gate."),
      t("The overproduction context amplifies the concern. As we detailed in \u201CUnder the Hood: Wine Overproduction Scenarios Suggest Tougher Days Ahead\u201D (October 2025), even under the most optimistic scenarios for demand recovery and supply adjustment, California\u2019s wine industry faces the prospect of meaningful surplus through the end of the decade. The bulk wine market \u2014 which Turrentine Brokerage estimates carries close to 40 million gallons of inventory \u2014 continues to suppress grape demand at the source."),
      h("A Structural Shift Emerging"),
      t("For decades Napa Valley\u2019s vineyard economy expanded under the assumption that the historical price curve would continue, even accelerate. Several forces are now challenging that assumption simultaneously."),
      t("Wine consumption has softened. Younger consumers are drinking less wine than previous generations. A recent 2025 Gallup poll found that only 54% of U.S. adults drink alcohol, the lowest level Gallup has recorded in its nearly 90 years of tracking alcohol consumption. Per-capita wine consumption and total wine consumption are now declining together for the first time in modern history \u2014 ending the demographic cushion that once allowed producers to absorb soft years without structural damage."),
      t("The capital that fueled vineyard expansion during the 2010s has become more expensive. Interest rates rose, and the easy financing that underpinned land valuations built on expected price appreciation is no longer available on the same terms. Recent vineyard sales in Napa have drawn buyers framing land as a hedge against dollar volatility \u2014 not a bet on local wine demand."),
      t("At the same time, the contracts that once locked in Napa\u2019s premium are now under pressure. Some wineries are walking away from agreements that growers say were binding. The legal battles now brewing in the valley represent a direct confrontation between two sets of assumptions \u2014 the growers\u2019 assumption that the contracts and the prices they reflected were durable, and the wineries\u2019 calculation that the market has changed enough to justify exit."),
      t("The growers who took on debt, expanded acreage or planted new blocks under the historical growth assumptions are now facing a gap between what those assumptions implied and what the market is delivering. That gap, measured in dollars per ton and extrapolated across acres and years, is not a rounding error. It is the difference between a viable operation and a distressed one."),
      t("Taken together, these forces point to a market that has entered a different phase of its economic cycle \u2014 one where the growth curve that shaped Napa Valley for nearly half a century can no longer be taken for granted."),
      h("The Broader Picture"),
      t("The statewide picture offers context. California crushed 2.62 million tons in 2025 \u2014 8% below 2024 and 23% below the five-year average of 3.6 million tons, the lightest harvest since 1999. For the wine industry overall, that reduction in supply is welcome. \u201CThe decrease in tons is still very positive news for the industry overall,\u201D said Steve Fredricks, president of Turrentine Brokerage, in a March 13, 2026 market assessment. But Turrentine\u2019s own North Coast analyst flagged a critical caveat: published district averages overstate what growers negotiating new contracts actually receive. Napa Valley was a relative outlier: Cabernet Sauvignon tonnage declined only 1.3% from 2024, less than the industry had expected, and Napa maintained the highest district average price in California at $6,767 per ton. But even in Napa, Turrentine\u2019s North Coast analyst noted that district averages are not representative of spot market prices for new contracts."),
      t("For consumers, the dynamics are mixed. A lighter harvest and lower grape prices can eventually translate to more accessible wine at retail \u2014 but that benefit moves slowly through the supply chain, and only if growers remain solvent long enough to plant and tend future vintages. The more immediate market signal is a shift toward lighter white varieties: Sauvignon Blanc tonnage increased 22,000 tons statewide in 2025 and Pinot Gris rose 8,000 tons, even as red varieties contracted sharply. Audra Cooper, vice president at Turrentine, described the season as representing \u201Ccontinued challenges for growers and wineries that were strikingly apparent at harvest.\u201D"),
    ],
    pullQuote: "The 2025 preliminary weighted average return of $8,933 per ton marks the first back-to-back annual decline in the modern data series.",
    links: [
      { label: "Interactive article", url: "https://napaserve.org/under-the-hood/napa-cab-2025" },
      { label: "2025 Preliminary Crush Report", url: "https://www.cdfa.ca.gov/statistics/pdfs/2025PreliminaryCrushReport.pdf" },
      { label: "Turrentine Brokerage market commentary", url: "https://www.winebusiness.com/news/article/273456" },
    ],
    captions: [
      { number: 1, title: "Weighted Average Price, Napa County Cabernet Sauvignon (1976\u20132025)", description: "Price per ton from 1976 through 2025 preliminary, showing the first two-year consecutive decline in the modern data series", source: "CDFA-USDA-NASS Grape Crush Reports, Table 6, District 4" },
      { number: 2, title: "Year-Over-Year Price Change, Napa Cabernet Sauvignon", description: "Annual percentage change in weighted average grower return per ton", source: "CDFA-USDA-NASS Grape Crush Reports, Table 6, District 4" },
      { number: 3, title: "Harvest Volume, Napa County Cabernet Sauvignon (tons crushed)", description: "Total tons crushed annually showing 2025 decline", source: "CDFA-USDA-NASS Grape Crush Reports, Table 6, District 4" },
      { number: 4, title: "Price vs. Volume Scatter, Napa Cabernet Sauvignon", description: "Relationship between annual tons crushed and weighted average price per ton", source: "CDFA-USDA-NASS Grape Crush Reports, Table 6, District 4" },
      { number: 5, title: "Napa County Grape Prices by Variety (2023\u20132025)", description: "Weighted average price per ton across five major varietals", source: "CDFA-USDA-NASS Grape Crush Reports, Table 6, District 4" },
      { number: 6, title: "Stat Box \u2014 Key 2025 Metrics", description: "Summary statistics panel showing 2025 preliminary weighted average, peak year comparison and volume figures", source: "CDFA-USDA-NASS Grape Crush Reports, Table 6, District 4" },
    ],
    sources: [
      "CDFA/USDA-NASS. 2025 Preliminary Crush Report. California Department of Food and Agriculture, March 2026. https://www.cdfa.ca.gov/statistics/pdfs/2025PreliminaryCrushReport.pdf",
      "Fredricks, Steve; Klier, Christian; Cooper, Audra. Turrentine Brokerage North Coast market commentary. Wine Business Monthly, March 13, 2026. https://www.winebusiness.com/news/article/273456",
      "Proctor, Glenn. Ciatti Company market commentary. San Francisco Chronicle, March 13, 2026. https://www.sfchronicle.com/food/wine/article/napa-grape-prices-2025-20219485.php",
    ],
  },
  "sonoma-cab-2025": {
    headline: "Sonoma Grape Prices Fall for a Second Year",
    publication: "Sonoma County Features",
    slug: "sonoma-cab-2025",
    dateline: "SANTA ROSA, Calif.",
    body: [
      t("Sonoma County\u2019s weighted average grape price fell for the second consecutive year in 2025, driven by declines in Cabernet Sauvignon and several key varietals. The charts below draw directly from CDFA crush report data to show how Sonoma\u2019s wine-grape economy is shifting \u2014 and how it compares to neighboring Napa County."),
      h("The Overall Trend: Down for the Second Straight Year"),
      t("SANTA ROSA, Calif. \u2014 Sonoma County grapes fetched a district-wide weighted average of $2,761 per ton in 2025, according to the preliminary CDFA crush report \u2014 down from $2,927 in 2024 and $2,975 in 2023. That is a 5.7% decline year-over-year, compounding a 1.6% drop the year before. Over two years the county has shed roughly $214 per ton in average grower returns."),
      t("The decline is broad-based but not uniform. Cabernet Sauvignon and Sauvignon Blanc took the steepest hits in percentage terms, while Pinot Noir \u2014 Sonoma\u2019s flagship cool-climate grape \u2014 held up comparatively well."),
      c(1),
      h("Varietal Breakdown: Cab Leads the Decline"),
      t("Cabernet Sauvignon, which commands the highest per-ton price among Sonoma red varietals, fell from $3,061 in 2023 to $2,773 in 2025 \u2014 a cumulative drop of nearly $289 per ton, or 9.4%. In a county where Cab anchors the premium tier, that slide reverberates through tasting-room margins and grape-purchase contracts alike."),
      t("Pinot Noir, by contrast, dipped just 1.6% over the same two-year window \u2014 from $3,881 to $3,818. It remains the county\u2019s highest-priced varietal overall, reflecting the enduring strength of Russian River Valley and Sonoma Coast appellations for cool-climate Pinot."),
      t("Chardonnay edged down from $2,560 to $2,429 (\u22125.1%), while Sauvignon Blanc fell from $2,054 to $1,904 (\u22127.3%). Of the major white varietals, Sauvignon Blanc saw the sharpest percentage decline \u2014 possibly reflecting oversupply pressure from Lake County and other value-oriented districts."),
      t("The chart below shows how each varietal performed across the two-year period."),
      c(2),
      h("Sonoma vs. Napa: Both Counties Declining, but at Different Speeds"),
      t("Napa County\u2019s overall weighted average also fell \u2014 from $7,029 in 2023 to $6,768 in 2025, a decline of 3.7%. But Napa\u2019s slide is shallower in percentage terms than Sonoma\u2019s 7.2% cumulative decline over the same window. Both counties are adjusting to a cooler market after the pandemic-era price surge, but Napa\u2019s brand premium provides a wider cushion."),
      t("The year-over-year chart below puts the two counties side by side. In 2024, Sonoma fell 1.6% while Napa dropped 1.3%. In 2025, the gap widened: Sonoma declined 5.7% versus Napa\u2019s 2.5%. The disparity suggests that mid-tier pricing regions face steeper pressure when the market softens."),
      c(3),
      h("The Gap Chart: Napa\u2019s Premium over Sonoma Is Widening"),
      t("The Napa-to-Sonoma price ratio has climbed from 2.36x in 2023 to 2.45x in 2025. In dollar terms, Napa grapes now command roughly $4,006 more per ton than Sonoma\u2019s \u2014 up from $4,054 in 2023 on an absolute basis, but representing a growing proportional gap as Sonoma\u2019s base price erodes faster."),
      t("For growers deciding where to invest, the ratio is a shorthand for brand premium. A higher ratio suggests that the \u201CNapa Valley\u201D appellation captures more consumer willingness-to-pay relative to \u201CSonoma County.\u201D That gap has structural implications for land values, replanting decisions and the long-term competitiveness of Sonoma\u2019s grape market."),
      c(4),
      h("The Broader Picture"),
      t("The statewide picture offers context. California crushed 2.62 million tons in 2025 \u2014 8% below 2024 and 23% below the five-year average of 3.6 million tons, the lightest harvest since 1999. For the wine industry overall, that reduction in supply is welcome. \u201CThe decrease in tons is still very positive news for the industry overall,\u201D said Steve Fredricks, president of Turrentine Brokerage, in a March 13, 2026 market assessment. But Turrentine\u2019s own North Coast analyst flagged a critical caveat: published district averages overstate what growers negotiating new contracts actually receive. For Sonoma County chardonnay, the published district average of $2,370 contrasts with spot market prices closer to $800 per ton \u2014 a gap of more than 65%."),
      t("For consumers, the dynamics are mixed. A lighter harvest and lower grape prices can eventually translate to more accessible wine at retail \u2014 but that benefit moves slowly through the supply chain, and only if growers remain solvent long enough to plant and tend future vintages. The more immediate market signal is a shift toward lighter white varieties: Sauvignon Blanc tonnage increased 22,000 tons statewide in 2025 and Pinot Gris rose 8,000 tons, even as red varieties contracted sharply. Audra Cooper, vice president at Turrentine, described the season as representing \u201Ccontinued challenges for growers and wineries that were strikingly apparent at harvest.\u201D"),
      h("What the Data Don\u2019t Show"),
      t("The 2025 figures are preliminary. The CDFA\u2019s final crush report \u2014 expected in late April 2026 \u2014 often revises district-level averages by a few percentage points as late-reported contracts filter in. That said, the direction of the trend is unlikely to reverse: Sonoma grape prices are adjusting downward."),
      t("Several factors bear watching. First, tonnage: a smaller 2025 harvest could concentrate value and soften the price decline on a per-ton basis. Second, inventory levels in the bulk market \u2014 if wineries are sitting on unsold wine, contract prices for the 2026 vintage could face further pressure. Third, the ongoing acreage reduction across Sonoma, as some growers pull vines in response to lower returns and rising costs. That supply correction, if it continues, could eventually support prices \u2014 but not overnight."),
      t("We will update this article when the final 2025 crush report is published and revise the charts accordingly. All data powering these charts is served live from the NapaServe Community Data Commons, so the numbers will update automatically when new data is loaded."),
    ],
    pullQuote: "Sonoma County\u2019s overall weighted average grape price has declined for two consecutive years \u2014 a pattern not seen since the early 2000s restructuring of the North Coast wine economy.",
    links: [
      { label: "Interactive article", url: "https://napaserve.org/under-the-hood/sonoma-cab-2025" },
      { label: "2025 Preliminary Crush Report", url: "https://www.cdfa.ca.gov/statistics/pdfs/2025PreliminaryCrushReport.pdf" },
    ],
    captions: [
      { number: 1, title: "Weighted Average Price, Sonoma County Cabernet Sauvignon (2015\u20132025)", description: "Price per ton showing two-year consecutive decline", source: "CDFA-USDA-NASS Grape Crush Reports, Table 6, District 3" },
      { number: 2, title: "Year-Over-Year Price Change, Sonoma Cabernet Sauvignon", description: "Annual percentage change in weighted average grower return", source: "CDFA-USDA-NASS Grape Crush Reports, Table 6, District 3" },
      { number: 3, title: "Sonoma County Grape Prices by Variety (2023\u20132025)", description: "Weighted average price per ton across major varietals", source: "CDFA-USDA-NASS Grape Crush Reports, Table 6, District 3" },
      { number: 4, title: "Stat Box \u2014 Key 2025 Metrics", description: "Summary statistics panel for Sonoma County 2025 grape prices", source: "CDFA-USDA-NASS Grape Crush Reports, Table 6, District 3" },
    ],
    sources: [
      "CDFA/USDA-NASS. 2025 Preliminary Crush Report. California Department of Food and Agriculture, March 2026. https://www.cdfa.ca.gov/statistics/pdfs/2025PreliminaryCrushReport.pdf",
      "Fredricks, Steve; Klier, Christian; Cooper, Audra. Turrentine Brokerage North Coast market commentary. Wine Business Monthly, March 13, 2026. https://www.winebusiness.com/news/article/273456",
      "Proctor, Glenn. Ciatti Company market commentary. San Francisco Chronicle, March 13, 2026. https://www.sfchronicle.com/food/wine/article/napa-grape-prices-2025-20219485.php",
    ],
  },
  "lake-county-cab-2025": {
    headline: "Lake County Grape Prices Have Fallen 38% in Two Years",
    publication: "Lake County Features",
    slug: "lake-county-cab-2025",
    dateline: "LAKEPORT, Calif.",
    body: [
      t("LAKEPORT, Calif. \u2014 The 2025 preliminary grape crush report, published by the California Department of Food and Agriculture in cooperation with USDA\u2019s National Agricultural Statistics Service, shows Lake County\u2019s district-wide weighted average price falling to $1,165.52 per ton \u2014 down 5.7% from 2024 and 37.9% below the 2023 figure of $1,877.76."),
      t("That two-year decline is the steepest of the three North Coast districts examined in this series. Napa County\u2019s overall average fell 3.7% over the same period. Sonoma County\u2019s fell 7.2%. Lake County\u2019s fell nearly five times faster than Napa\u2019s and more than five times faster than Sonoma\u2019s."),
      t("The data point to something more than a soft market. They suggest a structural withdrawal of buyers \u2014 particularly for red wine grapes \u2014 that is reordering the economics of Lake County viticulture faster than growers or lenders may have anticipated."),
      c(1),
      h("The Chardonnay Collapse"),
      t("No varietal tells Lake County\u2019s 2025 story more starkly than chardonnay. In 2023, Lake County growers received $964.97 per ton for chardonnay \u2014 already well below the Sonoma average of $2,559.87 and the Napa average of $3,690.32, but a viable price point for lower-cost operations."),
      t("In 2024, the chardonnay price rose sharply to $1,241.12 per ton \u2014 a 28.6% increase that suggested a possible recovery in buyer interest. That signal proved misleading. In 2025, the weighted average collapsed to $287.65 per ton \u2014 a single-year decline of 76.8%, the most severe of any varietal in any North Coast district in the three-year dataset."),
      t("At $287.65 per ton, the chardonnay average approaches \u2014 and in many operations may fall below \u2014 the cost of harvest and hauling alone. For growers who contracted at 2024 prices or made planting decisions based on that year\u2019s improvement, the 2025 figure represents a severe and potentially unrecoverable loss."),
      c(2),
      h("Varietal by Varietal"),
      t("Cabernet sauvignon fell 49.6% over two years, from $2,322.04 to $1,171.26 per ton. At roughly $1,171 per ton, Lake County cab sauv commands just 15.4% of the Napa price and 42.2% of the Sonoma price for the same varietal. The appellation discount is not a gradual differential \u2014 it is a structural reality that shapes what Lake County growers can plant, borrow and plan around."),
      t("Pinot noir declined 39.6%, from $2,230.73 to $1,347.39 per ton. Unlike Sonoma, where pinot noir is the county\u2019s strongest card and commands a premium over Napa, Lake County pinot noir sits well below both neighbors. Sonoma received $3,817.65 per ton for pinot noir in 2025 \u2014 2.8 times the Lake County figure."),
      t("Sauvignon blanc is the relative bright spot \u2014 the only varietal that declined by less than 20% over the two-year period, falling 16% from $1,424.21 to $1,195.73. The variety remains a thin market in Lake County by tonnage, but its relative resilience is worth noting."),
      t("Cabernet franc declined 23.2%, from $2,352.49 to $1,807.31. The variety showed strength in both Napa and Sonoma \u2014 rising 4.7% and 3.4% respectively \u2014 but Lake County did not participate in that trend."),
      t("The chart below shows the percentage change by varietal compared with Sonoma County over the same period."),
      c(3),
      h("The Appellation Gap"),
      t("The fourth chart in this series places Lake County in the context of all three North Coast districts. The price gaps are large enough to reshape how buyers, lenders and growers in each county approach the same crop."),
      t("For cabernet sauvignon, Napa County growers received 7.6 times what Lake County growers received in 2025. For chardonnay \u2014 the most extreme case \u2014 Napa received 12.8 times the Lake County price and Sonoma received 8.4 times. These are not marginal differences. They reflect fundamentally different market positions."),
      t("For Lake County growers, the comparison is not simply discouraging \u2014 it is clarifying. The market has signaled which appellations command sustained buyer interest and which do not. At current price levels, the economics of planting or maintaining vineyards in Lake County depend heavily on cost structure, water access, existing contract terms and the specific varietal mix of each operation."),
      c(4),
      h("The Broader Picture"),
      t("The statewide picture offers context. California crushed 2.62 million tons in 2025 \u2014 8% below 2024 and 23% below the five-year average of 3.6 million tons, the lightest harvest since 1999. For the wine industry overall, that reduction in supply is welcome. \u201CThe decrease in tons is still very positive news for the industry overall,\u201D said Steve Fredricks, president of Turrentine Brokerage, in a March 13, 2026 market assessment. But Turrentine\u2019s own North Coast analyst flagged a critical caveat: published district averages overstate what growers negotiating new contracts actually receive. For Sonoma County chardonnay, the published district average of $2,370 contrasts with spot market prices closer to $800 per ton \u2014 a gap of more than 65%. The same disconnect between published averages and actual spot market prices applies in Lake County, where the district average already sits well below neighboring appellations."),
      t("For consumers, the dynamics are mixed. A lighter harvest and lower grape prices can eventually translate to more accessible wine at retail \u2014 but that benefit moves slowly through the supply chain, and only if growers remain solvent long enough to plant and tend future vintages. The more immediate market signal is a shift toward lighter white varieties: Sauvignon Blanc tonnage increased 22,000 tons statewide in 2025 and Pinot Gris rose 8,000 tons, even as red varieties contracted sharply. Audra Cooper, vice president at Turrentine, described the season as representing \u201Ccontinued challenges for growers and wineries that were strikingly apparent at harvest.\u201D"),
      h("What the Data Don\u2019t Show"),
      t("The CDFA weighted average figures blend multi-year contracts signed at earlier price levels with new deals negotiated in current market conditions. Turrentine Brokerage has noted for the second consecutive year that district averages are not representative of spot market prices for new contracts. The published averages overstate what growers entering or renegotiating agreements are likely to receive."),
      t("The broader context compounds the concern. California\u2019s 2025 harvest was the lightest since 1999, down 23% from the five-year average. An estimated 57,000 acres were removed statewide. In Lake County, where margins are already compressed, the decision to leave fruit unpicked or remove vines entirely represents a calculation that the cost of farming exceeds the return available in today\u2019s market."),
      t("What the crush report cannot show is how many Lake County acres are being quietly idled, how many contracts are under legal dispute and how many growers are approaching the limits of what their lenders will carry. Those figures will emerge in other data \u2014 foreclosure filings, vineyard sales, labor employment numbers \u2014 over the months ahead."),
      t("For now, the crush data establish the baseline: Lake County\u2019s weighted average grape price has declined nearly 38% in two years, the most severe contraction of any North Coast district in the period examined. The county\u2019s wine-grape economy has entered a different phase, and the data suggest that phase has not yet run its course."),
    ],
    pullQuote: "Lake County\u2019s weighted average grape price has dropped 38% since 2023 \u2014 the steepest two-year decline of any North Coast wine region in the modern data series.",
    links: [
      { label: "Interactive article", url: "https://napaserve.org/under-the-hood/lake-county-cab-2025" },
      { label: "2025 Preliminary Crush Report", url: "https://www.cdfa.ca.gov/statistics/pdfs/2025PreliminaryCrushReport.pdf" },
    ],
    captions: [
      { number: 1, title: "Weighted Average Price, Lake County Cabernet Sauvignon (2015\u20132025)", description: "Price per ton showing steep two-year decline", source: "CDFA-USDA-NASS Grape Crush Reports, Table 6, District 6" },
      { number: 2, title: "Year-Over-Year Price Change, Lake County Cabernet Sauvignon", description: "Annual percentage change in weighted average grower return", source: "CDFA-USDA-NASS Grape Crush Reports, Table 6, District 6" },
      { number: 3, title: "Lake County Grape Prices by Variety (2023\u20132025)", description: "Weighted average price per ton across major varietals including 70% chardonnay collapse", source: "CDFA-USDA-NASS Grape Crush Reports, Table 6, District 6" },
      { number: 4, title: "Stat Box \u2014 Key 2025 Metrics", description: "Summary statistics panel for Lake County 2025 grape prices", source: "CDFA-USDA-NASS Grape Crush Reports, Table 6, District 6" },
    ],
    sources: [
      "CDFA/USDA-NASS. 2025 Preliminary Crush Report. California Department of Food and Agriculture, March 2026. https://www.cdfa.ca.gov/statistics/pdfs/2025PreliminaryCrushReport.pdf",
      "Fredricks, Steve; Klier, Christian; Cooper, Audra. Turrentine Brokerage North Coast market commentary. Wine Business Monthly, March 13, 2026. https://www.winebusiness.com/news/article/273456",
      "Proctor, Glenn. Ciatti Company market commentary. San Francisco Chronicle, March 13, 2026. https://www.sfchronicle.com/food/wine/article/napa-grape-prices-2025-20219485.php",
    ],
  },
  "napa-gdp-2024": {
    headline: "Napa\u2019s Economy Looks Bigger Than It Is",
    publication: "Napa Valley Features",
    slug: "napa-gdp-2024",
    dateline: "NAPA, Calif.",
    body: [
      t("NAPA, Calif. \u2014 The number most often cited to describe Napa County\u2019s economy is its gross domestic product: $14.59 billion in 2024, up from $10.75 billion in 2016. That is a 35.8% increase over eight years, a figure that implies a valley growing steadily richer. Adjusted for inflation, the same economy grew 4.6%. Of the apparent $3.84 billion in GDP growth since 2016, roughly 87 cents of every dollar was inflation. Real output \u2014 the actual volume of goods and services produced \u2014 barely moved."),
      t("That gap is not a statistical footnote. It is the economy\u2019s most important single data point, and it reshapes how every other indicator in this column should be read."),
      h("The GDP Gap"),
      t("When nominal GDP and real GDP move together, an economy is genuinely expanding. When they diverge, price increases are doing the work that output growth cannot. In Napa County, the two measures were essentially identical through 2016 \u2014 the implicit price deflator, which measures how much more expensive the local economy has become relative to the 2017 baseline, sat at 99.4. By 2021, it reached 111.1. By 2024 it stood at 129.0, meaning that prices across the county\u2019s economic base are 29% higher than they were seven years ago."),
      t("Real GDP peaked in 2021 at $11.46 billion \u2014 the post-COVID rebound year \u2014 and has declined slightly since, sitting at $11.31 billion in 2024, still $140 million below that peak. The economy the headline number describes does not exist in real terms."),
      c(1),
      t("This pattern tracks closely with what this column described in \u201CUnder the Hood: Two Reports, One Warning \u2014 The Collapse That Looks Like Premiumization\u201D (January 2026) at the product level. There, rising average bottle prices masked falling shipment volumes, creating the appearance of a resilient market. Here, rising price levels across the county\u2019s entire economic base create the appearance of a growing economy. The mechanism is the same: inflation does the arithmetic while real activity stagnates."),
      h("The Wine Industry as Structural Load-Bearer"),
      t("Understanding what is at stake requires understanding how deeply the wine industry is embedded in everything that funds and employs Napa County."),
      t("The most comprehensive recent assessment is the Insel & Company economic impact study commissioned by Napa Valley Vintners, published in May 2025 using 2022 data. Its findings establish the structural baseline. The wine and grape industry accounted for 55,875 full-time equivalent jobs in Napa County in 2022 \u2014 72% of the county\u2019s total employment of 77,788. It generated $3.82 billion in wages, representing 73.7% of all labor compensation received in the county. It produced $507 million in county and local tax revenue, including $156 million in property taxes \u2014 27% of all property tax collected countywide."),
      t("The county does not have a wine industry alongside other industries. Wine is the industry, and the other sectors \u2014 hospitality, retail, professional services, logistics \u2014 are in large part its downstream expression."),
      t("This concentration is not new, but its implications have changed. When wine demand was expanding, the concentration was an asset: a single rising tide lifted employment, wages and tax revenues together. As wine demand contracts, the same concentration becomes a transmission mechanism for the opposite effect. There is no sector large enough to offset the wine industry if it shrinks."),
      h("The Jobs Engine"),
      t("Employment data from the Bureau of Labor Statistics tracks leisure and hospitality employment in Napa County back to 1990. The trajectory through 2019 told a clear story of growth. From the post-financial crisis trough in 2009 \u2014 when the sector employed about 9,000 workers \u2014 employment climbed steadily to a peak of 14,300 in June 2019, adding roughly 5,300 jobs over a decade. That pace, sustained over ten years, implied a sector still expanding to meet rising demand."),
      t("Since June 2019, net change in leisure and hospitality employment: approximately \u2212200 jobs. Six years of essentially zero net growth, against a backdrop of nominal GDP that rose 27% over the same period."),
      c(2),
      t("The projection from the prior decade\u2019s growth rate makes the break visible. If the 2009\u20132019 trend had continued, leisure and hospitality employment in Napa County would stand near 18,900 today. It stands at 14,100. The gap \u2014 roughly 4,800 jobs relative to prior trend \u2014 is not a temporary shortfall waiting to be recovered. It reflects a structural break in the relationship between economic activity and employment that this column first documented in \u201CUnder the Hood: More Rooms Have Equaled Fewer Jobs in Napa County\u201D (August 2025). More rooms were built, more nominal dollars flowed through the economy, and the jobs engine stalled anyway."),
      h("The Inflation Squeeze"),
      t("The 29% rise in Napa\u2019s price deflator since 2017 has a direct human translation. A worker earning the county\u2019s 2022 average wage of $67,518 needs roughly $87,000 today to maintain equivalent purchasing power. Leisure and hospitality workers, whose average compensation sits well below the county average, face a sharper squeeze. Their wages must grow faster simply to stay in place, in a sector that has produced no net new employment in six years."),
      t("This is the other face of the GDP gap. From the county\u2019s perspective, nominal revenues and tax collections look stable or rising. From a worker\u2019s perspective, real purchasing power is eroding and the job market in the sectors most accessible to non-specialist workers has not expanded. Both things are true simultaneously, and neither cancels the other."),
      h("What Contraction Does to the County"),
      t("The scenarios below apply percentage changes to the 2022 wine industry baseline from the Insel & Company study. They are illustrative, not forecasts. They show the order of magnitude at stake depending on how the industry\u2019s structural adjustment unfolds."),
      t("A 10% contraction removes approximately 5,600 jobs, $382 million in wages and $51 million in annual county tax revenue, including roughly $16 million in property tax. A 20% contraction removes about 11,200 jobs, $765 million in wages and $101 million in local taxes. At 30%, the losses reach 16,800 jobs, $1.15 billion in wages and $152 million in annual local tax revenue \u2014 approaching 30% of the county\u2019s total local tax collections."),
      c(3),
      t("Property tax warrants separate attention. Wine-related properties generated $156 million in property tax in 2022 \u2014 27% of all county property tax. Seven of the ten largest property taxpayers in the county that year were wine or vineyard properties that had recently changed ownership or undergone significant construction. As established in \u201CUnder the Hood: 2025 Napa Grape Prices Slip After a Record High\u201D (March 2026), vineyard valuations built on the historical price-appreciation curve are now under pressure. Sales of premium vineyards at lower prices \u2014 or delays in ownership transfers that would trigger Proposition 13 reassessments \u2014 directly compress a revenue stream the county has long counted on."),
      h("The Broader Picture"),
      t("Three data series, read together, describe the same underlying condition."),
      t("Nominal GDP says Napa\u2019s economy grew 35.8% since 2016. Real GDP says it grew 4.6%. Leisure and hospitality employment says it grew essentially zero percent since 2019, despite the nominal expansion. All three are accurate. Together they describe an economy running hard on price increases while real productive capacity barely moves and the workforce most exposed to structural risk \u2014 hospitality workers, service employees, vineyard and cellar labor \u2014 absorbs a 29% increase in the cost of living against a labor market that has not created meaningful new employment in half a decade."),
      t("The wine industry\u2019s contraction scenarios are not projections of crisis. They are a measure of how much margin the county\u2019s economic and fiscal structure has to absorb adjustment before the effects move from the balance sheets of large producers to the tax receipts, payrolls and service budgets that fund the county itself."),
      h("What the Data Don\u2019t Show"),
      t("These scenarios cannot capture the timing or pace of adjustment, which matters as much as the magnitude. A 10% contraction spread over five years produces different fiscal and employment effects than the same contraction compressed into 18 months. They also cannot capture the distribution of impact across winery size, business model and employment type. The Insel & Company study documents that the industry is not a single entity \u2014 it spans 1,521 operating wineries, dozens of independent vineyard managers, thousands of tourism-dependent small businesses and a supply chain that reaches from oak barrel importers to glass manufacturers. How contraction moves through that network will not be uniform."),
      t("What the data do show is the structural precondition: an economy whose nominal size substantially exceeds its real output, whose primary industry is under multi-year demand pressure, whose jobs engine has stalled and whose tax base is built on the valuations and activity levels of that same industry."),
      t("The question Napa\u2019s planners, policymakers, community members and civic leaders face is not whether adjustment is coming. The prior installments in this series \u2014 from the unharvested acres analysis in November 2025 to the grape price trajectory in March 2026 to the capacity and capital contraction documented last week \u2014 establish that it is already underway. The question is how much of that adjustment is legible in the data that drive planning decisions, and how much is still hidden inside a nominal GDP figure that tells a story the real economy stopped living eight years ago."),
    ],
    pullQuote: "Of the apparent $3.84 billion in GDP growth since 2016, roughly 87 cents of every dollar was inflation.",
    links: [
      { label: "Interactive article", url: "https://napaserve.org/under-the-hood/napa-gdp-2024" },
      { label: "FRED \u2014 Nominal GDP, Napa County", url: "https://fred.stlouisfed.org/series/GDPALL06055" },
      { label: "FRED \u2014 Real GDP, Napa County", url: "https://fred.stlouisfed.org/series/REALGDPALL06055" },
      { label: "Insel & Company economic impact study", url: "https://napavintners.com/downloads/ECONOMIC-IMPACT-REPORT-NVV-2022.pdf" },
    ],
    captions: [
      { number: 1, title: "Nominal vs. Real GDP \u2014 Napa County, 2016\u20132024", description: "Nominal GDP (blue) vs. real GDP in chained 2017 dollars (green), with inflation gap shaded", source: "Bureau of Economic Analysis via FRED \u2014 GDPALL06055 (nominal), REALGDPALL06055 (real)" },
      { number: 2, title: "Leisure & Hospitality Employment \u2014 Napa County, 2009\u20132025", description: "Actual employment (blue) vs. 2009\u20132019 trend projection (amber dashed), with gap shaded from 2019", source: "Bureau of Labor Statistics, NAPA906LEIHN" },
      { number: 3, title: "Contraction Scenarios \u2014 Jobs and Tax Revenue", description: "Grouped bar chart showing jobs (thousands, left axis) and county taxes ($M, right axis) across six scenarios from +5% to \u221230%", source: "Insel & Company for Napa Valley Vintners, May 2025 (2022 data)" },
    ],
    sources: [
      "Bureau of Economic Analysis via FRED. \u201CGross Domestic Product: All Industries in Napa County, CA (GDPALL06055).\u201D Updated February 5, 2026. https://fred.stlouisfed.org/series/GDPALL06055",
      "Bureau of Economic Analysis via FRED. \u201CReal Gross Domestic Product: All Industries in Napa County, CA (REALGDPALL06055).\u201D https://fred.stlouisfed.org/series/REALGDPALL06055",
      "Bureau of Labor Statistics. \u201CLeisure and Hospitality Employment, Napa MSA (NAPA906LEIHN).\u201D https://fred.stlouisfed.org/series/NAPA906LEIHN",
      "Insel, Richard. \u201CThe Economic Impact of Napa County\u2019s Wine and Grape Industry on the Economies of Napa County, California and the US.\u201D Napa Valley Vintners, May 2025. https://napavintners.com/downloads/ECONOMIC-IMPACT-REPORT-NVV-2022.pdf",
    ],
  },
  "napa-population-2025": {
    headline: "Where Napa\u2019s Growth Actually Lives",
    publication: "Napa Valley Features",
    slug: "napa-population-2025",
    dateline: "NAPA VALLEY, Calif.",
    body: [
      t("NAPA VALLEY, Calif. \u2014 The California Department of Finance\u2019s most recent E-1 population estimates \u2014 released in May 2025 \u2014 show Napa County gained 709 residents in 2024, for a total of 136,124 as of January 1, 2025. The county\u2019s 0.52% year-over-year growth rate led all nine Bay Area counties. The next E-1 release, reflecting January 1, 2026 figures, is expected from DOF in May 2026."),
      t("Of those 709 new residents, 639 \u2014 or 90% \u2014 were added in one city: American Canyon. Every other part of the county, taken together, gained 70 people."),
      t("Napa city added 216. Calistoga lost 21. St. Helena lost 7. Yountville lost 17. The unincorporated balance of the county lost 101. The three upvalley cities and the unincorporated county combined lost 146 residents."),
      t("Strip out American Canyon and the remaining 113,728 residents of Napa County \u2014 83% of the population \u2014 gained 70 people. That is a growth rate of 0.06%, which rounds to zero."),
      c(2),
      h("The New Pattern Is the Old Pattern"),
      t("In 2000, American Canyon had 9,774 residents \u2014 7.9% of Napa County\u2019s 124,279. By 2010 it had nearly doubled to 19,454. By 2025 it stands at 22,396 \u2014 16.5% of the county."),
      t("Since 2000, American Canyon has added roughly 12,622 residents. The rest of Napa County, taken together, has added approximately 750. Subtract American Canyon entirely, and the county outside that one city has posted essentially flat population over a quarter century."),
      t("St. Helena\u2019s 2025 population of 5,349 is roughly 10% below its 2000 census count. Yountville\u2019s 2,638 is down by a similar margin. Calistoga is within 200 residents of where it stood 25 years ago. The city of Napa is up modestly. The unincorporated balance of the county is near flat."),
      t("Last year\u2019s E-1 release, documented in this column in May 2025, showed the same geometry: a narrow southern gain, an upvalley decline, and county totals still running well below the 2016 peak. This year\u2019s release extends that reading across a second consecutive year of growth and a longer time series. A pattern that appears once is a data point. A pattern that persists across 25 years of census and state records \u2014 through boom, pandemic, wildfire and recovery \u2014 is a structural condition."),
      c(3),
      h("Still Below Peak, After Nine Years"),
      t("Napa County reached its modern population peak of 141,119 in 2016, according to DOF\u2019s E-4 May 2025 benchmark (2011\u20132020, with 2010 and 2020 Census benchmarks). It has not recovered. The county stood at 136,124 on January 1, 2025 \u2014 4,995 residents below that peak, or 3.5% lower. The 2025 figure is within 360 residents of the county\u2019s 2010 census count of 136,484. In effect, the past 15 years have produced no net population change at the county level."),
      t("What has changed in that time is where the residents live. In 2010, American Canyon held 14.3% of the county. In 2025, it holds 16.5%. Every other jurisdiction has held flat, declined, or shrunk as a share of the county."),
      t("Housing construction mirrors the same geography. In 2024, Napa County added 658 housing units \u2014 a 1.2% increase. American Canyon and the city of Napa together accounted for roughly 91% of that total. The three upvalley cities combined added 21 units. American Canyon\u2019s housing stock grew 5.0% in one year, among the fastest percent-change gains of any incorporated jurisdiction in California."),
      c(1),
      h("One County Line, Two Different Commutes"),
      t("Napa Valley is 30 miles long and narrow. A worker employed in Calistoga or St. Helena who lives in American Canyon faces a 25- to 35-mile commute \u2014 roughly equivalent to commuting from Cloverdale in Sonoma County or Lakeport in Lake County, at materially lower housing costs in both comparison cases. The county line is not the relevant labor-market boundary for many upvalley workers. For an hourly worker priced out of St. Helena, leaving Napa County is often a shorter commute than staying in it."),
      t("American Canyon\u2019s housing surge is driven by the reverse dynamic: regional-scale developments \u2014 Watson Ranch, Lemos Pointe and others \u2014 built to serve Bay Area households for whom southern Napa County is an affordable alternative to Marin or the East Bay. The city sits at the intersection of State Route 29 and the corridor to Interstate 80, with direct access to Solano, Contra Costa and Alameda employment centers. U.S. Census LEHD \u2018On The Map\u2019 data indicate that only 11% of American Canyon workers also live in American Canyon \u2014 a ratio consistent with a bedroom community oriented outward rather than inward to Napa County\u2019s own labor market."),
      h("The Commuter Arithmetic"),
      t("The Napa Valley Transportation Authority\u2019s 2018 Napa Valley Travel Behavior Study found approximately 30,740 workers commuting into Napa County daily, and approximately 26,500 commuting out \u2014 a net inflow of about 4,240. The net inflow had been approximately 7,000 in 2015. The 40% decline in three years suggests the county\u2019s dependence on imported labor was softening well before the pandemic."),
      t("NVTA also observed that outbound Napa workers earned, on average, more than inbound workers. Inbound commuters skewed toward service, hospitality and agricultural wages. Outbound commuters included a larger share of professional, technical and managerial workers."),
      t("If the 2015\u20132018 trend continued at the same rate, Napa County would have crossed into net commuter outflow territory around 2024 \u2014 more workers leaving daily than arriving. That is an extrapolation, not a measurement. An updated NVTA or ACS commuting-flow study is required to confirm the crossover. The chart below shows the 2015 and 2018 NVTA values together with that linear extension."),
      c(4),
      h("More Rooms, Fewer Jobs per Room"),
      t("Napa County\u2019s visitor economy long offered a clean correlation between capacity and employment. Between 2009 and 2019, the county\u2019s lodging inventory grew by roughly 700 rooms and leisure-and-hospitality employment expanded by more than 5,000 jobs \u2014 a ratio of more than seven jobs added per hotel room added."),
      t("That ratio reversed. Between 2019 and 2024, roughly 382 rooms were added while leisure and hospitality employment fell by approximately 200, and food-services and drinking-places employment fell by roughly 470. The rooms-to-jobs ratio flipped from +7.6 to \u22120.5."),
      t("This is a sector-specific measure \u2014 employment yield in the visitor economy \u2014 not a comprehensive read on Napa County\u2019s labor market. But it captures a change in the single sector most frequently invoked to explain cross-county commuting: lodging capacity is no longer producing net new employment the way it used to."),
      c(5),
      h("Housing Has Grown. Jobs Have Not."),
      t("Between 2010 and 2024, Napa County\u2019s housing stock grew roughly 19%, adding approximately 9,000 units. Total nonfarm employment grew marginally over the same span. Intra-county weekday vehicle trips fell from approximately 72,100 in 2018 to 58,000 in 2024. If housing scarcity were the binding constraint on employment, inbound commuting and internal trip volumes would be climbing. They are not."),
      t("Affordability data make the structural point concrete. In 2010, the median Napa County home sold at roughly 4.5 times median household income. As of 2025, that ratio is approximately 8.6. Qualifying for a median-priced Napa County home at current mortgage rates requires a household income near $230,000. Median hospitality wages in Napa County run roughly $35,000 to $45,000. No amount of unit construction closes that gap without a corresponding change in the wage mix."),
      c(6),
      h("What the Data Show, and What They Don\u2019t"),
      t("Four observations are supported directly by the E-1 release, the long-run DOF and Census series, and BLS employment data: county population growth over the past two years has concentrated almost entirely in American Canyon; the geographic pattern has persisted for 25 years across multiple data vintages; housing growth has outpaced job growth since 2019; and the visitor economy\u2019s employment yield per added hotel room has reversed."),
      t("Three further readings are consistent with the data but not yet fully established: American Canyon\u2019s growth is driven more by regional labor markets than by Napa County\u2019s own; Napa County\u2019s net commuter inflow may have already crossed into outflow territory; and the wage structure of the county\u2019s dominant job sectors is the principal constraint on broader-based demographic recovery."),
      t("One question the available public data cannot yet answer: where do new American Canyon residents actually work, and what share of upvalley employers\u2019 workforces now live outside Napa County entirely? A countywide residency-and-commute survey \u2014 of the kind NVTA conducted in 2018 \u2014 would close that gap more quickly and at lower cost than any housing program the county is currently running. That is a measurement gap, not a policy recommendation."),
      t("What the E-1 release tells us, plainly, is where Napa County\u2019s growth is landing. It is landing in American Canyon. The rest of the county \u2014 eight out of ten residents \u2014 is holding roughly steady or slowly declining, as it has for most of this century. Until the conditions that produce that geography change, the next E-1 release is likely to read much like this one."),
    ],
    pullQuote: "Strip out American Canyon and the remaining 113,728 residents of Napa County \u2014 83% of the population \u2014 gained 70 people. That is a growth rate of 0.06%, which rounds to zero.",
    links: [
      { label: "Interactive article", url: "https://napaserve.org/under-the-hood/napa-population-2025" },
      { label: "NVF \u2014 American Canyon Grows While the Upvalley Shrinks (May 10, 2025)", url: "https://napavalleyfocus.substack.com/p/under-the-hood-american-canyon-grows" },
      { label: "NVF \u2014 Rethinking the Housing Narrative in Napa County (June 7, 2025)", url: "https://napavalleyfocus.substack.com/p/under-the-hood-rethinking-the-housing" },
      { label: "NVF \u2014 Is Napa Valley Building for a Future That Doesn\u2019t Exist? (August 31, 2024)", url: "https://napavalleyfocus.substack.com/p/under-the-hood-is-napa-valley-building" },
    ],
    captions: [
      { number: 1, title: "Napa County Population Trend, 2000\u20132025", description: "The county\u2019s 2025 count of 136,124 sits 4,995 residents below its 2016 peak of 141,119 and within 360 residents of its 2010 census count. After nine years, Napa County has not recovered its previous high", source: "U.S. Census Bureau Decennial Census (2000, 2010, 2020); California Department of Finance, E-4 Population Estimates, 2011\u20132020, with 2010 and 2020 Census Benchmarks (May 2025); DOF E-1 Population Estimates (May 2025). https://dof.ca.gov/forecasting/demographics/estimates/e-4-population-estimates-for-cities-counties-and-the-state-2011-2020-with-2010-and-2020-census-benchmark/" },
      { number: 2, title: "Population Change by Jurisdiction, 2024\u20132025", description: "American Canyon gained 639 residents \u2014 90 percent of Napa County\u2019s 709-resident net gain. Napa city added 216. Calistoga, St. Helena, Yountville and the unincorporated balance of the county all lost residents. Ordered north (top) to south (bottom)", source: "California Department of Finance, E-1 Population Estimates, January 1, 2024 and January 1, 2025. https://dof.ca.gov/forecasting/demographics/estimates-e1/" },
      { number: 3, title: "Population by Jurisdiction, 2000 vs. 2025", description: "American Canyon has grown 129 percent since 2000. St. Helena and Yountville are each down roughly 10 percent. The unincorporated balance of the county is down 18 percent. Most of Napa County\u2019s net population growth this century has been absorbed by one city", source: "U.S. Census Bureau Decennial Census (2000); California Department of Finance, E-1 Population Estimates (2025). https://dof.ca.gov/forecasting/demographics/estimates-e1/" },
      { number: 4, title: "Net Commuter Inflow to Napa County, 2015\u20132018 (with extrapolation)", description: "NVTA measured a net inflow of approximately 7,000 commuters in 2015 and approximately 4,240 in 2018 \u2014 a 40 percent decline in three years. The dashed bars are a linear extension of that trend for 2021 through 2030. The extrapolation is illustrative only. No updated NVTA or ACS study has confirmed a crossover into net outflow territory", source: "Napa Valley Transportation Authority, Napa Valley Travel Behavior Study (2018). Linear extension 2019\u20132030 by the author \u2014 illustrative only" },
      { number: 5, title: "Leisure and Hospitality Jobs Added per Hotel Room Added, 2009\u20132019 vs. 2019\u20132024", description: "From 2009 to 2019, each hotel room added in Napa County was associated with more than seven new leisure and hospitality jobs. Since 2019, the ratio has inverted: rooms have continued to be added, but leisure and hospitality employment has declined. This is a sector-specific employment-yield measure, not a comprehensive read on the Napa County labor market", source: "Bureau of Labor Statistics \u2014 Napa County Total Leisure and Hospitality (NAPA906LEIHN), Food Services and Drinking Places (SMU06349007072200001SA); STR Monthly Industry Report. https://fred.stlouisfed.org/series/NAPA906LEIHN" },
      { number: 6, title: "Napa County Housing Units and Total Nonfarm Employment, Indexed to January 2019 = 100", description: "Both series indexed to their January 2019 values. Housing has continued to grow through and past the pandemic; total nonfarm employment has not. The shaded area is the widening gap between residential capacity and workforce", source: "California Department of Finance, E-1H Housing Unit Estimates; Bureau of Labor Statistics, Napa County total nonfarm payrolls. https://dof.ca.gov/forecasting/demographics/estimates-e1/" },
    ],
    sources: [
      "California Department of Finance. \u201CE-1 Population Estimates for Cities, Counties, and the State with Annual Percent Change \u2014 January 1, 2024 and 2025.\u201D Sacramento, California, May 2025. https://dof.ca.gov/forecasting/demographics/estimates-e1/",
      "California Department of Finance. \u201CE-1H Housing Estimates for Cities, Counties, and the State with Annual Percent Change \u2014 January 1, 2024 and 2025.\u201D Sacramento, California, May 2025. https://dof.ca.gov/forecasting/demographics/estimates-e1/",
      "California Department of Finance. \u201CE-4 Population Estimates for Cities, Counties, and the State, 2011\u20132020, with 2010 and 2020 Census Benchmarks.\u201D Sacramento, California, May 2025. https://dof.ca.gov/forecasting/demographics/estimates/e-4-population-estimates-for-cities-counties-and-the-state-2011-2020-with-2010-and-2020-census-benchmark/",
      "California Department of Finance. \u201CP-2A County Population Projections, 2020\u20132070 (Baseline 2024).\u201D https://dof.ca.gov/forecasting/demographics/projections/",
      "U.S. Census Bureau. Decennial Census Napa County QuickFacts, 2000, 2010, 2020. https://www.census.gov/quickfacts/napacountycalifornia",
      "Napa Valley Transportation Authority. \u201CNapa Valley Travel Behavior Study (2018).\u201D https://www.nvta.ca.gov/studies-plans",
      "U.S. Census Bureau. LEHD Origin-Destination Employment Statistics (LODES / On The Map). https://lehd.ces.census.gov/data/",
      "Bureau of Labor Statistics. \u201CNapa County Total Leisure and Hospitality (NAPA906LEIHN).\u201D https://fred.stlouisfed.org/series/NAPA906LEIHN",
      "Bureau of Labor Statistics. \u201CNapa Food Services and Drinking Places (SMU06349007072200001SA).\u201D https://fred.stlouisfed.org/series/SMU06349007072200001SA",
      "STR (CoStar). Monthly Industry Report. https://str.com/",
      "Napa County 2024 Housing Needs Assessment. https://www.countyofnapa.org/1984/Housing-Element-Update",
      "Napa Valley Features \u2014 Tim Carl. \u201CUnder the Hood: American Canyon Grows While the Upvalley Shrinks.\u201D May 10, 2025. https://napavalleyfocus.substack.com/p/under-the-hood-american-canyon-grows",
      "Napa Valley Features \u2014 Tim Carl. \u201CUnder the Hood: Rethinking the Housing Narrative in Napa County.\u201D June 7, 2025. https://napavalleyfocus.substack.com/p/under-the-hood-rethinking-the-housing",
      "Napa Valley Features \u2014 Tim Carl. \u201CUnder the Hood: Is Napa Valley Building for a Future That Doesn\u2019t Exist?\u201D August 31, 2024. https://napavalleyfocus.substack.com/p/under-the-hood-is-napa-valley-building",
      "Napa Valley Register. \u201CNapa County sees second year of population growth.\u201D May 8, 2025. https://napavalleyregister.com/news/napa-population-growth-california/article_02b77c02-5eae-4a61-9506-c1d9979b4527.html",
    ],
  },
  "napa-price-discovery-2026": {
    headline: "When the Price Gives Way",
    publication: "Napa Valley Features",
    slug: "napa-price-discovery-2026",
    dateline: "NAPA VALLEY, Calif.",
    body: [
      t("NAPA VALLEY, Calif. \u2014 The price signals are no longer hypothetical. In the span of a few months, three Napa wine-industry assets have moved through the market in ways that expose a widening gap between what sellers expected and what buyers were willing to pay \u2014 or, in some cases, not yet willing to pay at all."),
      t("Taken individually, each transaction has an explanation. A luxury resort\u2019s capital structure was overleveraged. A fire-damaged winery\u2019s family was fatigued and ready to exit. A multigenerational estate found no conventional buyers after 17 months and is trying the auction route. Individually, these are stories about specific circumstances. Collectively, they are something else: the first legible pattern of asset-level repricing across Napa\u2019s wine and hospitality economy."),
      h("What the Transactions Show"),
      t("The clearest data point so far is Stanly Ranch. On March 27, 2026, Blackstone Real Estate acquired the hotel portion of the Auberge-managed resort at a Napa County courthouse foreclosure auction for $195 million, per the recorded deed. The prior owners had defaulted on debt that had grown to $243.6 million. The original loan was approximately $220 million. Depending on which figure is used as the baseline, the transaction implies an 11% discount against the original loan or a 20% discount against the total debt stack. Operations continue under the Auberge flag. The property earned a Michelin key. Starting nightly rates run approximately $700. This was not a distressed asset by brand or experience \u2014 it was a distressed asset by capital structure. That distinction matters because it means the repricing reflects financing conditions, not product failure."),
      t("The Stanly Ranch transaction is also a split-asset deal. The vineyard homes and villas did not trade with the hotel. A $100 million lawsuit filed March 6, 2026, in New York State Supreme Court by the Nichols Partnership and Stanly Ranch Resort Napa LLC against GA Development Napa Valley LP and Mandrake Capital Partners adds further complexity to the full accounting. The hotel cleared. Everything else remains legally entangled."),
      t("The second transaction is Cain Vineyards & Winery. In December 2025, Third Leaf Partners, a San Francisco investment firm, quietly acquired the brand and inventory. The purchase price was not disclosed. The 500-acre Spring Mountain estate \u2014 where the 2020 Glass Fire destroyed the winery, tasting room and a significant portion of the vineyard \u2014 is being sold separately to an undisclosed buyer. A long-term grape supply agreement is being negotiated to keep the brand connected to its source vineyard. Two-thirds of the vineyard has been replanted; full restoration is expected by 2030."),
      t("The structure of the Cain deal is the signal. In an expansion era, an estate like Cain would move whole \u2014 land, brand, winery, grapes and legacy bundled together. This transaction separates them. One party owns the brand. Another will own the land. A contract will connect the grapes. Third Leaf managing partner Alex Pagon described the current environment directly: \u201CThere\u2019s a lot of financial stress in the valley. There\u2019s a lot of pressure, banks are kind of backing away, and a lot of sources of funding are drying up.\u201D The nearby Spring Mountain Vineyard followed a similar path: MGG Investment Group acquired the property through bankruptcy auction after the estate defaulted on a $185 million loan from the firm."),
      c(1),
      h("Benessere: A Live Market Test"),
      t("The third transaction is not yet complete \u2014 which makes it the most instructive to watch."),
      t("Benessere Vineyards, a 43-acre St. Helena estate at 1010 Big Tree Road, went to market in November 2024 at $35 million. When that produced no serious offers, the price dropped to $28 million. That price also produced no serious offers. The family \u2014 John Benish, his 90-year-old mother and four siblings, none of whom live in California \u2014 has now listed the property with Concierge Auctions\u2019 new Global Wine & Vineyard Division, in cooperation with Sotheby\u2019s International Realty. Bidding opens May 13, 2026, and closes May 28 as part of Sotheby\u2019s Exceptional Global Properties sale in London. There is no mandatory starting bid. Concierge chief revenue officer Nick Leonard said the firm expects bidding to open between $8 million and $12 million."),
      t("Work through the implied discount range. Against the original $35 million asking price, the expected opening bid range represents a 66% to 77% discount. Against the most recent $28 million asking price, it represents a 57% to 71% discount. Even if competitive bidding pushes the final sale price well above the opening range, the gap from original asking price to auction expectation is wide enough to constitute its own market signal."),
      t("The Benessere estate includes roughly 29 acres of planted vines \u2014 Sangiovese as the flagship, alongside Sagrantino, Pinot Grigio, Aglianico and Falanghina, varietals rarely found elsewhere in Napa Valley \u2014 a working winery, a tasting room and two residences totaling more than 6,300 square feet of living space. The Benish family acquired the property in 1994 for $1.5 million after Charles Shaw, the brand behind Trader Joe\u2019s Two Buck Chuck, filed for bankruptcy. The family made the estate\u2019s focus on Italian varieties its identity. \u201CIf my dad were still around, I\u2019m sure we\u2019d still be going strong,\u201D John Benish told the San Francisco Chronicle. \u201CWe love the place, but I think in any big family, it\u2019s hard to get a consensus about what you want to do for the future.\u201D"),
      t("The Benessere auction is not an isolated case. In 2025, Villa San Juliette, a 160-acre estate in Paso Robles, followed a nearly identical path: originally listed at $22 million in 2022, reduced to roughly $14.75 million, then sent to auction with no minimum bid. It sold in August 2025 for $8.8 million \u2014 a 60% discount from its original asking price. Concierge\u2019s Leonard acknowledged the pattern directly, saying he expects more wineries will pursue the auction route as the conventional real estate market for wine estates remains slow. According to food and beverage consultant Pat Delong of Azur Associates, the market for wine and vineyard sales in 2026 is on pace to be less than half the size it was in 2021, when roughly $3.5 billion in assets changed hands."),
      h("The Broader Pattern"),
      t("These transactions do not exist in isolation. As documented in \u201CUnder the Hood: The Reset Spreads\u201D (April 9, 2026), Napa\u2019s structural adjustment has moved beyond wine production into the broader visitor economy. The same issue\u2019s contraction timeline showed three named hospitality closures \u2014 Charlie Palmer Steak, Chateau Buena Vista and the JCB Tasting Salon in Yountville \u2014 in a four-month window, each handled as a repositioning, none described as a crisis. E. & J. Gallo announced the permanent closure of The Ranch Winery in St. Helena effective April 15, eliminating 93 positions across five North Coast sites. Trinchero Family Wine & Spirits listed two premium mountain vineyards \u2014 Haystack on Atlas Peak at $5.5 million and Clouds Nest on Mount Veeder at $4.5 million \u2014 two months after acquiring Mumm Napa from Pernod Ricard, a simultaneous pruning and deployment that reflects the portfolio logic of a structural reset."),
      t("The pattern across Cain, Stanly Ranch and Benessere represents three different expressions of the same underlying condition: assets that were priced for an era of expanding demand, low-cost capital and rising brand multiples are now being repriced for a market where demand has plateaued, capital is more expensive and the exit options are narrower than sellers anticipated. The hospitality asset repriced through foreclosure. The winery brand repriced through separation from its land. The vineyard estate is repricing through the auction mechanism. Different paths, the same direction."),
      t("The Benessere result, when it comes on May 28, will provide one of the clearest data points of the year for this question: Where does the market clear for a mid-sized, independent, operating Napa winery estate when conventional buyers do not appear? Whether the answer is $12 million or $20 million or something in between, it will be a documented, transparent, competitive price \u2014 the kind of price discovery the Napa wine real estate market has been short on."),
      c(2),
      h("What Quiet Repricing Looks Like"),
      t("Wholesale prices at the top end of the Napa market have already moved. Trade-level data shows the average wholesale bottle price at the premier trade auction has fallen roughly 39% \u2014 from approximately $286 three years prior to $174 in 2026 \u2014 a durable downward shift in what the trade is willing to pay. At the same time, Napa County\u2019s direct-to-consumer shipment value held at roughly $1.84 billion in 2025 \u2014 up 1% \u2014 while volume fell 8%, because average prices per bottle rose 9%. The dollars held. The buyers did not grow. That is the arithmetic of a narrowing market: price carries the value line while the buyer pool contracts."),
      t("The same dynamic appears to be playing out in real estate. Asking prices stayed elevated long after transaction volume slowed \u2014 a common feature of illiquid markets with emotional sellers. What changes that dynamic is price discovery: a transaction that clears publicly, transparently and at a price that other sellers and buyers can reference. Stanly Ranch provided that for luxury hospitality. The Benessere auction could provide it for operating winery estates."),
      h("What to Watch"),
      t("The useful question is not whether Napa\u2019s wine real estate market is in trouble. It is whether the current asking-price anchors across the broader winery and vineyard market reflect the world as it was or the world as it is. When the gap between those two is wide, a market does not correct evenly or quickly. It corrects deal by deal, auction by auction \u2014 slowly and unevenly \u2014 until enough transactions have cleared at new prices that the old anchors become untenable."),
      t("Several signals are worth tracking in the months ahead. The Benessere result on May 28 will be the most direct: a public, competitive, documented clearing price for an operating Napa winery estate. Watch whether that result prompts comparable properties currently listed at conventional asking prices to adjust or re-list through auction. Watch the pace at which Trinchero\u2019s Haystack and Clouds Nest vineyard listings move \u2014 or don\u2019t. Watch for additional split-asset structures in which land, brand and operations trade separately rather than together. And watch Napa County\u2019s food service and hospitality employment data from the California Employment Development Department for signs that what is visible in individual closure announcements is accumulating into a broader labor-market shift."),
      t("Napa is in the early innings of this process. The documentation is becoming clearer."),
    ],
    sources: [
      "Napa County deed records \u2014 Stanly Ranch foreclosure, Mar 27, 2026.",
      "SF Chronicle \u2014 \u2018Napa luxury resort snapped up by New York firm in foreclosure sale.\u2019",
      "SF Chronicle \u2014 \u2018Fire-ravaged Napa Valley winery snapped up by S.F. investment firm.\u2019",
      "SF Chronicle \u2014 \u2018This maverick Napa Valley winery couldn\u2019t sell. Now, it\u2019s headed for auction.\u2019",
      "Bloomberg \u2014 Stanly Ranch debt stack, Mar 30, 2026.",
      "New York State Supreme Court \u2014 Nichols Partnership v. GA Development, Mar 6, 2026.",
      "BEA FRED \u2014 Napa County 2024 real GDP (REALGDPALL06055).",
      "Concierge Auctions \u2014 Benessere Vineyards listing.",
      "Sotheby\u2019s International Realty \u2014 Exceptional Global Properties, London, May 2026.",
      "Wine-Searcher \u2014 Premiere Napa Valley wholesale price trend, W. Blake Gray.",
      "Silicon Valley Bank Wine Report 2026 \u2014 DtC shipment value.",
      "Pat Delong, Azur Associates \u2014 wine/vineyard market size.",
      "Concierge Auctions \u2014 Villa San Juliette, Paso Robles auction result, Aug 2025.",
      "MGG Investment Group \u2014 Spring Mountain Vineyard bankruptcy acquisition.",
      { label: "Interactive article", url: "https://napaserve.org/under-the-hood/napa-price-discovery-2026" },
    ],
  },
};

function formatPostText(publication, headline, deck, slug) {
  const url = `napaserve.org/under-the-hood/${slug}`;
  const header = `${publication} \u00B7 UNDER THE HOOD`;
  const maxDeckLen = 300 - header.length - headline.length - url.length - 8;
  const truncatedDeck = deck && deck.length > maxDeckLen
    ? deck.slice(0, maxDeckLen - 1).trimEnd() + "\u2026"
    : (deck || "");
  return `${header}\n\n${headline}\n\n${truncatedDeck}\n\n${url}`;
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function bskyWebUrl(uri) {
  if (!uri) return "#";
  const m = uri.match(/^at:\/\/(did:[^/]+)\/app\.bsky\.feed\.post\/(.+)$/);
  if (m) return `https://bsky.app/profile/${m[1]}/post/${m[2]}`;
  return "#";
}

// ─── BlueSky Card ─────────────────────────────────────────────────────────────

function isRecent(publishedAt) {
  if (!publishedAt) return true; // drafts always show full card
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  return new Date(publishedAt) >= twoWeeksAgo;
}

function ArchivedArticleRow({ article }) {
  const pubDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#EDE8DE', borderRadius: 6, marginBottom: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: '#8B7355' }}>{article.publication?.toUpperCase()}</span>
        <a href={`https://napaserve.org/under-the-hood/${article.slug}`} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 14, fontWeight: 600, color: '#2C1810', textDecoration: 'none' }}>
          {article.headline}
        </a>
      </div>
      <span style={{ fontSize: 12, color: '#8B7355', whiteSpace: 'nowrap', marginLeft: 16 }}>{pubDate}</span>
    </div>
  );
}

function ArticleCard({ article, token, published = true, onPublished }) {
  const [state, setState] = useState("idle"); // idle | preview | posting | success | error
  const [postUri, setPostUri] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const postText = formatPostText(article.publication, article.headline, article.deck, article.slug);

  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleConfirm() {
    setState("posting");
    try {
      const body = {
        headline: article.headline,
        deck: article.deck,
        slug: article.slug,
        publication: article.publication,
      };
      if (imageFile) {
        const dataUrl = await readFileAsBase64(imageFile);
        body.imageData = dataUrl.split(",")[1];
        body.imageMimeType = imageFile.type;
      }
      const res = await fetch(`${WORKER}/api/bluesky-publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": token,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setPostUri(data.uri);
        setState("success");
      } else {
        setErrorMsg(data.error || "Unknown error");
        setState("error");
      }
    } catch (e) {
      setErrorMsg(e.message);
      setState("error");
    }
  }

  const btnBase = {
    fontFamily: font,
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    padding: "8px 16px",
  };

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: 20 }}>
      <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: T.muted, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        {article.publication}
        {!published && (
          <span style={{ background: "#C4A050", color: "#fff", fontSize: 10, fontFamily: mono, fontWeight: 700, textTransform: "uppercase", padding: "2px 4px", borderRadius: 3, lineHeight: 1 }}>DRAFT</span>
        )}
        {published && (
          <span style={{ color: "#4a6741", fontSize: 10, fontFamily: mono, fontWeight: 700, textTransform: "uppercase", lineHeight: 1 }}>LIVE</span>
        )}
      </div>
      <h3 style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: T.ink, margin: "0 0 8px", lineHeight: 1.3 }}>
        {article.headline}
      </h3>
      <p style={{
        fontFamily: font, fontSize: 14, fontWeight: 300, color: T.body, lineHeight: 1.5, margin: "0 0 16px",
        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {article.deck}
      </p>

      {article.publishedAt ? (
        <div style={{ fontSize: 12, color: '#8B7355', marginBottom: 8 }}>
          Published {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#C4A050', fontWeight: 600, marginBottom: 8 }}>
          DRAFT — not yet published
        </div>
      )}

      <a href={`/under-the-hood/${article.slug}`}
        style={{ fontFamily: mono, fontSize: 11, color: T.muted, textDecoration: "none", display: "block", marginBottom: 16 }}>
        View article {"\u2192"}
      </a>

      {!published && (
        <div style={{ display: 'block', marginBottom: 10 }}>
          <button
            disabled={publishing}
            onClick={async () => {
              setPublishing(true);
              try {
                const res = await fetch(`${WORKER}/api/publish-article`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "X-Admin-Token": token },
                  body: JSON.stringify({ slug: article.slug }),
                });
                const data = await res.json();
                if (res.ok && data.published) {
                  if (onPublished) onPublished();
                } else {
                  alert(data.error || "Publish failed");
                }
              } catch (e) {
                alert("Publish failed: " + e.message);
              }
              setPublishing(false);
            }}
            title="Publish this article to napaserve.org"
            style={{ ...btnBase, background: '#5C8A3C', color: "#fff", opacity: publishing ? 0.7 : 1 }}
          >
            {publishing ? "Publishing\u2026" : "Publish Article"}
          </button>
        </div>
      )}

      {state === "idle" && (
        <div style={{ display: 'block', marginBottom: 8 }}>
          <button onClick={() => setState("preview")} style={{ ...btnBase, background: T.accent, color: "#fff" }}>
            Post to BlueSky
          </button>
        </div>
      )}

      {state === "success" && (
        <div style={{ fontFamily: font, fontSize: 14, color: T.ink }}>
          Posted to @valleyworkscollab.bsky.social {"\u2713"}{" "}
          <a href={bskyWebUrl(postUri)} target="_blank" rel="noopener noreferrer" style={{ color: T.accent, textDecoration: "underline" }}>
            View post
          </a>
        </div>
      )}

      {state === "error" && (
        <div>
          <div style={{ fontFamily: font, fontSize: 13, color: "#8b2e2e", marginBottom: 8 }}>{errorMsg}</div>
          <button onClick={() => { setState("idle"); setErrorMsg(null); }} style={{ ...btnBase, background: T.accent, color: "#fff" }}>
            Try again
          </button>
        </div>
      )}

      {EXPORT_DATA[article.slug] && (
        <div style={{ marginTop: 10 }}>
          <WordExporter article={EXPORT_DATA[article.slug]} />
          <a href={`https://napaserve.org/under-the-hood/${article.slug}`} target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: mono, fontSize: 11, color: T.muted, textDecoration: "none", display: "block", marginTop: 8 }}>
            Download chart PNGs from the article page {"\u2192"}
          </a>
        </div>
      )}

      {(state === "preview" || state === "posting") && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.08em", color: T.muted, marginBottom: 6 }}>POST PREVIEW</div>
          <pre style={{
            fontFamily: font, fontSize: 13, lineHeight: 1.5, color: T.ink,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
            background: T.bg, padding: 12, borderRadius: 4, margin: "0 0 6px",
          }}>
            {postText}
          </pre>
          <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>
            {postText.length} / 300 characters
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.08em", color: T.muted, display: "block", marginBottom: 6 }}>
              ATTACH CHART IMAGE (OPTIONAL)
            </label>
            <input type="file" accept="image/png,image/jpeg" onChange={handleImageSelect}
              style={{ fontSize: 13, fontFamily: font, color: T.ink }} />
            {imagePreview && (
              <img src={imagePreview} alt="Chart preview" style={{ marginTop: 8, maxWidth: "100%", borderRadius: 4, border: `1px solid ${T.border}` }} />
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleConfirm} disabled={state === "posting"}
              style={{ ...btnBase, background: state === "posting" ? "#A89880" : T.accent, color: "#fff", opacity: state === "posting" ? 0.7 : 1 }}>
              {state === "posting" ? "Posting\u2026" : "Confirm & Post"}
            </button>
            <button onClick={() => setState("idle")} disabled={state === "posting"}
              style={{ ...btnBase, background: "transparent", color: T.accent, border: `1px solid ${T.accent}` }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Event Moderation ────────────────────────────────────────────────────────

function EventModeration({ token }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => { loadEvents(); }, []);

  async function loadEvents() {
    setLoading(true);
    try {
      const sbRes = await fetch(
        'https://csenpchwxxepdvjebsrt.supabase.co/rest/v1/community_events?status=eq.pending&order=submitted_at.desc&select=id,title,description,event_date,town,category,venue_name,address,website_url,submitter_name,submitter_email,submitted_at,price_info&limit=50',
        { headers: { 'apikey': 'sb_publishable_r-Ntp7zKRrH3JIVAjTKYmA_0szFdYGJ', 'Authorization': 'Bearer sb_publishable_r-Ntp7zKRrH3JIVAjTKYmA_0szFdYGJ' } }
      );
      const data = await sbRes.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch(e) { setEvents([]); }
    setLoading(false);
  }

  function completeness(ev) {
    const missing = [];
    if (!ev.description || ev.description.length < 20) missing.push('description');
    if (!ev.event_date) missing.push('date');
    if (!ev.venue_name) missing.push('venue');
    if (!ev.town) missing.push('town');
    return missing;
  }

  async function approve(id) {
    const res = await fetch(`${WORKER}/api/admin-approve-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setEvents(prev => prev.filter(e => e.id !== id));
      setActionMsg('\u2713 Event approved');
      setTimeout(() => setActionMsg(''), 3000);
    }
  }

  async function reject(id) {
    if (!window.confirm('Reject and delete this event?')) return;
    const res = await fetch(`${WORKER}/api/admin-reject-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setEvents(prev => prev.filter(e => e.id !== id));
      setActionMsg('\u2717 Event rejected');
      setTimeout(() => setActionMsg(''), 3000);
    }
  }

  const S = {
    card: { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: '16px 20px', marginBottom: 12 },
    title: { fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 4 },
    meta: { fontFamily: font, fontSize: 12, color: T.muted, marginBottom: 6 },
    desc: { fontFamily: font, fontSize: 13, color: T.body, lineHeight: 1.5, marginBottom: 8 },
    warning: { fontSize: 11, fontWeight: 700, color: '#8A3A2A', background: 'rgba(138,58,42,0.08)', padding: '3px 8px', borderRadius: 4, display: 'inline-block', marginBottom: 8 },
    link: { fontSize: 12, color: '#3A88A0', textDecoration: 'none' },
    btnRow: { display: 'flex', gap: 8, marginTop: 10 },
    approve: { background: '#5A7A50', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: font },
    reject: { background: 'rgba(138,58,42,0.1)', color: '#8A3A2A', border: '1px solid rgba(138,58,42,0.3)', borderRadius: 6, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: font },
  };

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontFamily: serif, fontSize: 18, color: T.ink, margin: 0 }}>Event Moderation</h2>
        {!loading && <span style={{ fontFamily: font, fontSize: 13, color: T.muted }}>{events.length} pending</span>}
        {actionMsg && <span style={{ fontSize: 13, fontWeight: 600, color: actionMsg.startsWith('\u2713') ? '#5A7A50' : '#8A3A2A' }}>{actionMsg}</span>}
      </div>

      {loading && <p style={{ color: T.muted, fontFamily: font, fontSize: 14 }}>Loading pending events\u2026</p>}

      {!loading && events.length === 0 && (
        <div style={{ background: T.surface, borderRadius: 8, padding: '24px', textAlign: 'center', color: T.muted, fontFamily: font, fontSize: 14 }}>
          ✓ All caught up — no pending events
        </div>
      )}

      {events.map(ev => {
        const missing = completeness(ev);
        const date = ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date';
        const submitted = ev.submitted_at ? ev.submitted_at.slice(0, 10) : '';
        return (
          <div key={ev.id} style={S.card}>
            <div style={S.title}>{ev.title}</div>
            <div style={S.meta}>
              {date} {"\u00B7"} {ev.town || 'No town'} {"\u00B7"} {ev.category || 'No category'}
              {ev.venue_name ? ` \u00B7 ${ev.venue_name}` : ''}
            </div>
            <div style={S.meta}>
              Submitted {submitted} by {ev.submitter_name || 'Unknown'} \u2014 {ev.submitter_email || 'No email'}
            </div>
            {missing.length > 0 && (
              <div style={S.warning}>\u26A0 Missing: {missing.join(', ')}</div>
            )}
            {ev.description && (
              <div style={S.desc}>{ev.description.slice(0, 200)}{ev.description.length > 200 ? '\u2026' : ''}</div>
            )}
            {ev.website_url && (
              <div style={{ marginBottom: 8 }}>
                <a href={ev.website_url} target="_blank" rel="noopener noreferrer" style={S.link}>\u2197 {ev.website_url}</a>
              </div>
            )}
            {ev.price_info && <div style={S.meta}>Price: {ev.price_info}</div>}
            <div style={S.btnRow}>
              <button style={S.approve} onClick={() => approve(ev.id)}>Approve</button>
              <button style={S.reject} onClick={() => reject(ev.id)}>Reject</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function NapaServeAdmin() {
  const navigate = useNavigate();
  const [locked, setLocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(null);
  const [token, setToken] = useState(null);
  const [dbArticles, setDbArticles] = useState(null);

  function fetchArticles() {
    fetch(`${WORKER}/api/articles`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setDbArticles(Array.isArray(data) ? data : []))
      .catch(() => setDbArticles(null));
  }

  useEffect(() => { fetchArticles(); }, []);

  // Check for existing session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("admin_token");
    if (!stored) { setLoading(false); return; }
    fetch(`${WORKER}/api/admin-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": stored },
    })
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setToken(stored);
          setLocked(false);
          sessionStorage.setItem("nvf_admin", "true");
        } else {
          sessionStorage.removeItem("admin_token");
        }
      })
      .catch(() => sessionStorage.removeItem("admin_token"))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch(`${WORKER}/api/admin-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("admin_token", data.token);
        sessionStorage.setItem("nvf_admin", "true");
        setToken(data.token);
        setLocked(false);
      } else {
        setAuthError("Incorrect password");
      }
    } catch {
      setAuthError("Connection failed");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("nvf_admin");
    setToken(null);
    setLocked(true);
    setPassword("");
  }

  if (loading) {
    return <div style={{ background: T.bg, minHeight: "100vh" }} />;
  }

  // ─── LOCKED ───────────────────────────────────────────────────────────────
  if (locked) {
    return (
      <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <form onSubmit={handleLogin} style={{ textAlign: "center", maxWidth: 320, width: "100%", padding: 24 }}>
          <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 700, color: T.ink, marginBottom: 4 }}>
            NapaServe
          </div>
          <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, marginBottom: 32 }}>
            Admin
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              width: "100%", padding: "10px 14px", fontSize: 15, fontFamily: font,
              border: `1px solid ${T.border}`, borderRadius: 4, background: "#fff",
              color: T.ink, outline: "none", boxSizing: "border-box", marginBottom: 12,
            }}
          />
          <button type="submit" style={{
            width: "100%", padding: "10px 0", fontSize: 14, fontWeight: 600, fontFamily: font,
            background: T.accent, color: "#fff", border: "none", borderRadius: 4, cursor: "pointer",
          }}>
            Enter
          </button>
          {authError && (
            <div style={{ fontFamily: font, fontSize: 13, color: "#8b2e2e", marginTop: 12 }}>
              {authError}
            </div>
          )}
        </form>
      </div>
    );
  }

  // ─── UNLOCKED ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <NavBar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: T.gold, marginBottom: 8 }}>VALLEY WORKS COLLABORATIVE · NAPASERVE</p>
          <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, color: T.ink, margin: '0 0 6px' }}>Admin</h1>
          <p style={{ fontSize: 15, color: T.muted, margin: 0 }}>Publisher and operations tools for NapaServe.</p>
          <button onClick={() => { sessionStorage.removeItem('admin_token'); window.location.reload(); }}
            style={{ position: 'absolute', top: 80, right: 24, background: 'none', border: 'none', fontSize: 13, color: T.muted, cursor: 'pointer', fontFamily: font }}>
            Sign out
          </button>
        </div>

        <div style={{ borderTop: `1px solid ${T.rule}`, marginBottom: 32 }} />

        {/* ── ADMIN TOOLS ── */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 4 }}>ADMIN TOOLS</p>
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>Internal tools for managing NapaServe operations.</p>

        {/* Weekly Digest card */}
        <div style={{ background: T.surface, border: `1px solid ${T.rule}`, borderRadius: 8, padding: '20px 24px', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: T.gold, marginBottom: 6 }}>WEEKLY DIGEST</p>
          <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink, margin: '0 0 8px' }}>The Napa Valley Weekender</h2>
          <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, marginBottom: 4 }}>Sends to NapaServe subscribers. Steps: (1) Open the Digest Tool. (2) Click Generate Draft to pull upcoming approved events. (3) Toggle events in or out, edit the intro. (4) Send a preview to info@napaserve.com first. (5) When satisfied, send to all subscribers.</p>
          <button onClick={() => navigate('/events/digest')}
            style={{ marginTop: 12, background: T.accent, color: '#fff', border: 'none', borderRadius: 6, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
            Open Digest Tool
          </button>
        </div>

        <div style={{ borderTop: `1px solid ${T.rule}`, margin: '28px 0' }} />

        {/* ── EVENT MODERATION ── */}
        <EventModeration token={token} />

        <div style={{ borderTop: `1px solid ${T.rule}`, margin: '28px 0' }} />

        {/* ── EVENT INTAKE ── */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 4 }}>EVENT INTAKE</p>
        <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, marginBottom: 16 }}>Paste any public event URL and Claude will extract the event details and add it directly to the community events database. Use this to seed events from Eventbrite, winery websites, or other local sources.</p>
        <EventIntake />

        <div style={{ borderTop: `1px solid ${T.rule}`, margin: '28px 0' }} />

        {/* ── BLUESKY PUBLISHER ── */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.muted, marginBottom: 4 }}>BLUESKY PUBLISHER</p>
        <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, marginBottom: 20 }}>Publish Under the Hood articles to @valleyworkscollab.bsky.social. Select an article, optionally upload a chart image, then post directly to BlueSky. Each article can only be posted once.</p>

        {/* Recent articles — full cards */}
        {ARTICLES
          .filter(a => isRecent(a.publishedAt))
          .sort((a, b) => {
            // Drafts (null publishedAt) always first
            if (!a.publishedAt && b.publishedAt) return -1;
            if (a.publishedAt && !b.publishedAt) return 1;
            // Then most recent first
            return new Date(b.publishedAt) - new Date(a.publishedAt);
          })
          .map(article => {
            const dbRow = dbArticles && dbArticles.find(a => a.slug === article.slug);
            return (
              <ArticleCard
                key={article.slug}
                article={article}
                token={token}
                published={dbRow ? dbRow.published : true}
                onPublished={fetchArticles}
              />
            );
          })}

        {/* Archived articles — compact link rows */}
        {ARTICLES.filter(a => !isRecent(a.publishedAt)).length > 0 && (
          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: T.muted, marginBottom: 10 }}>ARCHIVED — OLDER THAN 2 WEEKS</p>
            {ARTICLES.filter(a => !isRecent(a.publishedAt)).map(a => (
              <ArchivedArticleRow key={a.slug} article={a} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
