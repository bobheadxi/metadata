import { DateTime } from 'luxon';
import { maybeJSONLD } from './jsonld';

export type Metadata = {
  url: string;
  title: string;
  author?: string;
  description?: string;
  publisher?: string;
  published?: DateTime;
};

export function parseMeta(doc: Document): Metadata {
  const jsonld = maybeJSONLD(doc);

  // get a better canonical title if possible
  const title =
    doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
    doc.head.title ||
    jsonld?.get('headline');

  // get a better canonical URL if available
  const url =
    doc.querySelector('meta[property="og:url"]')?.getAttribute('content') ||
    doc.querySelector('link[rel="canonical"]')?.getAttribute('href');

  // refer to https://sourcegraph.com/github.com/microlinkhq/metascraper/-/tree/packages when in doubt
  const meta: Metadata = {
    url,
    title: title?.trim(),

    description:
      (
        doc.querySelector('meta[property="og:description"]') ||
        doc.querySelector('meta[name="description"]')
      )?.getAttribute('content') || jsonld?.get('description'),

    author:
      (
        doc.querySelector('meta[property="og:author"]') ||
        doc.querySelector('meta[name="author"]')
      )?.getAttribute('content') ||
      jsonld?.get('author.name') ||
      maybeTitleHasAuthor(title),

    publisher:
      doc
        .querySelector('meta[property="og:site_name"]')
        ?.getAttribute('content') ||
      jsonld?.get('isPartOf.name') ||
      maybeRSSHasPublisher(doc) ||
      url
        ? new URL(url).hostname
        : undefined,

    published: maybeDate(
      doc
        .querySelector('meta[property="article:published_time"]')
        ?.getAttribute('content') || jsonld?.get('datePublished')
    ),
  };

  return meta;
}

function maybeRSSHasPublisher(doc: Document) {
  const rss =
    doc.querySelector('link[type="application/rss+xml"]') ||
    doc.querySelector('link[type="application/atom+xml"]');
  if (!rss) return null;

  const rssTitle = rss.getAttribute('title');
  if (rssTitle && !rssTitle.toLowerCase().includes('rss')) {
    return rssTitle;
  }

  // try URL instead
  try {
    return new URL(rss.getAttribute('href')).hostname;
  } catch (err) {
    return null;
  }
}

function maybeTitleHasAuthor(title: string) {
  const by = title.split('by ', 2);
  if (by.length < 2) return null;
  return by.pop().split(/ [|\-*]/g)[0];
}

function maybeDate(datestring: string): DateTime | null {
  if (!datestring) return null;
  for (let parseFunc of [DateTime.fromISO, DateTime.fromHTTP]) {
    try {
      return parseFunc(datestring);
    } catch (err) {
      continue;
    }
  }
  return null;
}
