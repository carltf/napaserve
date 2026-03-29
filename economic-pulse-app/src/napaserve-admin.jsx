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
};

const serif = "'Libre Baskerville', serif";
const font = "'Source Sans 3', sans-serif";
const mono = "monospace";

const ARTICLES = [
  {
    publication: "Napa Valley Features",
    headline: "Under the Hood: The Pattern Holds \u2014 and the Numbers Get More Telling",
    deck: "Napa County added 709 residents in 2024 \u2014 but 90% came from one city. Strip out American Canyon and the rest of the county gained 70 people. Twenty-five years of data point to the same structural condition.",
    slug: "napa-population-2025",
  },
  {
    publication: "Napa Valley Features",
    headline: "How a Global Supply Shock Reaches Napa Valley",
    deck: "War around Iran has cut Hormuz tanker traffic 94%. This traces the supply chain from the strait to the Napa farm gate \u2014 and shows why the local economy has less cushion than the numbers suggest.",
    slug: "napa-supply-chain-2026",
  },
  {
    publication: "Napa Valley Features",
    headline: "Napa Cabernet Prices Break the Growth Curve",
    deck: "The weighted average price of Napa County cabernet sauvignon has declined for two consecutive years \u2014 the first such decline in the modern data series.",
    slug: "napa-cab-2025",
  },
  {
    publication: "Sonoma County Features",
    headline: "Sonoma Grape Prices Fall for a Second Year",
    deck: "Sonoma County\u2019s weighted average grape price declined for the second consecutive year in 2025, with cabernet sauvignon leading the drop.",
    slug: "sonoma-cab-2025",
  },
  {
    publication: "Lake County Features",
    headline: "Lake County Grape Prices Have Fallen 38% in Two Years",
    deck: "Lake County\u2019s weighted average grape price has dropped 38% since 2023, with chardonnay prices collapsing 70% in two years.",
    slug: "lake-county-cab-2025",
  },
  {
    publication: "Napa Valley Features",
    headline: "Napa\u2019s Economy Looks Bigger Than It Is",
    deck: "Nominal GDP rose 35.8% since 2016. Real GDP grew 4.6%. Of the apparent $3.84 billion in growth, 87% was inflation \u2014 and the jobs engine has stalled.",
    slug: "napa-gdp-2024",
  },
];

// ─── Full article data for Word export ─────────────────────────────────────
// Body arrays use typed objects: { type: 'paragraph'|'header'|'chart', text?, number? }

const t = (text) => ({ type: "paragraph", text });
const h = (text) => ({ type: "header", text });
const c = (number) => ({ type: "chart", number });

const EXPORT_DATA = {
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
      t("Natural gas feeds industrial production across multiple sectors at a level most readers do not track. When Qatar\u2019s Ras Laffan went offline, the ripple moved immediately into materials that have nothing obvious to do with energy. Aluminum is one example \u2014 Hydro reported its Qatalum joint venture began a controlled shutdown after gas supply was suspended, maintaining production at about 60% of capacity. That is a clean illustration of how a gas shock becomes a materials shock."),
      t("Helium is another example \u2014 a case study in how deep the chain runs. Helium is used in semiconductor manufacturing because it provides a stable inert atmosphere and improves heat transfer. When helium supply tightens, the constraint does not announce itself at the pump. It shows up quarters later in lead times, component costs and equipment availability."),
      t("Fertilizers and agricultural chemicals complete the picture. The Middle East Gulf accounts for 16% to 18% of global seaborne fertilizer exports, according to Kpler. Nearly half the world\u2019s traded sulfur supply \u2014 a base input for phosphate fertilizers \u2014 is currently stranded on the Persian Gulf side of the strait, according to CRU Group."),
      t("Manufacturing trade friction adds a parallel layer. On March 11, the Office of the U.S. Trade Representative opened new Section 301 investigations into structural excess capacity in manufacturing sectors \u2014 a signal that trade friction tied to China is rising again at precisely the moment energy and shipping systems are under strain. For Napa, that means more uncertainty around pumps, fittings, refrigeration components, warehouse materials, fabricated parts and the small industrial goods that make a premium agricultural region run on time."),
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
    headline: "Under the Hood: The Pattern Holds \u2014 and the Numbers Get More Telling",
    publication: "Napa Valley Features",
    slug: "napa-population-2025",
    dateline: "NAPA VALLEY, Calif.",
    body: [
      h("Still Below Peak \u2014 by Nearly a Decade"),
      t("NAPA VALLEY, Calif. \u2014 Napa County has lost 4,995 residents since its modern peak of 141,119 in 2016 and remains down 3.5%. In 2010, the county had 136,484 residents \u2014 nearly identical to today\u2019s 136,124. The past 15 years have produced a net population change of essentially zero at the county level."),
      c(1),
      h("One City \u2014 and One End of the Valley"),
      t("American Canyon alone added 639 of the county\u2019s 709 net new residents \u2014 90% of total growth \u2014 from a city holding 16% of the county\u2019s population. Its 2.9% year-over-year gain stands in a different category from every other jurisdiction. Napa, the county seat, added 216 residents, or 0.3%. Calistoga fell from 5,181 to 5,160. St. Helena fell from 5,356 to 5,349. Yountville fell from 2,655 to 2,638. The unincorporated county fell from 22,946 to 22,845. The upvalley cities and balance of county, taken together, lost 146 residents."),
      t("Strip out American Canyon entirely and the remaining 113,728 residents \u2014 83% of the county \u2014 gained 70 people in a year. That is a growth rate of 0.06%, which rounds to zero."),
      t("The housing construction data amplify the picture. In 2024\u201325, American Canyon and the city of Napa together accounted for 91% of all new housing units built countywide \u2014 602 of 658. The three upvalley cities combined added 21 units, or 3% of the total."),
      c(2),
      h("This Is Not a New Pattern \u2014 It\u2019s 25 Years"),
      t("In 2000, American Canyon had 9,774 residents \u2014 7.9% of Napa County\u2019s 124,279. By 2010 it had nearly doubled to 19,454. By 2025 it stands at 22,396 \u2014 16.5% of the county. Since 2000, American Canyon has added 12,622 residents. The rest of Napa County has added approximately 750. Stripped of American Canyon, the county outside that one city has seen a net population loss since 2000."),
      t("St. Helena is down roughly 10% from its 2000 census population. Yountville is down nearly 10%. As this column documented in prior coverage, the same jurisdictional structure appeared in the prior year\u2019s E-1 data. A pattern that appears once is a data point. A pattern that persists across 25 years of census and DOF records is a structural condition."),
      c(3),
      h("Why the Southern Cluster Looks the Way It Does"),
      t("Geography explains a significant part of it. Napa Valley is approximately 30 miles long and narrow. A worker employed in Calistoga or St. Helena faces roughly a 25- to 35-mile commute from American Canyon \u2014 not meaningfully different from commuting from Cloverdale in Sonoma County or Lakeport in Lake County, at substantially lower housing costs. A worker who cannot afford to live in upvalley Napa does not necessarily default to American Canyon. They may default to leaving Napa County entirely."),
      t("American Canyon\u2019s housing boom \u2014 5% unit growth in 2024\u201325, first in California for multifamily growth \u2014 is driven by Bay Area affordability dynamics and freeway access to Solano, Contra Costa and Alameda employment corridors. The large-scale developments driving that surge are not being built to serve hospitality workers commuting to Yountville. They are being built for Bay Area households for whom southern Napa represents an affordable alternative to Marin or the East Bay."),
      t("The most direct confirmation comes from Longitudinal Employer-Household Dynamics data: most new American Canyon residents work in Solano County or the East Bay, not Napa Valley."),
      h("The Wage-Flow Problem"),
      t("A Napa Valley Transportation Authority study using 2018 data found that roughly 30,740 workers commute into Napa County while 26,500 commute out \u2014 a net inflow of about 4,240. That figure had already fallen from approximately 7,000 in 2015, a decline of nearly 40% in three years. The NVTA noted that outbound workers likely earn more than inbound ones: outbound jobs skew toward higher-wage categories, inbound jobs toward service and hospitality."),
      t("If the 2015\u20132018 decline rate continued at the same rate, the county would have crossed into net commuter outflow territory around 2024. That is a scenario projection, not a confirmed figure \u2014 an updated NVTA study is required to validate it. But the directional signal is unambiguous."),
      c(4),
      h("More Rooms, Not More Jobs"),
      t("For a decade, more hotel rooms reliably meant more jobs. From 2009 to 2019, Napa County added roughly 700 hotel rooms and gained more than 5,000 jobs in leisure and hospitality \u2014 more than seven jobs per room. Since 2019 the county added 382 more rooms while leisure and hospitality employment fell by 200 and restaurant and bar jobs fell by 470. The ratio flipped from +7.6 jobs per room to \u22120.5."),
      c(5),
      h("Housing Has Grown. The Income Gap Has Widened."),
      t("Between 2010 and 2024, Napa County added roughly 9,000 housing units \u2014 a 19% increase. Total employment grew only marginally. Intra-county vehicle trips declined from approximately 72,100 in 2018 to 58,000 in 2024 \u2014 a drop of nearly 20%. If housing scarcity were driving workers out of the county, inbound commuting and internal traffic would be rising, not falling."),
      c(6),
      t("The affordability ratio confirms the income constraint. In 2010 the median Napa County home cost about 4.5 times median household income. By 2025 that ratio reached 8.6. Qualifying for the median-priced home at $937,500 under current mortgage rates requires roughly $230,000 in gross household income. Tourism jobs average around $35,000. At those wages, the median home is not achievable regardless of how many units are built."),
      t("Between 2019 and 2024, Napa County added hundreds of housing units and hundreds of hotel rooms. Jobs in the sectors those rooms were built to support declined. The data point consistently toward one conclusion: until the wage structure of the local economy changes, building more units addresses the symptom, not the condition."),
      h("What the Data Can Tell Policymakers"),
      t("The accumulation of evidence across this series of columns \u2014 25 years of southern concentration, a shrinking net commuter inflow, higher-wage workers flowing out while lower-wage workers flow in, a rooms-to-jobs ratio that inverted after 2019, decoupled housing and employment growth, and a working-age population projected to fall nearly 20% by 2030 \u2014 points consistently toward one conclusion: until the wage structure of the local economy changes, the pattern documented here will persist."),
      t("What makes that conclusion more than a demographic observation is the current external environment. Consumer discretionary spending is under pressure nationally. Travel demand has softened. Tariffs on imported goods are raising input costs across the hospitality and wine supply chain. Wine consumption in the United States has been declining, accelerated by documented health-awareness shifts and a generational move away from wine as a category. The fine dining and luxury visitor economy that once drove Napa\u2019s job growth has not returned to its pre-pandemic trajectory."),
      t("Each of those forces bears on the same underlying condition the population data reflect: a local economy whose dominant job sectors do not generate wages that support household formation, homeownership or long-term residency in Napa County. Adding housing capacity into that environment has produced more units without closing the income gap, more rooms without producing more jobs, and more residents in the southernmost cities without strengthening the workforce communities the valley depends on."),
      t("A countywide survey of where residents work, what they earn and why they chose Napa County would cost a fraction of what the county spends annually on housing-related infrastructure \u2014 and would answer the question the E-1 series, the RHNA mandates and the 2024 Housing Needs Assessment share an inability to answer: whether the growth being recorded each year is building toward a more economically resilient Napa County, or simply reflecting the valley\u2019s increasing function as a commuter corridor for the broader Bay Area while the structural conditions that shape it go unaddressed."),
    ],
    pullQuote: "Strip out American Canyon entirely and the remaining 113,728 residents \u2014 83% of the county \u2014 gained 70 people in a year.",
    links: [
      { label: "Interactive article", url: "https://napaserve.org/under-the-hood/napa-population-2025" },
    ],
    captions: [
      { number: 1, title: "Napa County Population Trend, 2000\u20132025", description: "Growth peaked in 2016 and has not recovered. The 2025 count nearly equals 2010.", source: "U.S. Census Bureau (2000, 2010, 2020); California Dept. of Finance E-1 estimates (2025)" },
      { number: 2, title: "Population Change by Jurisdiction, 2024\u20132025", description: "Ordered north to south. Every jurisdiction except Napa city and American Canyon declined.", source: "California Dept. of Finance E-1 Population Estimates, Jan. 1, 2024 and Jan. 1, 2025" },
      { number: 3, title: "Population by Jurisdiction, 2000 vs. 2025", description: "American Canyon +129% since 2000. St. Helena and Yountville each down roughly 10%.", source: "U.S. Census Bureau 2000; California Dept. of Finance E-1 2025" },
      { number: 4, title: "Net Commuter Inflow and Linear Projection, 2015\u20132030", description: "Net inbound commuters fell 40% in three years. Linear projection of NVTA trend.", source: "ACS County-to-County Commuting Flows 2011\u20132015; NVTA 2018" },
      { number: 5, title: "Jobs per Hotel Room Added", description: "The relationship between hotel growth and job growth reversed completely after 2019.", source: "BLS (NAPA906LEIHN; SMU06349007072200001SA); STR Monthly Industry Report" },
      { number: 6, title: "Housing Units and Total Jobs, Indexed to 2019 = 100", description: "Since the pre-pandemic peak, housing has kept growing while jobs have not recovered.", source: "Housing \u2014 California Dept. of Finance E-1H. Employment \u2014 BLS Napa County total nonfarm." },
    ],
    sources: [
      "California Department of Finance E-1 Population Estimates (2025). https://dof.ca.gov/forecasting/demographics/estimates/e-1/",
      "U.S. Census Bureau Decennial Census (2000, 2010, 2020).",
      "Napa Valley Transportation Authority. Napa Valley Travel Behavior Study (2018).",
      "Bureau of Labor Statistics QCEW and CES series (NAPA906LEIHN; SMU06349007072200001SA).",
      "STR Monthly Industry Report.",
      "American Community Survey County-to-County Commuting Flows 2011\u20132015.",
      "California Department of Finance E-1H Housing Unit series.",
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

      <a href={`/under-the-hood/${article.slug}`}
        style={{ fontFamily: mono, fontSize: 11, color: T.muted, textDecoration: "none", display: "block", marginBottom: 16 }}>
        View article {"\u2192"}
      </a>

      {!published && (
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
          style={{ ...btnBase, background: T.accent, color: "#fff", display: "block", width: "100%", marginBottom: 10, opacity: publishing ? 0.7 : 1 }}
        >
          {publishing ? "Publishing\u2026" : "Publish Article"}
        </button>
      )}

      {state === "idle" && (
        <button onClick={() => setState("preview")} style={{ ...btnBase, background: T.accent, color: "#fff" }}>
          Post to BlueSky
        </button>
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
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 60px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, marginBottom: 8 }}>
              Valley Works Collaborative {"\u00B7"} NapaServe
            </div>
            <h1 style={{ fontFamily: serif, fontSize: 32, fontWeight: 700, color: T.ink, margin: 0 }}>
              Admin
            </h1>
            <p style={{ fontFamily: font, fontSize: 17, fontWeight: 300, color: T.muted, margin: "8px 0 0" }}>
              Publisher & Operations Tools
            </p>
          </div>
          <button onClick={handleLogout} style={{
            fontFamily: mono, fontSize: 11, color: T.muted, background: "transparent",
            border: "none", cursor: "pointer", padding: "4px 0", marginTop: 4,
          }}>
            Sign out
          </button>
        </div>

        <div style={{ borderTop: `1px solid ${T.border}`, margin: "24px 0 32px" }} />

        {/* Admin Tool Cards */}
        <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, marginBottom: 6 }}>
          Admin Tools
        </div>
        <p style={{ fontFamily: font, fontSize: 14, color: T.muted, margin: "0 0 20px" }}>
          Internal tools for NapaServe operations
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 40 }}>
          {/* Weekly Digest card */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, padding: "24px 20px" }}>
            <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: T.gold, marginBottom: 8 }}>Weekly Digest</div>
            <div style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, marginBottom: 8 }}>The Napa Valley Weekender</div>
            <p style={{ fontFamily: font, fontSize: 14, color: T.muted, lineHeight: 1.5, margin: "0 0 16px" }}>
              Review, format and send the weekly Weekender email to subscribers.
            </p>
            <button onClick={() => navigate("/events/digest")} style={{
              fontFamily: font, fontSize: 13, fontWeight: 600, color: "#fff",
              background: T.accent, border: "none", padding: "8px 20px", cursor: "pointer",
            }}>
              Open Digest Tool
            </button>
          </div>

        </div>

        {/* Event Intake */}
        <EventIntake />

        <div style={{ borderTop: `1px solid ${T.border}`, margin: "0 0 32px" }} />

        {/* BlueSky Publisher section */}
        <div style={{ fontFamily: mono, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, marginBottom: 6 }}>
          BlueSky Publisher
        </div>
        <p style={{ fontFamily: font, fontSize: 14, color: T.muted, margin: "0 0 24px" }}>
          Post Under the Hood articles to @valleyworkscollab.bsky.social
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {ARTICLES.map(article => {
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
        </div>
      </div>
      <Footer />
    </div>
  );
}
