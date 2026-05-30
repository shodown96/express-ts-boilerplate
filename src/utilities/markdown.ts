import { Response } from 'express';
import { marked } from 'marked';
import fs from 'fs';
import path from 'path';

export function renderMarkdownFile(res: Response, filename: string): void {
  const mdPath = path.resolve(process.cwd(), filename);
  const raw = fs.readFileSync(mdPath, 'utf-8');
  const baseUrl = process.env.BASE_API_ENDPOINT ?? `http://localhost:${process.env.PORT ?? 4000}`;
  const interpolated = raw.replace(/\{\{BASE_URL\}\}/g, baseUrl);
  const title = filename.replace('.md', '');
  renderMarkdownString(res, interpolated, title);
}

export function renderMarkdownString(res: Response, md: string, title: string): void {
  const body = marked(md) as string;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem; color: #1a1a1a; line-height: 1.65; }
    h1 { border-bottom: 2px solid #e5e7eb; padding-bottom: .5rem; }
    h2 { margin-top: 2.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: .35rem; }
    h3 { margin-top: 2rem; }
    pre { background: #f3f4f6; border-radius: 6px; padding: 1rem; overflow-x: auto; }
    code { background: #f3f4f6; border-radius: 4px; padding: .15em .4em; font-size: .9em; }
    pre code { background: none; padding: 0; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #d1d5db; padding: .5rem .75rem; text-align: left; }
    th { background: #f9fafb; }
    blockquote { border-left: 4px solid #3b82f6; margin: 1rem 0; padding: .5rem 1rem; background: #eff6ff; border-radius: 0 6px 6px 0; }
    a { color: #2563eb; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
  </style>
</head>
<body>${body}</body>
</html>`);
}
