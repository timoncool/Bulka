import reference from '../../../doc.json';

// Справку (автодополнение и подсказки движка, вкладка «справка») читают объекты doc.json. На английской
// версии их тексты заменяются оригиналом из doc.en.json — те же объекты, поэтому подхватывают все.
export async function applyReferenceLanguage(lang) {
  if (lang !== 'en') return;
  const { default: english } = await import('../../../doc.en.json');
  const byName = new Map(english.docs.map((d) => [d.longname, d]));
  for (const doc of reference.docs) {
    const en = byName.get(doc.longname);
    if (!en) throw new Error(`doc.en.json: нет ${doc.longname} — запусти pnpm jsdoc-json и pnpm doc-ru`);
    doc.description = en.description;
    doc.params = en.params;
  }
}
