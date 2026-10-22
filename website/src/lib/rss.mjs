import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { t } from '../i18n/index.mjs';
import { pathInLang } from '../i18n/lang.mjs';

export async function blogFeed(context, lang) {
  const posts = (await getCollection('blog')).filter((p) => p.data.lang === lang && !p.data.draft);
  return rss({
    title: t('blogPage.h1', undefined, lang),
    description: t('blogPage.feedDescription', undefined, lang),
    site: context.site,
    items: posts.map((post) => ({
      link: `${pathInLang('/blog/', lang)}#${post.slug}`,
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
    })),
  });
}
