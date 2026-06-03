import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import React from "react";
import { renderToString } from "react-dom/server";
import { Route, Routes, StaticRouter } from "react-router";

import { renderHeadTags } from "../src/seo/renderHead";
import { staticRoutes } from "../src/seo/staticRoutes.prerender";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(projectRoot, "dist");
const templatePath = path.join(distDir, "index.html");

function stripManagedHeadTags(html: string) {
  return html
    .replace(/\s*<title>[\s\S]*?<\/title>\s*/i, "\n")
    .replace(
      /\s*<meta\s+(?:name|property)=["'](?:description|robots|og:title|og:description|og:type|og:url|og:site_name|og:image|twitter:card|twitter:title|twitter:description|twitter:image)["'][^>]*>\s*/gi,
      "\n",
    )
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<link\s+rel=["'](?:icon|apple-touch-icon|manifest)["'][^>]*>\s*/gi, "\n")
    .replace(/\s*<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>\s*/gi, "\n");
}

function renderRoute(pathname: string) {
  return renderToString(
    <StaticRouter location={pathname}>
      <Routes>
        {staticRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </StaticRouter>,
  );
}

function injectIntoTemplate(template: string, route: (typeof staticRoutes)[number]) {
  const appHtml = renderRoute(route.path);
  const headTags = renderHeadTags({
    canonicalPath: route.path,
    description: route.description,
    jsonLd: route.jsonLd,
    ogDescription: route.ogDescription,
    ogImage: route.ogImage,
    ogTitle: route.ogTitle,
    ogType: route.ogType,
    robots: route.robots,
    title: route.title,
    twitterCard: route.twitterCard,
  });

  return stripManagedHeadTags(template)
    .replace("</head>", `    ${headTags}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
}

async function prerender() {
  const template = await fs.readFile(templatePath, "utf8");

  await Promise.all(
    staticRoutes.map(async (route) => {
      const html = injectIntoTemplate(template, route);
      const outputFile = path.join(distDir, route.outputPath);

      await fs.mkdir(path.dirname(outputFile), { recursive: true });
      await fs.writeFile(outputFile, html, "utf8");
    }),
  );

  console.log(`Prerendered ${staticRoutes.length} public marketing routes.`);
}

await prerender();
