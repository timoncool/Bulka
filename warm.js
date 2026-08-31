fetch('https://codeberg.org/api/v1/repos/uzu/strudel/pulls?state=closed&page=1')
  .then((res) => res.json())
  .then((pulls) => {
    const r = pulls
      .filter((pull) => pull.merged)
      .sort((a, b) => new Date(b.closed_at) - new Date(a.closed_at))
      .map((pull) => `${pull.closed_at} ${pull.title} by ${pull.user.login || '?'} in: [#${pull.number}](${pull.url}) `)
      .join('\n');
    console.log(r);
  });

/*

  */
