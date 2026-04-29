// UNDER THE HOOD — Eighty-Seven Cents and Counting
// -----------------------------------------------------------------
// Slug: napa-lodging-pricing-2026
// Publication: Napa Valley Features
// Built from under-the-hood-template.jsx on 2026-04-28.
// Part 4 of the April–May 2026 series.
// -----------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import NavBar from "./NavBar";
import Footer from "./Footer";
import useDraftGate from "./hooks/useDraftGate";
import DraftBanner from "./components/DraftBanner";

Chart.register(...registerables);
Chart.register(annotationPlugin);

const WORKER = "https://misty-bush-fc93.tfcarl.workers.dev";

// ── ARTICLE METADATA ───────────────────────────────────────────────
const ARTICLE_SLUG = "napa-lodging-pricing-2026";
const ARTICLE_TITLE = "Napa Valley Adds Rooms While Demand Lags";
const ARTICLE_DECK = "Across GDP, lodging revenue and hospitality jobs, Napa’s growth has been a price story — and a supply expansion now under way could push that pattern further before it bends.";
const ARTICLE_PUBLICATION = "Napa Valley Features";
const ARTICLE_DATE = "May 2, 2026";
const POLL_IDS = [33, 34, 35]; // eslint-disable-line no-unused-vars
const SHOW_DECK = true;
const EYEBROW = "Under the Hood";

// ── COUNTY + PUBLICATION (template-compat downstream constants) ────
const PUBLICATION = ARTICLE_PUBLICATION;
const SUBSTACK_URL = "https://napavalleyfocus.substack.com/";
const DATELINE_LOCATION = "NAPA VALLEY, Calif.";

// ── THEME ──────────────────────────────────────────────────────────
const T = {
  bg: "#F5F0E8",
  surface: "#EDE8DE",
  ink: "#2C1810",
  accent: "#8B5E3C",
  gold: "#C4A050",
  muted: "#8B7355",
  border: "#D4C9B8",
  rule: "rgba(44,24,16,0.12)",
};
const font = "'Source Sans 3','Source Sans Pro',sans-serif";
const serif = "'Libre Baskerville',Georgia,serif";

const prose = {
  fontFamily: font,
  fontSize: 17,
  lineHeight: 1.75,
  color: T.ink,
  marginBottom: 18,
};

// ── GDP CHART DATA (verbatim from under-the-hood-gdp-2024.jsx) ─────
const GDP_YEARS    = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
const GDP_NOMINAL  = [10.75, 11.00, 11.21, 11.46, 11.21, 12.73, 12.76, 14.03, 14.59];
const GDP_REAL     = [10.81, 11.00, 11.05, 11.00, 10.45, 11.46, 10.97, 11.22, 11.31];

// Inflation-gap shading plugin (ported from napa-gdp-2024)
const gdpGapPlugin = {
  id: "gdpGapShading",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const nomMeta = chart.getDatasetMeta(0);
    const realMeta = chart.getDatasetMeta(1);
    if (!nomMeta.data.length || !realMeta.data.length) return;
    ctx.save();
    ctx.beginPath();
    nomMeta.data.forEach((pt, i) => { if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y); });
    for (let i = realMeta.data.length - 1; i >= 0; i--) ctx.lineTo(realMeta.data[i].x, realMeta.data[i].y);
    ctx.closePath();
    ctx.fillStyle = "rgba(196,160,80,0.22)";
    ctx.fill();
    ctx.restore();
  },
};

// ── BLS L&H DATA ───────────────────────────────────────────────────
// 12-month trailing average of NAPA906LEIHN (NSA monthly), 1990-12 → 2026-02.
// Source CSV: BLS via FRED (https://fred.stlouisfed.org/series/NAPA906LEIHN).
const BLS_LH_TA = [
  {d:"1990-12-01",v:5.88}, {d:"1991-01-01",v:5.88}, {d:"1991-02-01",v:5.89}, {d:"1991-03-01",v:5.92}, {d:"1991-04-01",v:5.92}, {d:"1991-05-01",v:5.92}, {d:"1991-06-01",v:5.91}, {d:"1991-07-01",v:5.91},
  {d:"1991-08-01",v:5.88}, {d:"1991-09-01",v:5.88}, {d:"1991-10-01",v:5.86}, {d:"1991-11-01",v:5.83}, {d:"1991-12-01",v:5.8}, {d:"1992-01-01",v:5.79}, {d:"1992-02-01",v:5.81}, {d:"1992-03-01",v:5.82},
  {d:"1992-04-01",v:5.8}, {d:"1992-05-01",v:5.79}, {d:"1992-06-01",v:5.77}, {d:"1992-07-01",v:5.77}, {d:"1992-08-01",v:5.77}, {d:"1992-09-01",v:5.75}, {d:"1992-10-01",v:5.75}, {d:"1992-11-01",v:5.75},
  {d:"1992-12-01",v:5.73}, {d:"1993-01-01",v:5.72}, {d:"1993-02-01",v:5.71}, {d:"1993-03-01",v:5.69}, {d:"1993-04-01",v:5.7}, {d:"1993-05-01",v:5.72}, {d:"1993-06-01",v:5.73}, {d:"1993-07-01",v:5.71},
  {d:"1993-08-01",v:5.69}, {d:"1993-09-01",v:5.68}, {d:"1993-10-01",v:5.66}, {d:"1993-11-01",v:5.65}, {d:"1993-12-01",v:5.65}, {d:"1994-01-01",v:5.65}, {d:"1994-02-01",v:5.64}, {d:"1994-03-01",v:5.63},
  {d:"1994-04-01",v:5.62}, {d:"1994-05-01",v:5.61}, {d:"1994-06-01",v:5.62}, {d:"1994-07-01",v:5.63}, {d:"1994-08-01",v:5.64}, {d:"1994-09-01",v:5.64}, {d:"1994-10-01",v:5.64}, {d:"1994-11-01",v:5.64},
  {d:"1994-12-01",v:5.66}, {d:"1995-01-01",v:5.67}, {d:"1995-02-01",v:5.67}, {d:"1995-03-01",v:5.67}, {d:"1995-04-01",v:5.71}, {d:"1995-05-01",v:5.75}, {d:"1995-06-01",v:5.77}, {d:"1995-07-01",v:5.81},
  {d:"1995-08-01",v:5.85}, {d:"1995-09-01",v:5.89}, {d:"1995-10-01",v:5.93}, {d:"1995-11-01",v:5.97}, {d:"1995-12-01",v:5.98}, {d:"1996-01-01",v:6.01}, {d:"1996-02-01",v:6.04}, {d:"1996-03-01",v:6.08},
  {d:"1996-04-01",v:6.12}, {d:"1996-05-01",v:6.14}, {d:"1996-06-01",v:6.19}, {d:"1996-07-01",v:6.23}, {d:"1996-08-01",v:6.26}, {d:"1996-09-01",v:6.29}, {d:"1996-10-01",v:6.35}, {d:"1996-11-01",v:6.41},
  {d:"1996-12-01",v:6.48}, {d:"1997-01-01",v:6.52}, {d:"1997-02-01",v:6.58}, {d:"1997-03-01",v:6.63}, {d:"1997-04-01",v:6.67}, {d:"1997-05-01",v:6.73}, {d:"1997-06-01",v:6.76}, {d:"1997-07-01",v:6.79},
  {d:"1997-08-01",v:6.82}, {d:"1997-09-01",v:6.86}, {d:"1997-10-01",v:6.9}, {d:"1997-11-01",v:6.93}, {d:"1997-12-01",v:6.96}, {d:"1998-01-01",v:6.96}, {d:"1998-02-01",v:6.93}, {d:"1998-03-01",v:6.93},
  {d:"1998-04-01",v:6.98}, {d:"1998-05-01",v:7.0}, {d:"1998-06-01",v:7.04}, {d:"1998-07-01",v:7.07}, {d:"1998-08-01",v:7.12}, {d:"1998-09-01",v:7.16}, {d:"1998-10-01",v:7.16}, {d:"1998-11-01",v:7.17},
  {d:"1998-12-01",v:7.2}, {d:"1999-01-01",v:7.25}, {d:"1999-02-01",v:7.33}, {d:"1999-03-01",v:7.4}, {d:"1999-04-01",v:7.43}, {d:"1999-05-01",v:7.47}, {d:"1999-06-01",v:7.5}, {d:"1999-07-01",v:7.52},
  {d:"1999-08-01",v:7.52}, {d:"1999-09-01",v:7.52}, {d:"1999-10-01",v:7.56}, {d:"1999-11-01",v:7.58}, {d:"1999-12-01",v:7.59}, {d:"2000-01-01",v:7.62}, {d:"2000-02-01",v:7.63}, {d:"2000-03-01",v:7.66},
  {d:"2000-04-01",v:7.65}, {d:"2000-05-01",v:7.63}, {d:"2000-06-01",v:7.61}, {d:"2000-07-01",v:7.62}, {d:"2000-08-01",v:7.64}, {d:"2000-09-01",v:7.66}, {d:"2000-10-01",v:7.64}, {d:"2000-11-01",v:7.64},
  {d:"2000-12-01",v:7.66}, {d:"2001-01-01",v:7.68}, {d:"2001-02-01",v:7.73}, {d:"2001-03-01",v:7.77}, {d:"2001-04-01",v:7.83}, {d:"2001-05-01",v:7.9}, {d:"2001-06-01",v:7.98}, {d:"2001-07-01",v:8.03},
  {d:"2001-08-01",v:8.1}, {d:"2001-09-01",v:8.14}, {d:"2001-10-01",v:8.2}, {d:"2001-11-01",v:8.24}, {d:"2001-12-01",v:8.28}, {d:"2002-01-01",v:8.27}, {d:"2002-02-01",v:8.25}, {d:"2002-03-01",v:8.21},
  {d:"2002-04-01",v:8.18}, {d:"2002-05-01",v:8.15}, {d:"2002-06-01",v:8.12}, {d:"2002-07-01",v:8.11}, {d:"2002-08-01",v:8.09}, {d:"2002-09-01",v:8.08}, {d:"2002-10-01",v:8.07}, {d:"2002-11-01",v:8.06},
  {d:"2002-12-01",v:8.04}, {d:"2003-01-01",v:8.07}, {d:"2003-02-01",v:8.07}, {d:"2003-03-01",v:8.08}, {d:"2003-04-01",v:8.1}, {d:"2003-05-01",v:8.12}, {d:"2003-06-01",v:8.14}, {d:"2003-07-01",v:8.16},
  {d:"2003-08-01",v:8.17}, {d:"2003-09-01",v:8.22}, {d:"2003-10-01",v:8.25}, {d:"2003-11-01",v:8.29}, {d:"2003-12-01",v:8.35}, {d:"2004-01-01",v:8.37}, {d:"2004-02-01",v:8.39}, {d:"2004-03-01",v:8.42},
  {d:"2004-04-01",v:8.42}, {d:"2004-05-01",v:8.43}, {d:"2004-06-01",v:8.46}, {d:"2004-07-01",v:8.47}, {d:"2004-08-01",v:8.5}, {d:"2004-09-01",v:8.51}, {d:"2004-10-01",v:8.53}, {d:"2004-11-01",v:8.53},
  {d:"2004-12-01",v:8.52}, {d:"2005-01-01",v:8.51}, {d:"2005-02-01",v:8.51}, {d:"2005-03-01",v:8.49}, {d:"2005-04-01",v:8.51}, {d:"2005-05-01",v:8.52}, {d:"2005-06-01",v:8.51}, {d:"2005-07-01",v:8.51},
  {d:"2005-08-01",v:8.51}, {d:"2005-09-01",v:8.51}, {d:"2005-10-01",v:8.5}, {d:"2005-11-01",v:8.51}, {d:"2005-12-01",v:8.51}, {d:"2006-01-01",v:8.5}, {d:"2006-02-01",v:8.48}, {d:"2006-03-01",v:8.47},
  {d:"2006-04-01",v:8.43}, {d:"2006-05-01",v:8.42}, {d:"2006-06-01",v:8.41}, {d:"2006-07-01",v:8.42}, {d:"2006-08-01",v:8.41}, {d:"2006-09-01",v:8.42}, {d:"2006-10-01",v:8.44}, {d:"2006-11-01",v:8.47},
  {d:"2006-12-01",v:8.49}, {d:"2007-01-01",v:8.54}, {d:"2007-02-01",v:8.59}, {d:"2007-03-01",v:8.65}, {d:"2007-04-01",v:8.73}, {d:"2007-05-01",v:8.8}, {d:"2007-06-01",v:8.87}, {d:"2007-07-01",v:8.91},
  {d:"2007-08-01",v:8.96}, {d:"2007-09-01",v:9.0}, {d:"2007-10-01",v:9.03}, {d:"2007-11-01",v:9.06}, {d:"2007-12-01",v:9.08}, {d:"2008-01-01",v:9.11}, {d:"2008-02-01",v:9.12}, {d:"2008-03-01",v:9.12},
  {d:"2008-04-01",v:9.15}, {d:"2008-05-01",v:9.16}, {d:"2008-06-01",v:9.17}, {d:"2008-07-01",v:9.18}, {d:"2008-08-01",v:9.19}, {d:"2008-09-01",v:9.22}, {d:"2008-10-01",v:9.24}, {d:"2008-11-01",v:9.25},
  {d:"2008-12-01",v:9.26}, {d:"2009-01-01",v:9.25}, {d:"2009-02-01",v:9.25}, {d:"2009-03-01",v:9.24}, {d:"2009-04-01",v:9.21}, {d:"2009-05-01",v:9.17}, {d:"2009-06-01",v:9.11}, {d:"2009-07-01",v:9.07},
  {d:"2009-08-01",v:9.01}, {d:"2009-09-01",v:8.93}, {d:"2009-10-01",v:8.89}, {d:"2009-11-01",v:8.86}, {d:"2009-12-01",v:8.84}, {d:"2010-01-01",v:8.83}, {d:"2010-02-01",v:8.83}, {d:"2010-03-01",v:8.83},
  {d:"2010-04-01",v:8.84}, {d:"2010-05-01",v:8.88}, {d:"2010-06-01",v:8.92}, {d:"2010-07-01",v:8.98}, {d:"2010-08-01",v:9.07}, {d:"2010-09-01",v:9.14}, {d:"2010-10-01",v:9.2}, {d:"2010-11-01",v:9.26},
  {d:"2010-12-01",v:9.31}, {d:"2011-01-01",v:9.36}, {d:"2011-02-01",v:9.41}, {d:"2011-03-01",v:9.47}, {d:"2011-04-01",v:9.53}, {d:"2011-05-01",v:9.59}, {d:"2011-06-01",v:9.66}, {d:"2011-07-01",v:9.69},
  {d:"2011-08-01",v:9.75}, {d:"2011-09-01",v:9.83}, {d:"2011-10-01",v:9.88}, {d:"2011-11-01",v:9.95}, {d:"2011-12-01",v:10.01}, {d:"2012-01-01",v:10.06}, {d:"2012-02-01",v:10.12}, {d:"2012-03-01",v:10.2},
  {d:"2012-04-01",v:10.27}, {d:"2012-05-01",v:10.34}, {d:"2012-06-01",v:10.42}, {d:"2012-07-01",v:10.47}, {d:"2012-08-01",v:10.52}, {d:"2012-09-01",v:10.55}, {d:"2012-10-01",v:10.59}, {d:"2012-11-01",v:10.63},
  {d:"2012-12-01",v:10.67}, {d:"2013-01-01",v:10.7}, {d:"2013-02-01",v:10.74}, {d:"2013-03-01",v:10.77}, {d:"2013-04-01",v:10.81}, {d:"2013-05-01",v:10.87}, {d:"2013-06-01",v:10.91}, {d:"2013-07-01",v:10.97},
  {d:"2013-08-01",v:11.03}, {d:"2013-09-01",v:11.09}, {d:"2013-10-01",v:11.16}, {d:"2013-11-01",v:11.23}, {d:"2013-12-01",v:11.33}, {d:"2014-01-01",v:11.45}, {d:"2014-02-01",v:11.53}, {d:"2014-03-01",v:11.62},
  {d:"2014-04-01",v:11.7}, {d:"2014-05-01",v:11.74}, {d:"2014-06-01",v:11.79}, {d:"2014-07-01",v:11.81}, {d:"2014-08-01",v:11.81}, {d:"2014-09-01",v:11.81}, {d:"2014-10-01",v:11.83}, {d:"2014-11-01",v:11.85},
  {d:"2014-12-01",v:11.87}, {d:"2015-01-01",v:11.89}, {d:"2015-02-01",v:11.93}, {d:"2015-03-01",v:11.97}, {d:"2015-04-01",v:12.02}, {d:"2015-05-01",v:12.08}, {d:"2015-06-01",v:12.12}, {d:"2015-07-01",v:12.22},
  {d:"2015-08-01",v:12.33}, {d:"2015-09-01",v:12.42}, {d:"2015-10-01",v:12.49}, {d:"2015-11-01",v:12.56}, {d:"2015-12-01",v:12.61}, {d:"2016-01-01",v:12.62}, {d:"2016-02-01",v:12.65}, {d:"2016-03-01",v:12.67},
  {d:"2016-04-01",v:12.72}, {d:"2016-05-01",v:12.72}, {d:"2016-06-01",v:12.72}, {d:"2016-07-01",v:12.72}, {d:"2016-08-01",v:12.72}, {d:"2016-09-01",v:12.71}, {d:"2016-10-01",v:12.7}, {d:"2016-11-01",v:12.71},
  {d:"2016-12-01",v:12.72}, {d:"2017-01-01",v:12.75}, {d:"2017-02-01",v:12.78}, {d:"2017-03-01",v:12.8}, {d:"2017-04-01",v:12.8}, {d:"2017-05-01",v:12.82}, {d:"2017-06-01",v:12.86}, {d:"2017-07-01",v:12.9},
  {d:"2017-08-01",v:12.95}, {d:"2017-09-01",v:13.0}, {d:"2017-10-01",v:13.03}, {d:"2017-11-01",v:13.04}, {d:"2017-12-01",v:13.08}, {d:"2018-01-01",v:13.11}, {d:"2018-02-01",v:13.15}, {d:"2018-03-01",v:13.19},
  {d:"2018-04-01",v:13.24}, {d:"2018-05-01",v:13.29}, {d:"2018-06-01",v:13.33}, {d:"2018-07-01",v:13.33}, {d:"2018-08-01",v:13.35}, {d:"2018-09-01",v:13.37}, {d:"2018-10-01",v:13.41}, {d:"2018-11-01",v:13.44},
  {d:"2018-12-01",v:13.49}, {d:"2019-01-01",v:13.52}, {d:"2019-02-01",v:13.53}, {d:"2019-03-01",v:13.55}, {d:"2019-04-01",v:13.56}, {d:"2019-05-01",v:13.58}, {d:"2019-06-01",v:13.61}, {d:"2019-07-01",v:13.63},
  {d:"2019-08-01",v:13.66}, {d:"2019-09-01",v:13.68}, {d:"2019-10-01",v:13.7}, {d:"2019-11-01",v:13.72}, {d:"2019-12-01",v:13.71}, {d:"2020-01-01",v:13.72}, {d:"2020-02-01",v:13.72}, {d:"2020-03-01",v:13.67},
  {d:"2020-04-01",v:12.92}, {d:"2020-05-01",v:12.23}, {d:"2020-06-01",v:11.71}, {d:"2020-07-01",v:11.28}, {d:"2020-08-01",v:10.83}, {d:"2020-09-01",v:10.38}, {d:"2020-10-01",v:9.97}, {d:"2020-11-01",v:9.57},
  {d:"2020-12-01",v:9.11}, {d:"2021-01-01",v:8.51}, {d:"2021-02-01",v:8.06}, {d:"2021-03-01",v:7.72}, {d:"2021-04-01",v:8.12}, {d:"2021-05-01",v:8.5}, {d:"2021-06-01",v:8.73}, {d:"2021-07-01",v:8.93},
  {d:"2021-08-01",v:9.17}, {d:"2021-09-01",v:9.42}, {d:"2021-10-01",v:9.66}, {d:"2021-11-01",v:9.89}, {d:"2021-12-01",v:10.2}, {d:"2022-01-01",v:10.66}, {d:"2022-02-01",v:10.97}, {d:"2022-03-01",v:11.26},
  {d:"2022-04-01",v:11.51}, {d:"2022-05-01",v:11.73}, {d:"2022-06-01",v:11.92}, {d:"2022-07-01",v:12.1}, {d:"2022-08-01",v:12.26}, {d:"2022-09-01",v:12.38}, {d:"2022-10-01",v:12.5}, {d:"2022-11-01",v:12.62},
  {d:"2022-12-01",v:12.72}, {d:"2023-01-01",v:12.82}, {d:"2023-02-01",v:12.91}, {d:"2023-03-01",v:12.98}, {d:"2023-04-01",v:13.05}, {d:"2023-05-01",v:13.11}, {d:"2023-06-01",v:13.17}, {d:"2023-07-01",v:13.22},
  {d:"2023-08-01",v:13.23}, {d:"2023-09-01",v:13.26}, {d:"2023-10-01",v:13.28}, {d:"2023-11-01",v:13.28}, {d:"2023-12-01",v:13.28}, {d:"2024-01-01",v:13.28}, {d:"2024-02-01",v:13.27}, {d:"2024-03-01",v:13.25},
  {d:"2024-04-01",v:13.24}, {d:"2024-05-01",v:13.23}, {d:"2024-06-01",v:13.22}, {d:"2024-07-01",v:13.22}, {d:"2024-08-01",v:13.25}, {d:"2024-09-01",v:13.26}, {d:"2024-10-01",v:13.28}, {d:"2024-11-01",v:13.3},
  {d:"2024-12-01",v:13.3}, {d:"2025-01-01",v:13.32}, {d:"2025-02-01",v:13.33}, {d:"2025-03-01",v:13.33}, {d:"2025-04-01",v:13.32}, {d:"2025-05-01",v:13.32}, {d:"2025-06-01",v:13.31}, {d:"2025-07-01",v:13.28},
  {d:"2025-08-01",v:13.26}, {d:"2025-09-01",v:13.23}, {d:"2025-10-01",v:13.21}, {d:"2025-11-01",v:13.21}, {d:"2025-12-01",v:13.23}, {d:"2026-01-01",v:13.27}, {d:"2026-02-01",v:13.32},
];

const h2style = {
  fontFamily: serif,
  fontSize: 22,
  fontWeight: 700,
  color: T.ink,
  marginTop: 32,
  marginBottom: 14,
};

// ── INLINE LINK ────────────────────────────────────────────────────
// Per spec: T.accent color, no underline by default, underline on hover,
// target="_blank" rel="noopener noreferrer". Used for every reference
// to a prior NVF piece, an external article, an external report, or a
// regulatory filing in the body prose.
function L({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: T.accent, textDecoration: "none" }}
      onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
      onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
    >
      {children}
    </a>
  );
}

// ── DOWNLOAD HELPER ────────────────────────────────────────────────
// onclone: replace any <input type="range"> in the cloned DOM with a
// styled visual representation. html2canvas cannot render native range
// inputs reliably; without this they capture as blank rectangles.
async function downloadComponentPng(containerRef, filename, title) {
  if (!containerRef.current) return;
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(containerRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: T.bg,
    onclone: (clonedDoc) => {
      clonedDoc.querySelectorAll('input[type="range"]').forEach((input) => {
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        const val = parseFloat(input.value);
        const pct = ((val - min) / (max - min)) * 100;
        const wrapper = clonedDoc.createElement("div");
        wrapper.style.cssText = `position: relative; height: 8px; background: #DDD5C7; border-radius: 4px; margin: 18px 0 22px;`;
        const fill = clonedDoc.createElement("div");
        fill.style.cssText = `position: absolute; left: 0; top: 0; height: 100%; width: ${pct}%; background: ${T.accent}; border-radius: 4px;`;
        const marker = clonedDoc.createElement("div");
        marker.style.cssText = `position: absolute; left: ${pct}%; top: 50%; transform: translate(-50%, -50%); width: 18px; height: 18px; background: ${T.gold}; border: 2px solid ${T.ink}; border-radius: 50%;`;
        const valueLabel = clonedDoc.createElement("div");
        valueLabel.style.cssText = `position: absolute; left: ${pct}%; top: -22px; transform: translateX(-50%); font-family: 'Source Code Pro', monospace; font-size: 11px; color: ${T.ink}; font-weight: 600; white-space: nowrap;`;
        const sign = val > 0 ? "+" : "";
        valueLabel.textContent = `${sign}${val}%`;
        wrapper.appendChild(fill);
        wrapper.appendChild(marker);
        wrapper.appendChild(valueLabel);
        if (input.parentElement) input.parentElement.replaceChild(wrapper, input);
      });
    },
  });
  const off = document.createElement("canvas");
  off.width = canvas.width;
  off.height = canvas.height + 80;
  const ctx = off.getContext("2d");
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, off.width, off.height);
  ctx.drawImage(canvas, 0, 64);
  ctx.save();
  ctx.globalAlpha = 1.0;
  ctx.font = "bold 32px 'Libre Baskerville', Georgia, serif";
  ctx.fillStyle = T.ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(title || "", 28, 16);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.font = "26px 'Source Code Pro', monospace";
  ctx.fillStyle = T.muted;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("napaserve.org", off.width - 24, off.height - 28);
  ctx.restore();
  const a = document.createElement("a");
  a.href = off.toDataURL("image/png");
  a.download = filename;
  a.click();
}

// ── DOWNLOAD BUTTON ────────────────────────────────────────────────
function DownloadButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 12px",
        fontFamily: "monospace",
        fontSize: 11,
        fontWeight: 400,
        letterSpacing: "0.88px",
        color: T.muted,
        background: "transparent",
        border: `1px solid ${T.border}`,
        borderRadius: 3,
        cursor: "pointer",
        marginTop: 12,
      }}
    >
      DOWNLOAD CHART PNG
    </button>
  );
}

// ── CAPTION ────────────────────────────────────────────────────────
function Caption({ title, description, sources = [] }) {
  return (
    <p style={{ fontFamily: font, fontSize: 13, color: T.muted, fontStyle: "italic", lineHeight: 1.55, margin: "14px 0 0", maxWidth: 680 }}>
      <strong style={{ fontWeight: 700, fontStyle: "italic" }}>{title}.</strong>{" "}
      {description}{" "}
      {sources.length > 0 && (
        <>
          Source:{" "}
          {sources.map((s, i) => (
            <span key={i}>
              {s.url
                ? <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>{s.label}</a>
                : <span>{s.label}</span>}
              {i < sources.length - 1 ? "; " : "."}
            </span>
          ))}
        </>
      )}
    </p>
  );
}

// ── LIVE POLL ──────────────────────────────────────────────────────
function LivePoll({ poll }) {
  const [voted, setVoted] = useState(null);
  const [counts, setCounts] = useState(poll.counts || {});
  const [total, setTotal] = useState(poll.total || 0);
  const [loading, setLoading] = useState(false);
  const vote = async (idx) => {
    if (voted !== null || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${WORKER}/api/article-poll-vote`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poll_id: poll.id, option_index: idx }),
      });
      const data = await res.json();
      if (data.success) { setCounts(data.counts); setTotal(data.total); setVoted(idx); }
    } catch (e) { /* swallow */ }
    setLoading(false);
  };
  return (
    <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "20px 20px 16px", marginBottom: 16 }}>
      <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 8px 0" }}>Poll</p>
      <p style={{ fontFamily: serif, fontSize: 15, fontWeight: 700, color: T.ink, margin: "0 0 14px 0", lineHeight: 1.4 }}>{poll.question}</p>
      {poll.options.map((opt, idx) => {
        const count = counts[idx] || 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        const isVoted = voted === idx;
        return (
          <div key={idx} style={{ marginBottom: 8 }}>
            {voted === null ? (
              <button onClick={() => vote(idx)} disabled={loading}
                style={{ width: "100%", textAlign: "center", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: "9px 12px", fontFamily: font, fontSize: 14, color: T.ink, cursor: loading ? "default" : "pointer" }}>
                {opt}
              </button>
            ) : (
              <div style={{ position: "relative", overflow: "hidden", borderRadius: 4, border: `1px solid ${isVoted ? T.accent : T.border}` }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: pct + "%", background: isVoted ? "rgba(139,94,60,0.15)" : "rgba(139,94,60,0.06)", transition: "width 0.5s ease" }} />
                <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px" }}>
                  <span style={{ fontFamily: font, fontSize: 14, color: T.ink, fontWeight: isVoted ? 600 : 400 }}>{opt}</span>
                  <span style={{ fontFamily: font, fontSize: 13, color: T.muted, marginLeft: 12, whiteSpace: "nowrap" }}>{pct}%</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {voted !== null && <p style={{ fontFamily: font, fontSize: 12, color: T.muted, margin: "10px 0 0 0" }}>{total} {total === 1 ? "vote" : "votes"} {"·"} Results update in real time</p>}
    </div>
  );
}

// ── POLLS SECTION ──────────────────────────────────────────────────
function PollsSection({ slug }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${WORKER}/api/article-polls?slug=${slug}`)
      .then(r => r.json())
      .then(data => { setPolls(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);
  if (loading) return <div style={{ padding: "24px 0", fontFamily: font, fontSize: 14, color: T.muted }}>Loading polls...</div>;
  if (!polls.length) return null;
  return (
    <div style={{ borderTop: `2px solid ${T.border}`, marginTop: 48, paddingTop: 32 }}>
      <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.1em", color: T.gold, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px 0" }}>{"Today’s Polls"}</p>
      <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 20px 0" }}>What do you think?</h2>
      {polls.map(poll => <LivePoll key={poll.id} poll={poll} />)}
      <p style={{ fontFamily: font, fontSize: 12, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
        Poll results are anonymous and stored on NapaServe. Results shown after you vote.{" "}
        Historical reader polls from {PUBLICATION} on Substack are searchable in the{" "}
        <a href="/dashboard" style={{ color: T.accent }}>Community Pulse dashboard</a>.
      </p>
    </div>
  );
}

// ── CHART 1 — Three Surfaces, One Pattern (3 panels, 1 download) ───
function ChartOne() {
  const containerRef = useRef(null);
  const c1 = useRef(null);
  const c2 = useRef(null);
  const c3 = useRef(null);
  const charts = useRef([]);

  useEffect(() => {
    charts.current.forEach(ch => ch && ch.destroy());
    charts.current = [];

    if (c1.current) {
      charts.current.push(new Chart(c1.current.getContext("2d"), {
        type: "bar",
        data: {
          labels: ["Nominal GDP", "Real GDP"],
          datasets: [{
            data: [35.8, 4.6],
            backgroundColor: [T.accent, T.gold],
            borderRadius: 3,
          }],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `+${ctx.parsed.x}%` } } },
          scales: {
            x: { beginAtZero: true, max: 40, ticks: { callback: (v) => v + "%", color: T.muted, font: { size: 11 } }, grid: { color: T.rule } },
            y: { ticks: { color: T.ink, font: { size: 12, weight: "bold" } }, grid: { display: false } },
          },
        },
      }));
    }

    if (c2.current) {
      charts.current.push(new Chart(c2.current.getContext("2d"), {
        type: "bar",
        data: {
          labels: ["Revenue", "Demand"],
          datasets: [{
            data: [23.2, -4.4],
            backgroundColor: [T.accent, T.muted],
            borderRadius: 3,
          }],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => (ctx.parsed.x > 0 ? "+" : "") + ctx.parsed.x + "%" } } },
          scales: {
            x: { beginAtZero: true, min: -10, max: 30, ticks: { callback: (v) => v + "%", color: T.muted, font: { size: 11 } }, grid: { color: T.rule } },
            y: { ticks: { color: T.ink, font: { size: 12, weight: "bold" } }, grid: { display: false } },
          },
        },
      }));
    }

    if (c3.current) {
      charts.current.push(new Chart(c3.current.getContext("2d"), {
        type: "bar",
        data: {
          labels: ["Rooms", "Jobs"],
          datasets: [{
            data: [382, -670],
            backgroundColor: ["#3F7A4D", "#A33F3F"],
            borderRadius: 3,
          }],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => (ctx.parsed.x > 0 ? "+" : "") + ctx.parsed.x } } },
          scales: {
            x: { beginAtZero: true, suggestedMin: -800, suggestedMax: 500, ticks: { color: T.muted, font: { size: 11 } }, grid: { color: T.rule } },
            y: { ticks: { color: T.ink, font: { size: 12, weight: "bold" } }, grid: { display: false } },
          },
        },
      }));
    }

    return () => { charts.current.forEach(ch => ch && ch.destroy()); };
  }, []);

  const panelStyle = { flex: "1 1 240px", minWidth: 240, background: T.bg, border: `1px solid ${T.rule}`, borderRadius: 4, padding: "14px 14px 10px" };
  const panelTitle = { fontFamily: serif, fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 8 };
  const panelNote = { fontFamily: "monospace", fontSize: 11, color: T.muted, marginTop: 8, textAlign: "center" };
  const canvasWrap = { position: "relative", height: 110 };

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>Three Surfaces, One Pattern</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, borderRadius: 4, padding: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <div style={panelStyle}>
            <div style={panelTitle}>GDP since 2016</div>
            <div style={canvasWrap}><canvas ref={c1} id="chart-1-panel-a" /></div>
            <div style={panelNote}>Gap: 87% inflation</div>
          </div>
          <div style={panelStyle}>
            <div style={panelTitle}>Lodging since 2019</div>
            <div style={canvasWrap}><canvas ref={c2} id="chart-1-panel-b" /></div>
            <div style={panelNote}>Gap: 27.6 pp</div>
          </div>
          <div style={panelStyle}>
            <div style={panelTitle}>Rooms vs Jobs since 2019</div>
            <div style={canvasWrap}><canvas ref={c3} id="chart-1-panel-c" /></div>
            <div style={panelNote}>+382 rooms {"·"} {"−"}670 jobs</div>
          </div>
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-1_napa-lodging-pricing-2026_nvf.png", "Three surfaces, one pattern: Napa County, 2016–2026")} />
      <Caption
        title="Three surfaces, one pattern"
        description={"Across GDP, lodging revenue and hospitality jobs, the post-2019 decade has produced apparent growth driven by price, not volume."}
        sources={[
          { label: "Bureau of Economic Analysis (FRED)", url: "https://fred.stlouisfed.org/series/GDPALL06055" },
          { label: "Smith Travel Research data via Visit Napa Valley monthly reports", url: "https://www.visitnapavalley.com/" },
          { label: "Bureau of Labor Statistics", url: "https://www.bls.gov/" },
        ]}
      />
    </div>
  );
}

// ── CHART 2 — Demand vs. Rate, 2019 → 2025 (annual indexed) ────────
function ChartTwo() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const labels = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
    const demand = [100.0, 53.6, 82.8, 92.3, 90.9, 93.3, 95.6];
    const adr = [100.0, 78.5, 118.2, 137.9, 131.2, 127.7, 128.9];
    const baselinePlugin = {
      id: "ct2_baseline",
      afterDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.y) return;
        const y = scales.y.getPixelForValue(100);
        ctx.save();
        ctx.strokeStyle = T.gold;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(chartArea.left, y);
        ctx.lineTo(chartArea.right, y);
        ctx.stroke();
        ctx.restore();
      },
    };
    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Demand (rooms sold)",
            data: demand,
            borderColor: T.muted,
            backgroundColor: T.muted,
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: T.muted,
            fill: false,
            tension: 0.25,
          },
          {
            label: "ADR",
            data: adr,
            borderColor: T.accent,
            backgroundColor: T.accent,
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: T.accent,
            fill: false,
            tension: 0.25,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 12, boxHeight: 2, color: T.ink, font: { size: 12 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const idx = ctx.dataIndex;
                if (ctx.dataset.label === "Demand (rooms sold)") {
                  return `Demand index: ${demand[idx].toFixed(1)} (2019 = 100)`;
                }
                return `ADR index: ${adr[idx].toFixed(1)} (2019 = 100)`;
              },
            },
          },
        },
        scales: {
          x: { ticks: { color: T.muted, font: { size: 12 } }, grid: { color: T.rule } },
          y: {
            min: 0,
            max: 150,
            ticks: { stepSize: 50, color: T.muted, font: { size: 11 } },
            grid: { color: T.rule },
          },
        },
      },
      plugins: [baselinePlugin],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>{"Demand vs. Rate, 2019 → 2025"}</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, borderRadius: 4, padding: "20px 16px" }}>
        <div style={{ position: "relative", height: 280 }}>
          <canvas ref={canvasRef} id="chart-2" />
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-3_napa-lodging-pricing-2026_nvf.png", "Demand vs. rate, indexed to 2019 = 100")} />
      <Caption
        title="Demand and rate, indexed to 2019"
        description={"Across six years, ADR rose 29% while demand fell 4%. The two lines diverged in 2021 and have not reconverged."}
        sources={[
          { label: "Smith Travel Research data via Visit Napa Valley monthly reports", url: "https://www.visitnapavalley.com/" },
        ]}
      />
    </div>
  );
}

// ── CHART 2B — Monthly Pace to 2019, 2025 (vertical bar) ──────────
function ChartMonthlyPace() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const values = [87, 86, 94, 95, 99, 96, 99, 99, 96, 103, 98, 92];
    const colors = values.map(v => v >= 100 ? T.accent : T.muted);

    const baselineAndLabels = {
      id: "ct2b_baseline_labels",
      afterDatasetsDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales.y) return;

        // Reference line at y = 100
        const y = scales.y.getPixelForValue(100);
        ctx.save();
        ctx.strokeStyle = T.gold;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(chartArea.left, y);
        ctx.lineTo(chartArea.right, y);
        ctx.stroke();
        ctx.setLineDash([]);
        // Right-side label
        ctx.font = "11px 'Source Sans 3', sans-serif";
        ctx.fillStyle = T.gold;
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText("2019 baseline", chartArea.right - 4, y - 2);
        ctx.restore();

        // Bar value labels
        const meta = chart.getDatasetMeta(0);
        ctx.save();
        ctx.font = "11px 'Source Sans 3', sans-serif";
        ctx.fillStyle = T.ink;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        meta.data.forEach((bar, i) => {
          const v = values[i];
          ctx.fillText(String(v), bar.x, bar.y - 4);
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels: months,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderRadius: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y}% of 2019` } },
        },
        scales: {
          x: { ticks: { color: T.ink, font: { size: 12 } }, grid: { display: false } },
          y: {
            min: 80,
            max: 110,
            ticks: { stepSize: 10, color: T.muted, font: { size: 11 } },
            grid: { color: T.rule },
          },
        },
      },
      plugins: [baselineAndLabels],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>Monthly Pace to 2019, 2025</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, borderRadius: 4, padding: "20px 16px" }}>
        <div style={{ position: "relative", height: 280 }}>
          <canvas ref={canvasRef} id="chart-monthly-pace" />
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-4_napa-lodging-pricing-2026_nvf.png", "Napa County Lodging — Monthly Pace to 2019, 2025")} />
      <Caption
        title="Monthly pace to 2019"
        description={"Each bar shows 2025 demand as a share of 2019 demand for that month. Only October exceeded the 2019 baseline. January and February remained the weakest months."}
        sources={[
          { label: "Smith Travel Research, December 2025 YTD report (Visit Napa Valley)", url: "https://www.visitnapavalley.com/" },
        ]}
      />
    </div>
  );
}

// ── CHART 3 — Coastal Recovery Diverges (horizontal bar) ───────────
function ChartThree() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const data = [
      { label: "San Francisco", val: 13.8 },
      { label: "Sonoma", val: 7.0 },
      { label: "Monterey", val: 6.4 },
      { label: "San Luis Obispo", val: 5.4 },
      { label: "Santa Barbara", val: 4.0 },
      { label: "Napa", val: 1.8 },
    ];
    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.val),
          backgroundColor: data.map(d => d.label === "Napa" ? T.accent : T.muted),
          borderRadius: 3,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `+${ctx.parsed.x}%` } } },
        scales: {
          x: { beginAtZero: true, max: 16, ticks: { callback: (v) => v + "%", color: T.muted, font: { size: 12 } }, grid: { color: T.rule } },
          y: { ticks: { color: T.ink, font: { size: 13, weight: "bold" } }, grid: { display: false } },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>Coastal Recovery Diverges</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ position: "relative", height: 280 }}>
          <canvas ref={canvasRef} id="chart-3" />
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-6_napa-lodging-pricing-2026_nvf.png", "YTD-March 2026 occupancy growth — California coastal markets")} />
      <Caption
        title="Year-to-date March 2026 occupancy growth, California coastal markets"
        description={"Napa’s 1.8% trails every major peer, including Sonoma at 7.0% and San Francisco at 13.8%."}
        sources={[
          { label: "Smith Travel Research data via industry monthly reporting", url: "https://assets.simpleviewinc.com/simpleview/image/upload/v1/clients/napavalley/VNV_March_2026_STR_Data_b5019bb9-d1f1-44ae-a4f9-5c2c9ac8bd46.pdf" },
        ]}
      />
    </div>
  );
}

// ── CHART GDP — Nominal vs. Real GDP, Napa County, 2016–2024 ──────
function ChartGdp() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "line",
      data: {
        labels: GDP_YEARS.map(String),
        datasets: [
          {
            label: "Nominal GDP",
            data: GDP_NOMINAL,
            borderColor: "#2c5f8a",
            backgroundColor: "#2c5f8a",
            borderWidth: 2.5,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: "#2c5f8a",
            fill: false,
          },
          {
            label: "Real GDP (chained 2017$)",
            data: GDP_REAL,
            borderColor: "#4a6741",
            backgroundColor: "#4a6741",
            borderWidth: 2.5,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: "#4a6741",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: "bottom", labels: { color: T.ink, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              afterBody(items) {
                if (items.length < 2) return "";
                const nom = items.find((i) => i.datasetIndex === 0);
                const real = items.find((i) => i.datasetIndex === 1);
                if (nom && real) {
                  const gap = (nom.parsed.y - real.parsed.y).toFixed(2);
                  return `Inflation gap: $${gap}B`;
                }
                return "";
              },
            },
          },
        },
        scales: {
          y: {
            min: 9.5,
            max: 15.0,
            ticks: { callback: (v) => `$${v.toFixed(1)}B`, color: T.muted, font: { size: 11 } },
            grid: { color: T.rule },
          },
          x: {
            ticks: { color: T.muted, font: { size: 11 } },
            grid: { color: T.rule },
          },
        },
      },
      plugins: [gdpGapPlugin],
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>Nominal vs. Real GDP — Napa County, 2016–2024</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ position: "relative", height: 320 }}>
          <canvas ref={canvasRef} id="chart-gdp" />
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-2_napa-lodging-pricing-2026_nvf.png", "Nominal vs. Real GDP — Napa County, 2016–2024")} />
      <p style={{ fontFamily: font, fontSize: 13, color: T.muted, fontStyle: "italic", lineHeight: 1.55, margin: "14px 0 0", maxWidth: 680 }}>
        <strong style={{ fontWeight: 700, fontStyle: "italic" }}>Nominal vs. Real GDP — Napa County, 2016–2024.</strong>{" "}
        Nominal GDP (blue) vs. real GDP in chained 2017 dollars (green), with inflation gap shaded.{" "}
        Source: Bureau of Economic Analysis via FRED — <a href="https://fred.stlouisfed.org/series/GDPALL06055" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>GDPALL06055</a> (nominal),{" "}
        <a href="https://fred.stlouisfed.org/series/REALGDPALL06055" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>REALGDPALL06055</a> (real).{" "}
        Full analysis in <a href="/under-the-hood/napa-gdp-2024" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>{"“Under the Hood: Napa Valley’s Economy Looks Bigger Than It Is” (March 24, 2026)"}</a>.
      </p>
    </div>
  );
}

// ── CHART BLS — Napa MSA L&H Employment: Actual vs. Trendlines to 2035 ──
function ChartBlsTrendlines() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const toYear = (d) => {
      const [y, m] = d.split("-");
      return parseInt(y, 10) + (parseInt(m, 10) - 1) / 12;
    };

    const actualData = BLS_LH_TA.map((p) => ({ x: toYear(p.d), y: p.v }));

    const A09 = BLS_LH_TA.find((p) => p.d === "2009-09-01");
    const A19 = BLS_LH_TA.find((p) => p.d === "2019-06-01");
    const A25 = BLS_LH_TA.find((p) => p.d === "2025-06-01");
    const x09 = toYear(A09.d);
    const x19 = toYear(A19.d);
    const x25 = toYear(A25.d);
    const x35 = 2035 + 11 / 12;

    const slopeA = (A19.v - A09.v) / (x19 - x09);
    const slopeB = (A25.v - A19.v) / (x25 - x19);

    const yA_2035 = A09.v + slopeA * (x35 - x09);
    const yB_2035 = A19.v + slopeB * (x35 - x19);

    const projA = [
      { x: x09, y: A09.v },
      { x: x35, y: yA_2035 },
    ];
    const projB = [
      { x: x19, y: A19.v },
      { x: x35, y: yB_2035 },
    ];

    const fmt1 = (n) => n.toFixed(1);

    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type: "line",
      data: {
        datasets: [
          {
            label: "Actual employment (12-month trailing avg)",
            data: actualData,
            borderColor: "#5C3A21",
            backgroundColor: "#5C3A21",
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.1,
          },
          {
            label: "If 2009–2019 slope continued",
            data: projA,
            borderColor: "#4A7A5C",
            backgroundColor: "#4A7A5C",
            borderWidth: 2,
            borderDash: [8, 4],
            pointRadius: 0,
          },
          {
            label: "If 2019–2025 trend continues",
            data: projB,
            borderColor: "#A0522D",
            backgroundColor: "#A0522D",
            borderWidth: 2,
            borderDash: [8, 4],
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        parsing: false,
        plugins: {
          legend: { display: true, position: "bottom", labels: { color: T.ink, font: { size: 11 }, boxWidth: 24 } },
          tooltip: { enabled: true, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}k` } },
          annotation: {
            annotations: {
              p2009: { type: "point", xValue: x09, yValue: A09.v, backgroundColor: "#5C3A21", borderColor: "#5C3A21", radius: 4 },
              p2009label: {
                type: "label", xValue: x09, yValue: A09.v,
                content: `Sep 2009: ${fmt1(A09.v)}k`,
                font: { size: 10, family: "monospace", weight: "600" },
                color: T.ink, backgroundColor: "rgba(245,240,232,0.85)", padding: 3,
                xAdjust: 50, yAdjust: -16,
              },
              p2019: { type: "point", xValue: x19, yValue: A19.v, backgroundColor: "#5C3A21", borderColor: "#5C3A21", radius: 4 },
              p2019label: {
                type: "label", xValue: x19, yValue: A19.v,
                content: `Jun 2019: ${fmt1(A19.v)}k`,
                font: { size: 10, family: "monospace", weight: "600" },
                color: T.ink, backgroundColor: "rgba(245,240,232,0.85)", padding: 3,
                xAdjust: -10, yAdjust: -18,
              },
              p2025: { type: "point", xValue: x25, yValue: A25.v, backgroundColor: "#5C3A21", borderColor: "#5C3A21", radius: 4 },
              p2025label: {
                type: "label", xValue: x25, yValue: A25.v,
                content: `Jun 2025: ${fmt1(A25.v)}k`,
                font: { size: 10, family: "monospace", weight: "600" },
                color: T.ink, backgroundColor: "rgba(245,240,232,0.85)", padding: 3,
                xAdjust: 0, yAdjust: 18,
              },
              endA: {
                type: "label", xValue: x35, yValue: yA_2035,
                content: `2035 if 2009–2019 slope: ${fmt1(yA_2035)}k`,
                font: { size: 10, family: "monospace", weight: "600" },
                color: "#4A7A5C", backgroundColor: "rgba(245,240,232,0.85)", padding: 3,
                xAdjust: -90, yAdjust: -8,
              },
              endB: {
                type: "label", xValue: x35, yValue: yB_2035,
                content: `2035 if 2019–2025 trend: ${fmt1(yB_2035)}k`,
                font: { size: 10, family: "monospace", weight: "600" },
                color: "#A0522D", backgroundColor: "rgba(245,240,232,0.85)", padding: 3,
                xAdjust: -90, yAdjust: 14,
              },
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            min: 1990,
            max: 2036,
            ticks: {
              stepSize: 5,
              color: T.muted,
              font: { size: 11 },
              callback: (v) => (Number.isInteger(v) && v % 5 === 0 ? String(v) : null),
            },
            grid: { color: T.rule },
          },
          y: {
            min: 0,
            max: 25,
            ticks: { stepSize: 2.5, color: T.muted, font: { size: 11 }, callback: (v) => `${v}k` },
            grid: { color: T.rule },
            title: {
              display: true,
              text: "Employment (Thousands of Persons, 12-month trailing average)",
              color: T.muted,
              font: { size: 11 },
            },
          },
        },
      },
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, []);

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>Napa MSA Leisure & Hospitality Employment — Actual vs. Trendlines to 2035</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, padding: "20px 16px", borderRadius: 4 }}>
        <div style={{ position: "relative", height: 360 }}>
          <canvas ref={canvasRef} id="chart-bls-trendlines" />
        </div>
      </div>
      <DownloadButton onClick={() => downloadComponentPng(containerRef, "chart-5_napa-lodging-pricing-2026_nvf.png", "Napa MSA Leisure & Hospitality Employment — Actual vs. Trendlines to 2035")} />
      <p style={{ fontFamily: font, fontSize: 13, color: T.muted, fontStyle: "italic", lineHeight: 1.55, margin: "14px 0 0", maxWidth: 680 }}>
        <strong style={{ fontWeight: 700, fontStyle: "italic" }}>Napa MSA leisure and hospitality employment: 12-month trailing average vs. projected (2009–2035).</strong>{" "}
        The trailing average rose from roughly 8,900 in 2009 to 13,600 in mid-2019, a trend that implied roughly 21,500 jobs by 2035 if continued. Instead, the trailing average plateaued near 13,300 in 2025, leaving a substantial gap relative to that earlier trend.{" "}
        Source: BLS (<a href="https://fred.stlouisfed.org/series/NAPA906LEIHN" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>NAPA906LEIHN</a>), author’s analysis.
      </p>
    </div>
  );
}

// ── CHART 4 — Three-Surface Scenario Calculator (interactive) ──────
function ScenarioCalculator() {
  const containerRef = useRef(null);
  const [adr, setAdr] = useState(0);          // Δ ADR  −/+ 10
  const [vis, setVis] = useState(-5);         // Δ Visitors −/+ 20
  const BASE_REV_M = 352;                     // Q1 2026 revenue $88M annualized

  // If user hasn't moved sliders off the no-change scenario (0/0), force
  // a representative default (+5%/-5%) before capture, then restore. This
  // ensures the downloaded PNG always shows a meaningful scenario rather
  // than a flat zero-delta snapshot.
  const handleDownload = async () => {
    const wasZero = adr === 0 && vis === 0;
    const restoreAdr = adr;
    const restoreVis = vis;
    if (wasZero) {
      setAdr(5);
      setVis(-5);
      // Wait two animation frames so React commits + the DOM repaints
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
    await downloadComponentPng(
      containerRef,
      "chart-7_napa-lodging-pricing-2026_nvf.png",
      "Three-surface scenario calculator — Napa lodging, jobs and GDP impact"
    );
    if (wasZero) {
      setAdr(restoreAdr);
      setVis(restoreVis);
    }
  };

  const newRevM = BASE_REV_M * (1 + adr / 100) * (1 + vis / 100);
  const revDeltaM = newRevM - BASE_REV_M;
  const gdpImpactM = revDeltaM * 0.4;

  const fmtM = (m) => `${m >= 0 ? "+" : "−"}$${Math.abs(m).toFixed(1)}M`;
  const adrLabel = `${adr === 0 ? "0" : (adr > 0 ? "+" + adr : "−" + Math.abs(adr))}%`;
  const visLabel = `${vis === 0 ? "0" : (vis > 0 ? "+" + vis : "−" + Math.abs(vis))}%`;

  return (
    <div style={{ marginBottom: 48 }}>
      <h2 style={{ ...h2style, marginTop: 0, marginBottom: 16 }}>Three-Surface Scenario Calculator</h2>
      <div ref={containerRef} style={{ background: T.surface, border: `1px solid ${T.rule}`, borderRadius: 4, padding: 20 }}>
        <p style={{ fontFamily: font, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: T.gold, fontWeight: 700, marginBottom: 6 }}>Scenario Calculator</p>
        <h3 style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, color: T.ink, marginBottom: 12 }}>Adjust rate and visitors against Q1 2026 baselines</h3>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          <div style={{ flex: "1 1 260px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
              <span style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: T.ink }}>{"Δ ADR"}</span>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: T.accent, fontWeight: 700 }}>{adrLabel}</span>
            </div>
            <input type="range" min="-10" max="10" value={adr} step="1"
              onChange={(e) => setAdr(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: T.accent, cursor: "pointer" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 10, color: T.muted, marginTop: 2 }}>
              <span>{"−10%"}</span><span>0%</span><span>+10%</span>
            </div>
          </div>
          <div style={{ flex: "1 1 260px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
              <span style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: T.ink }}>{"Δ Visitors"}</span>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: T.accent, fontWeight: 700 }}>{visLabel}</span>
            </div>
            <input type="range" min="-20" max="20" value={vis} step="1"
              onChange={(e) => setVis(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: T.accent, cursor: "pointer" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 10, color: T.muted, marginTop: 2 }}>
              <span>{"−20%"}</span><span>0%</span><span>+20%</span>
            </div>
          </div>
        </div>

        <div className="impact-stats-grid">
          {/* Card 1 — Lodging revenue trajectory */}
          <div style={{ background: T.bg, borderRadius: 3, padding: 14, borderLeft: `3px solid ${T.gold}` }}>
            <div style={{ fontFamily: font, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Lodging revenue</div>
            <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink }}>${newRevM.toFixed(1)}M</div>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: revDeltaM >= 0 ? "#3F7A4D" : "#A33F3F", marginTop: 3 }}>
              ({fmtM(revDeltaM)} vs. base)
            </div>
            <div style={{ fontFamily: font, fontSize: 10, color: T.muted, marginTop: 4 }}>Base: $352M (Q1 2026 annualized)</div>
          </div>

          {/* Card 2 — Hospitality jobs (static historical, not slider-tied) */}
          <div style={{ background: T.bg, borderRadius: 3, padding: 14, borderLeft: `3px solid ${T.muted}` }}>
            <div style={{ fontFamily: font, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Hospitality jobs</div>
            <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink }}>{"−"}670</div>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: T.muted, marginTop: 3 }}>jobs since 2019</div>
            <div style={{ fontFamily: font, fontSize: 10, color: T.muted, marginTop: 4, fontStyle: "italic", lineHeight: 1.45 }}>
              Lodging revenue rose 23.2% and 382 rooms were added over the same period. The pre-2019 jobs-revenue relationship reversed; this card reflects observed history rather than a projection.
            </div>
          </div>

          {/* Card 3 — Approximate GDP impact */}
          <div style={{ background: T.bg, borderRadius: 3, padding: 14, borderLeft: `3px solid ${T.accent}` }}>
            <div style={{ fontFamily: font, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>GDP impact (indirect)</div>
            <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: T.ink }}>{fmtM(gdpImpactM)}</div>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: T.muted, marginTop: 3 }}>0.4{"×"} multiplier</div>
            <div style={{ fontFamily: font, fontSize: 10, color: T.muted, marginTop: 4 }}>Revenue delta {"×"} indirect multiplier</div>
          </div>
        </div>

        <p style={{ fontFamily: font, fontSize: 11, color: T.muted, fontStyle: "italic", lineHeight: 1.5, marginTop: 14, marginBottom: 0 }}>
          Directional estimates only {"—"} not a BEA or county economic forecast. Inputs model first-order changes against Q1 2026 baselines. Multiplier and per-room assumptions documented in source notes.
        </p>
      </div>
      <DownloadButton onClick={handleDownload} />
      <Caption
        title="Three-surface scenario calculator"
        description={"Adjust the rate and visitor sliders to model first-order changes to lodging revenue, hospitality jobs and indirect GDP impact. Asset base: Q1 2026 STR data."}
        sources={[
          { label: "Napa Valley Features analysis based on Smith Travel Research data, BLS, and BEA", url: null },
        ]}
      />
      <p style={{ fontFamily: font, fontSize: 11, color: T.muted, marginTop: 8 }}>
        Mobile users: scroll horizontally to view full chart. Download as PNG using the button below the chart.
      </p>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────
export default function UnderTheHoodNapaLodgingPricing() {
  const navigate = useNavigate();
  const status = useDraftGate(ARTICLE_SLUG);
  const isDraft = status === "draft";

  useEffect(() => {
    if (status === "redirect") navigate("/under-the-hood");
  }, [status, navigate]);

  if (status === "loading") {
    return (
      <div style={{ background: T.bg, minHeight: "100vh" }}>
        <NavBar />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 20px" }}>
          <p style={{ ...prose, color: T.muted }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      {isDraft && <DraftBanner />}
      <NavBar />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: isDraft ? "80px 20px 60px" : "60px 20px 60px" }}>

        {/* ── EYEBROW ───────────────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          {EYEBROW} {"·"} {ARTICLE_PUBLICATION}
        </p>

        {/* ── HEADLINE ──────────────────────────────────────────────── */}
        <h1 style={{ fontFamily: serif, fontSize: 34, fontWeight: 700, color: T.ink, lineHeight: 1.25, marginBottom: 16 }}>
          {ARTICLE_TITLE}
        </h1>

        {/* ── BYLINE + DATE ─────────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.muted, marginBottom: 16 }}>
          By Tim Carl {"·"} {ARTICLE_DATE}
        </p>

        {/* ── DECK ──────────────────────────────────────────────────── */}
        {SHOW_DECK && (
          <p style={{ fontFamily: serif, fontSize: 18, color: T.muted, lineHeight: 1.6, marginBottom: 24, fontStyle: "italic" }}>
            {ARTICLE_DECK}
          </p>
        )}

        {/* ── HERO ILLUSTRATION ─────────────────────────────────────── */}
        <figure style={{ margin: "24px 0 32px", textAlign: "center" }}>
          <img
            src="/UtH_April_26_VI.jpg"
            alt="Illustration: hotels stacked on the supply side of a tipping seesaw with three small visitors on the demand side, a bench beneath the fulcrum labeled JOBS"
            style={{ width: "100%", maxWidth: 720, height: "auto", display: "block", margin: "0 auto", border: `1px solid ${T.surface}`, borderRadius: 4 }}
          />
          <figcaption style={{ fontFamily: font, fontSize: 13, color: T.muted, fontStyle: "italic", marginTop: 8, lineHeight: 1.4 }}>
            Illustration by Features Graphic.
          </figcaption>
        </figure>

        {/* ── SUBSTACK LINK ─────────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 13, color: T.muted, marginBottom: 32, borderBottom: `1px solid ${T.border}`, paddingBottom: 20 }}>
          Read on{" "}
          <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>
            {ARTICLE_PUBLICATION} on Substack {"→"}
          </a>
        </p>

        {/* ── ARTICLE SUMMARY ───────────────────────────────────────── */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "16px 20px", marginBottom: 32 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Article Summary</p>
          <p style={{ ...prose, fontSize: 15, marginBottom: 0 }}>
            Data shows Napa County hotel revenue up year to date, but gains are driven more by higher rates than by a meaningful increase in room demand. Occupancy remains well below 2019 and Napa’s year-to-date occupancy growth is the slowest among major California regions, pointing to a recovery stalled on volume even as prices hold. Against that backdrop, downtown projects are under construction and approvals continue. The result is a market expanding on the supply side while demand lags.
          </p>
        </div>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* OPENING                                                      */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <p id="opening" style={{ ...prose, marginBottom: 18 }}>
          <span style={{ fontWeight: 700 }}>{DATELINE_LOCATION} {"—"}</span>{" "}Visit Napa Valley released its March 2026 lodging report this week, and the headline numbers tell a familiar story. Year-to-date through March, Napa County hotel revenue is up 5% over the same period in 2025. Occupancy is up. Average daily rate is up. RevPAR {"—"} the lodging industry’s preferred composite measure {"—"} is up 4.4%.
        </p>

        <p style={prose}>
          Read alone, those numbers describe a recovery in progress.
        </p>

        <p style={prose}>
          Read against the rest of the local data, they describe something different: a recovery whose engine is price, not visitors, and a pattern that two prior installments of this column have already begun to identify. In January 2026, this publication noted that Napa hotel revenue gains were being driven almost entirely by rate rather than volume. In March, when one month’s data showed occupancy and ADR declining together for the first time in the post-pandemic period, the column asked whether the lever could continue to carry the load. The March 2026 STR report does not answer that question. What it does is extend a record now visible on three different economic surfaces {"—"} gross domestic product, lodging revenue and hospitality jobs {"—"} and on each surface the same arithmetic is at work. Price is doing the work that volume is not.
        </p>

        <p style={prose}>
          Of every dollar of apparent growth in Napa County’s gross domestic product since 2016, roughly 87 cents was inflation. The remaining 13 cents was real output. The 87-cent figure is the one most likely to recur {"—"} and it is now recurring on a second surface, on a third, and increasingly visibly on a fourth: the supply of rooms and tasting capacity now in or moving through the pipeline.
        </p>

        {/* ── CHART 1 ─────────────────────────────────────────────── */}
        <ChartOne />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* A FORECAST THAT LANDED                                       */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 id="forecast" style={h2style}>A Forecast That Landed</h2>

        <p style={prose}>
          In <L href="https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between">{"“Napa Valley finds itself between a rock and a hard place” (October 3, 2023)"}</L>, this publication described a region caught between a luxury-positioning strategy and a structural decline in volume. In <L href="https://napavalleyfocus.substack.com/p/under-the-hood-napas-tasting-rooms">{"“Under the Hood: Napa’s Tasting Rooms Face a Numbers Problem” (July 5, 2025)"}</L>, the column ran the arithmetic of tasting rooms {"—"} what it would actually take to recover 2023 revenue at 2025 order values {"—"} and found the figures untenable. In <L href="https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled">{"“Under the Hood: More Rooms Has Equaled Fewer Jobs in Napa County” (August 23, 2025)"}</L>, the column documented what had happened to hospitality employment since 2019: room counts up, jobs down. In <L href="https://napavalleyfocus.substack.com/p/under-the-hood-price-continues-to">{"“Under the Hood: Price Continues to Carry Napa Hotel Market as Room-Night Demand Lags” (January 9, 2026)"}</L>, the column showed the same pattern in the lodging revenue line: rate up, demand sluggish. In <L href="https://napavalleyfocus.substack.com/p/when-room-price-can-no-longer-carry">{"“Under the Hood: When Room Price Can No Longer Carry the Load” (March 12, 2026)"}</L>, the column noted the first simultaneous decline in both occupancy and ADR since the pandemic. Two weeks later, in <L href="/under-the-hood/napa-gdp-2024">{"“Under the Hood: Napa Valley’s Economy Looks Bigger Than It Is” (March 24, 2026)"}</L>, the column ran the GDP arithmetic. Nominal county output had risen 35.8% since 2016. Real output had risen 4.6%. The remainder was the price level adjusting upward.
        </p>

        <p style={prose}>
          Six pieces, two and a half years, one observation: the headline numbers describing Napa’s economy are mostly about price. The volume underneath them has not moved much.
        </p>

        <p style={prose}>
          What changed in April 2026 is that another quarter’s lodging data became available and confirmed the pattern is still operating {"—"} alongside an active hotel pipeline that, on paper, could substantially expand supply over the next several years.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* THE THREE SURFACES                                           */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 id="three-surfaces" style={h2style}>The Three Surfaces</h2>

        <p style={prose}>
          <strong>Surface one: gross domestic product.</strong> Napa County’s nominal GDP rose from $10.75 billion in 2016 to $14.59 billion in 2024, an apparent gain of $3.84 billion. Adjusted for inflation, the same economy grew 4.6% {"—"} a real increase of roughly $500 million. The gap, about $3.34 billion or 87% of the apparent growth, was the price level adjusting upward. The county’s deflator rose 29% since 2017. A worker earning the county’s 2022 average wage of $67,518 needs roughly $87,000 today to maintain equivalent purchasing power. From the county’s perspective, nominal revenues, sales tax receipts and transient occupancy collections look stable. From a worker’s perspective, the same dollars buy substantially less. Both are true simultaneously.
        </p>

        {/* ── CHART GDP (nominal vs. real GDP) ────────────────────── */}
        <ChartGdp />

        <p style={prose}>
          <strong>Surface two: lodging revenue.</strong> Through March 2026, Napa County hotels sold 258,248 room-nights, an increase of 2.3% over the same period last year. Total revenue rose 5% to $88.0 million. Average daily rate rose 2.6%. Supply expanded 0.5%. Revenue per available room rose 4.4%, and most of that increase reflects what hotels charged rather than how many rooms they sold. Earlier installments in this series demonstrated the same pattern at the annual level: in 2025, hotel revenue exceeded recent years even though demand was below pre-pandemic baselines. The Q1 2026 figures continue that trajectory. Napa County’s YTD occupancy at 54.4% remains roughly 17 percentage points below the 71.1% recorded in 2019.
        </p>

        <h3 style={{ fontFamily: serif, fontSize: 19, fontWeight: 700, color: T.ink, marginTop: 28, marginBottom: 14 }}>The Best Year Since 2019 Was Still Below 2019</h3>

        <p style={prose}>
          The most recent year on the books was also the strongest since the pandemic. Napa County hotels sold 1,253,064 room-nights in 2025, the highest annual demand since 2019 and a 2.5% gain over 2024. Occupancy reached 64.6%, a six-year high. ADR climbed to $422.52, a six-year high. Revenue reached $529.4 million, a six-year high. And demand still finished 4.4% below 2019, against supply that has grown 5.2% over the same period. The strongest year of the recovery did not return the county to where it started. It returned the county to 95.6% of where it started, with rates 29% higher.
        </p>

        <p style={prose}>
          The shape of that gap is seasonal. Through 2025, only one month {"—"} October {"—"} exceeded its 2019 demand baseline, at 103%. Five months landed within four points of 2019. The recovery is concentrated in fall and softens at the shoulders. January and February closed the year at 87% and 86% of 2019, the deepest gap in any month. Spring sits in between. The pattern is consistent with what high-end leisure travel markets have shown across coastal California: peak season is intact, off-season is not.
        </p>

        {/* ── CHART 3 — annual demand vs. rate ─────────────────────── */}
        <ChartTwo />

        {/* ── CHART 4 — monthly pace ─────────────────────────────── */}
        <ChartMonthlyPace />

        <p style={prose}>
          <strong>Surface three: hospitality employment.</strong> Between 2019 and 2025, Napa County added approximately 382 hotel rooms {"—"} a 7.6% increase in lodging supply. During the same period, the leisure and hospitality sector lost approximately 200 jobs, and the restaurant and bar subsector lost approximately 470 jobs. The combined figure is 670 jobs subtracted from the visitor economy while 382 rooms were added to it. From 2009 through 2019, more rooms in Napa County had reliably meant more jobs. Since 2019, that relationship has reversed. Larger resorts operate with leaner per-guest staffing. On-property dining, retail and tasting capture spending that previously circulated to independent operators. Higher per-room revenue can coexist with {"—"} and contribute to {"—"} fewer per-room jobs.
        </p>

        {/* ── CHART BLS TRENDLINES (actual vs. projected to 2035) ── */}
        <ChartBlsTrendlines />

        <p style={prose}>
          Three surfaces. One arithmetic.
        </p>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* WHAT'S DIFFERENT IN 2026                                     */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 id="whats-different" style={h2style}>{"What’s Different in 2026"}</h2>

        <p style={prose}>
          The March 2026 STR report contains a more positive single-month line. Napa County’s March-only occupancy was up 1.2%, ADR up 4.9% and RevPAR up 6.2%. Visit Napa Valley’s commentary attributed coastal-region strength to a March heatwave. The single-month bounce is real. The contextual problem is harder.
        </p>

        <p style={prose}>
          Year-to-date through March, Napa County’s occupancy growth of 1.8% is the smallest of any major coastal California market. San Francisco’s YTD occupancy is up 13.8%. Sonoma is up 7.0%. Monterey is up 6.4%. San Luis Obispo is up 5.4%. Santa Barbara is up 4.0%. The competitive set is recovering on visitors. Napa is recovering on price. A 12-percentage-point gap between gateway-market occupancy growth and Napa County occupancy growth in the same quarter does not resolve as a one-month weather story.
        </p>

        {/* ── CHART 6 — coastal markets comparison ───────────────── */}
        <ChartThree />

        <p style={prose}>
          What is unambiguously new in 2026 is the supply side. <L href="https://www.sfchronicle.com/bayarea/article/napa-downtown-hotel-room-22208332.php">On April 19, the San Francisco Chronicle reported</L> that the city of Napa alone has roughly 627 existing hotel rooms downtown, 116 currently under construction and 513 additional rooms entitled {"—"} a pipeline that, on paper, could push downtown alone past 1,200 rooms. Countywide inventory could grow from approximately 5,500 rooms today to roughly 6,350 by 2030. Some of those entitled projects have languished for years; not all will clear financing. But the direction is clear: more rooms are being approved into a market whose YTD occupancy is the lowest in coastal California.
        </p>

        <p style={prose}>
          <L href="https://www.cityofnapa.org/m/newsflash/Home/Detail/908">City of Napa figures attached to the largest of those projects</L> {"—"} the 161-room First Street Phase II hotel and 78-unit residential condominium development on the former Kohl’s site, which broke ground in late 2025 and is projected to open in 2027 {"—"} anticipate roughly 177 daily full-time-equivalent jobs and approximately $5.2 million in annual transient occupancy tax revenue during the first five years of operation. The fiscal case to the city is straightforward and substantial. Whether the regional jobs ratio holds is a different question. <L href="https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled">The August 2025 analysis in this series</L> found that the rooms-to-jobs relationship reversed after 2019, and the most recent monthly employment data has not yet shown that reversal correcting.
        </p>

        <p style={prose}>
          The on-record industry view differs sharply. <L href="https://www.sfchronicle.com/bayarea/article/napa-downtown-hotel-room-22208332.php">Linsey Gallagher, president and CEO of Visit Napa Valley, told the Chronicle</L> that Napa Valley’s limited supply makes it {"“"}a boutique but high-impact{"”"} destination, and that the region can take on more lodging without oversaturation. <L href="https://www.sfchronicle.com/bayarea/article/napa-downtown-hotel-room-22208332.php">Napa Mayor Scott Sedgley, walking through the construction-active downtown corridor, told the Chronicle</L> that {"“"}just like grapes, a town will shrivel up if you don’t harvest what you have.{"”"}
        </p>

        <p style={prose}>
          The most concrete recent statement of the price strategy, however, is the renovation that reopened on April 20. Robert Mondavi Winery, owned by Constellation Brands, returned to public visitation this week after a three-year closure and a renovation that <L href="https://www.sfchronicle.com/food/wine/article/robert-mondavi-winery-california-22198118.php">San Francisco Chronicle wine reporter Jess Lander described</L> as {"“"}the most exhaustive, expensive and beautiful transformation Wine Country has ever seen.{"”"} Lander reported that the entry-level tasting fee rose from $45 to $60, a 33% increase. The food and wine offering runs $95. The full tour and tasting runs $150. Mondavi’s parent company has, over the past two years, sold off Woodbridge and most of its lower-priced wine brands and laid off more than 200 workers at a major production facility. The reopening of Mondavi at higher price points, into a county where YTD occupancy is the slowest-growing on the coast, is the price strategy made physical.
        </p>

        <p style={prose}>
          A second outside-the-publication confirmation arrived this week {"—"} and from the trade itself. <L href="https://www.forbes.com/sites/noelburgess/2026/04/24/downtown-napa-wine-tasting-without-reservations-is-changing-napa/">In Forbes, Noel Burgess described</L> downtown Napa’s tasting-room model as a structural shift toward walkable, no-reservation, lower-cost formats. <L href="https://www.pressdemocrat.com/2026/04/15/napa-county-winery-vineyard-land-use-policy/">The North Bay Business Journal reported the same week</L> that one of the 23 immediate reforms in <L href="https://www.pressdemocrat.com/2026/04/15/napa-county-winery-vineyard-land-use-policy/">the four-trade-group petition filed with the Napa County Board of Supervisors on April 14</L> is a request to modify the county’s {"“"}by appointment only{"”"} signage requirement, allowing winery tasting rooms to welcome walk-in visitors. <L href="https://www.pressdemocrat.com/2026/04/15/napa-county-winery-vineyard-land-use-policy/">Michelle Novi, counsel and senior director of industry relations at Napa Valley Vintners, told the Press Democrat</L> the change reflected a practical adjustment to match visitor expectations with current operations. {"“"}It’s not 1990 anymore, and what served us then may not still entirely serve us now,{"”"} she said. The 1990 framework was built when visitor demand outpaced capacity. Today’s framework adjustment is being requested for the opposite reason. The appointment-only model was a feature of the high-rate luxury strategy. Letting it go is the trade itself acknowledging the strategy now has a ceiling.
        </p>

        <p style={prose}>
          Industry data published this month by Terrain, the research division of American AgCredit, reaches a similar conclusion. The report notes that direct-to-consumer bottle prices rose 11% in 2025 alone and are now 40% higher than in 2019, against a 26% rise in the consumer price index. The report’s author observes that {"“"}tasting room fees and wine country travel costs have also risen sharply in the 2020s,{"”"} and concludes that the experience {"“"}has become more exclusive and may be out of reach for less affluent consumers and young adults.{"”"} The Winescape report comes from inside the agricultural-finance establishment. It describes the same arithmetic this column has been describing since 2023.
        </p>

        <p style={prose}>
          The supply pipeline is committed to more rooms, more capacity, and higher price points. The data shows that none of those choices is closing the gap between Napa and its peers on the metric most directly tied to visitors: occupancy growth.
        </p>

        {/* ── CHART 4 ─────────────────────────────────────────────── */}
        <ScenarioCalculator />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* WHAT TO WATCH                                                */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <h2 id="what-to-watch" style={h2style}>What to Watch</h2>

        <p style={prose}>
          Five tests in the next ninety days will indicate whether the pattern is bending or extending.
        </p>

        <p style={prose}>
          <strong>The Inn at the Abbey approval.</strong> On April 28, <L href="https://napa.legistar.com/LegislationDetail.aspx?ID=7991995&GUID=1347882E-CF19-46F6-B74B-0B3B88630C13&FullText=1">the Napa County Board of Supervisors approved</L> Jackson Family Investments III, LLC’s proposed 79-room hotel complex along Lodi Lane and Highway 29 just north of St. Helena, certifying the Final Environmental Impact Report and adopting CEQA findings. The approval authorizes demolition of existing structures and 78,500 square feet of new construction across six parcels totaling 15.13 acres. <L href="https://napa.legistar.com/View.ashx?M=F&ID=15410707&GUID=9D28317D-C725-4EF5-98E0-A508DF952124">Three substantive commitments are layered into the Development Agreement</L>: five new off-site affordable housing units in Napa County in lieu of housing fees, a $250,000 contribution to county fuel-reduction efforts paid over five years and a sustainability and groundwater-monitoring package including evapotranspiration sensors shared with the Napa County Groundwater Sustainability Agency, a public-facing air quality monitor and minimum LEED Gold construction. The Planning Commission had earlier issued a unanimous 4{"–"}0 advisory recommendation. Staff had identified a Reduced Development Alternative {"—"} a 63-room version, roughly 20% smaller {"—"} as environmentally superior; the Board approved the larger configuration. The vote ratifies the supply-expansion direction this article describes: a luxury resort at full proposed scale, moving forward into a market whose YTD occupancy growth is the slowest among major California coastal destinations.
        </p>

        <p style={prose}>
          <strong>The April{"–"}June STR sequence.</strong> A single warm month does not establish a trajectory. Q2 data will show whether the YTD recovery is rate-dependent or whether visitor counts begin to close the gap with coastal comps.
        </p>

        <p style={prose}>
          <strong>Tasting room order values.</strong> Terrain’s industry report shows tasting room average order value flat in 2025 and revenue per visitor flat. The 2026 first-half data will indicate whether downtown and estate operators are capturing recovered spending {"—"} or whether <L href="https://napavalleyfocus.substack.com/p/under-the-hood-napas-tasting-rooms">the price ceiling described in the July 2025 piece</L> is now binding at a lower level.
        </p>

        <p style={prose}>
          <strong>Hospitality employment.</strong> The Bureau of Labor Statistics’ Napa County leisure and hospitality series will tell the third surface’s story month-by-month through the spring. A continued widening of the rooms-added-to-jobs-lost gap would confirm the inversion is durable rather than cyclical, including as the First Street Phase II project moves toward its 2027 opening.
        </p>

        <p style={prose}>
          <strong>The May 9 follow-up.</strong> This piece is the fourth installment of an April{"–"}May series. The next installment will examine the structural arithmetic of the marketing infrastructure that underwrote the strategy whose limits this piece describes {"—"} Napa Valley Vintners’ tax filings, Visit Napa Valley’s transient occupancy tax budget, and the disproportion between Napa’s share of California wine licenses and California wine production.
        </p>

        <p style={prose}>
          Eighty-seven cents of every dollar of apparent growth has been price. The remaining thirteen cents has been the part of the economy that creates jobs, supports tax bases and circulates back to local operators. That ratio held through a decade of nominal expansion. Where it settles next, with more than 500 entitled rooms still moving through the city of Napa pipeline alone, will determine whether the next decade looks like the last one {"—"} or doesn’t.
        </p>

        {/* ── BYLINE (italic) ─────────────────────────────────────── */}
        <p style={{ fontFamily: font, fontSize: 15, color: T.ink, fontStyle: "italic", lineHeight: 1.65, margin: "32px 0 0 0" }}>
          Tim Carl is a Napa Valley{"–"}based photojournalist and the founder and editor of Napa Valley Features, Sonoma County Features and Lake County Features.
        </p>

        {/* ── POLLS SECTION (per spec ordering: directly after byline) ── */}
        <PollsSection slug={ARTICLE_SLUG} />

        {/* ── RELATED COVERAGE ────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 48, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", marginBottom: 20 }}>
            Related Coverage
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/when-room-price-can-no-longer-carry" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}When Room Price Can No Longer Carry the Load{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (March 12, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-economy" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa Valley’s Economy Looks Bigger Than It Is{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (March 24, 2026)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: More Rooms Has Equaled Fewer Jobs in Napa County{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (August 23, 2025)</span>
            </li>
            <li style={{ marginBottom: 14, fontFamily: serif, fontSize: 18, lineHeight: 1.4 }}>
              <a href="https://napavalleyfocus.substack.com/p/under-the-hood-napas-tasting-rooms" target="_blank" rel="noopener noreferrer" style={{ color: T.ink, textDecoration: "none", fontWeight: 700 }}>{"“"}Under the Hood: Napa’s Tasting Rooms Face a Numbers Problem{"”"}</a>
              <span style={{ fontFamily: font, fontSize: 14, color: T.muted, fontWeight: 400 }}> {"—"} Napa Valley Features (July 5, 2025)</span>
            </li>
          </ul>
        </div>

        {/* ── ARCHIVE SEARCH ──────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 28, paddingTop: 28, marginBottom: 28 }}>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Archive
          </p>
          <h2 style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: T.ink, margin: "0 0 8px 0" }}>Search the Archive</h2>
          <p style={{ fontFamily: font, fontSize: 15, color: T.muted, marginBottom: 16 }}>
            Search 1,000+ articles and reports from {ARTICLE_PUBLICATION}.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              placeholder="Search lodging, hotels, occupancy, hospitality jobs..."
              style={{ flex: 1, padding: "10px 14px", fontFamily: font, fontSize: 15, color: T.ink, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 3, outline: "none" }}
              onKeyDown={(e) => { if (e.key === "Enter" && e.target.value.trim()) { window.location.href = `/archive?q=${encodeURIComponent(e.target.value.trim())}`; } }}
            />
            <button
              onClick={(e) => { const input = e.currentTarget.previousElementSibling; if (input.value.trim()) { window.location.href = `/archive?q=${encodeURIComponent(input.value.trim())}`; } }}
              style={{ padding: "10px 20px", fontFamily: font, fontSize: 15, fontWeight: 600, color: "#FFFFFF", background: T.accent, border: "none", borderRadius: 3, cursor: "pointer" }}
            >
              Search
            </button>
          </div>
        </div>

        {/* ── METHODOLOGY ─────────────────────────────────────────── */}
        <div style={{ borderTop: `2px solid ${T.border}`, paddingTop: 28, marginTop: 40 }}>
          <h3 style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>Methodology</h3>
          <p style={{ fontFamily: font, fontSize: 14, color: T.muted, lineHeight: 1.7, fontStyle: "italic" }}>
            Lodging figures cited in this article come from Visit Napa Valley’s monthly STR report (March 2026) and from the underlying Smith Travel Research data. Year-to-date occupancy and rate figures refer to January{"–"}March 2026 unless otherwise specified; full-calendar-year figures (such as the 2025 county occupancy of approximately 65% reported by the San Francisco Chronicle, or the 2023 county occupancy of 61.5% reported in this column’s prior coverage) reflect different measurement windows and are not directly comparable to YTD-March numbers.
          </p>
          <p style={{ fontFamily: font, fontSize: 14, color: T.muted, lineHeight: 1.7, fontStyle: "italic", marginTop: 10 }}>
            The March 2026 VNV report’s published 2025 YTD ADR of $322.24 reconciles only as $332.30 against the report’s own 2025 revenue of $83,842,456 and demand of 252,355 rooms sold; the published 2.6% YOY ADR change ties to the corrected $332.30 figure.
          </p>
          <p style={{ fontFamily: font, fontSize: 14, color: T.muted, lineHeight: 1.7, fontStyle: "italic", marginTop: 10 }}>
            GDP figures reflect Bureau of Economic Analysis series GDPALL06055 (nominal) and REALGDPALL06055 (real, in chained 2017 dollars), retrieved via the Federal Reserve Bank of St. Louis FRED database. Employment figures reflect Bureau of Labor Statistics series NAPA906LEIHN (Napa County leisure and hospitality) and SMU06349007072200001SA (food services and drinking places). The Forbes summary in Section 4 paraphrases reporting by Noel Burgess; the underlying article was behind a payment wall at the time of writing and only the publicly available summary was used.
          </p>
        </div>

        {/* ── SOURCES ─────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 40, paddingTop: 24 }}>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, color: T.ink, marginBottom: 16 }}>Sources</h2>
          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px 0" }}>NVF prior coverage</p>
          <ol style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.75, paddingLeft: 20, marginBottom: 18 }}>
            <li style={{ marginBottom: 8 }}>
              Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/napa-valley-finds-itself-between" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Napa Valley Finds Itself Between a Rock and a Hard Place</a>,{"”"} Napa Valley Features, October 3, 2023.
            </li>
            <li style={{ marginBottom: 8 }}>
              Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-napas-tasting-rooms" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: Napa’s Tasting Rooms Face a Numbers Problem</a>,{"”"} Napa Valley Features, July 5, 2025.
            </li>
            <li style={{ marginBottom: 8 }}>
              Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-more-rooms-has-equaled" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: More Rooms Has Equaled Fewer Jobs in Napa County</a>,{"”"} Napa Valley Features, August 23, 2025.
            </li>
            <li style={{ marginBottom: 8 }}>
              Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-price-continues-to" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: Price Continues to Carry Napa Hotel Market</a>,{"”"} Napa Valley Features, January 9, 2026.
            </li>
            <li style={{ marginBottom: 8 }}>
              Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/when-room-price-can-no-longer-carry" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>When Room Price Can No Longer Carry the Load</a>,{"”"} Napa Valley Features, March 12, 2026.
            </li>
            <li style={{ marginBottom: 8 }}>
              Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-napa-valleys-economy" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: Napa Valley’s Economy Looks Bigger Than It Is</a>,{"”"} Napa Valley Features, March 24, 2026.
            </li>
            <li style={{ marginBottom: 8 }}>
              Tim Carl, {"“"}<a href="https://napavalleyfocus.substack.com/p/under-the-hood-the-reset-spreads" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Under the Hood: The Reset Spreads</a>,{"”"} Napa Valley Features, April 4, 2026.
            </li>
          </ol>

          <p style={{ fontFamily: font, fontSize: 13, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px 0" }}>External</p>
          <ol start="8" style={{ fontFamily: font, fontSize: 14, color: T.ink, lineHeight: 1.75, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}>
              Visit Napa Valley, {"“"}<a href="https://assets.simpleviewinc.com/simpleview/image/upload/v1/clients/napavalley/VNV_March_2026_STR_Data_b5019bb9-d1f1-44ae-a4f9-5c2c9ac8bd46.pdf" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>March 2026 STR Data</a>{"”"} (PDF).
            </li>
            <li style={{ marginBottom: 8 }}>
              Julie Johnson, {"“"}<a href="https://www.sfchronicle.com/bayarea/article/napa-downtown-hotel-room-22208332.php" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Is a hotel room boom about to reshape one of the Bay Area’s most expensive destinations?</a>{"”"} San Francisco Chronicle, April 19, 2026.
            </li>
            <li style={{ marginBottom: 8 }}>
              Jess Lander, {"“"}<a href="https://www.sfchronicle.com/food/wine/article/robert-mondavi-winery-california-22198118.php" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Robert Mondavi has set the bar for all future winery renovations</a>,{"”"} San Francisco Chronicle, April 23, 2026.
            </li>
            <li style={{ marginBottom: 8 }}>
              Angela Woodall, {"“"}<a href="https://patch.com/california/napavalley/inn-abbey-jackson-family-79-room-hotel-complex-tests-napa-limits" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Inn At Abbey Jackson Family 79-Room Hotel Complex Tests Napa Limits</a>,{"”"} Patch, April 24, 2026.
            </li>
            <li style={{ marginBottom: 8 }}>
              Noel Burgess, {"“"}<a href="https://www.forbes.com/sites/noelburgess/2026/04/24/downtown-napa-wine-tasting-without-reservations-is-changing-napa/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Downtown Napa Wine Tasting Without Reservations Is Changing Napa</a>,{"”"} Forbes, April 24, 2026.
            </li>
            <li style={{ marginBottom: 8 }}>
              Jeff Quackenbush, {"“"}<a href="https://www.pressdemocrat.com/2026/04/15/napa-county-winery-vineyard-land-use-policy/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Wine groups ask Napa County for two dozen reforms to help industry survive</a>,{"”"} Press Democrat {"·"} North Bay Business Journal, April 15, 2026.
            </li>
            <li style={{ marginBottom: 8 }}>
              City of Napa, {"“"}<a href="https://www.cityofnapa.org/m/newsflash/Home/Detail/908" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>First Street Kohl’s Redevelopment notice</a>,{"”"} January 6, 2026.
            </li>
            <li style={{ marginBottom: 8 }}>
              Napa County Legistar File #26-215, {"“"}<a href="https://napa.legistar.com/LegislationDetail.aspx?ID=7991995&GUID=1347882E-CF19-46F6-B74B-0B3B88630C13&FullText=1" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Inn at the Abbey Use Permit Modification</a>,{"”"} April 28, 2026.
            </li>
            <li style={{ marginBottom: 8 }}>
              Napa County, {"“"}<a href="https://napa.legistar.com/View.ashx?M=F&ID=15410707&GUID=9D28317D-C725-4EF5-98E0-A508DF952124" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>Attachment D {"—"} Recommended Conditions of Approval, P19-00038-MOD</a>{"”"} (April 28, 2026 hearing).
            </li>
            <li style={{ marginBottom: 8 }}>
              Terrain {"·"} American AgCredit, {"“"}Winescape Spring 2026.{"”"}
            </li>
            <li style={{ marginBottom: 8 }}>
              Bureau of Economic Analysis via FRED {"—"} <a href="https://fred.stlouisfed.org/series/GDPALL06055" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>GDPALL06055</a>, <a href="https://fred.stlouisfed.org/series/REALGDPALL06055" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>REALGDPALL06055</a>.
            </li>
            <li style={{ marginBottom: 8 }}>
              Bureau of Labor Statistics {"—"} <a href="https://www.bls.gov/" target="_blank" rel="noopener noreferrer" style={{ color: T.accent }}>NAPA906LEIHN, SMU06349007072200001SA</a>.
            </li>
          </ol>
        </div>

      </div>

      <Footer />
    </div>
  );
}
