import { blogFeed } from '../../lib/rss.mjs';

export const GET = (context) => blogFeed(context, 'en');
