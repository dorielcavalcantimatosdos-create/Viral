const cache = new Map();

export default async function handler(req, res) {
  const origin = req.headers.origin;

  const allowedOrigin =
    'https://dorielcavalcantimatosdos-create.github.io';

  if (origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Método não permitido.'
    });
  }

  try {
    const key = process.env.YOUTUBE_API_KEY;

    if (!key) {
      return res.status(503).json({
        error: 'Chave do YouTube não configurada no servidor.'
      });
    }

    const q = String(req.query.q || '').trim();

    if (q.length < 2 || q.length > 100) {
      return res.status(400).json({
        error: 'Digite um assunto entre 2 e 100 caracteres.'
      });
    }

    const region = String(req.query.regionCode || 'BR');
    const period = String(req.query.publishedAfter || '');
    const duration = String(req.query.videoDuration || '');
    const language = String(req.query.relevanceLanguage || 'pt');

    const maxResults = Math.min(
      Math.max(Number(req.query.maxResults) || 25, 1),
      50
    );

    const cacheKey = JSON.stringify({
      q, region, period, duration, language, maxResults
    });

    const cached = cache.get(cacheKey);

    if (cached && cached.expires > Date.now()) {
      return res.status(200).json(cached.data);
    }

    const params = new URLSearchParams({
      key,
      part: 'snippet',
      type: 'video',
      q,
      maxResults: String(maxResults),
      order: 'viewCount',
      relevanceLanguage: language
    });

    if (region) params.set('regionCode', region);
    if (period) params.set('publishedAfter', period);
    if (duration) params.set('videoDuration', duration);

    async function youtube(endpoint, params) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/${endpoint}?${params}`
      );

      const data = await response.json();

      if (!response.ok) {
        const reason = data.error?.errors?.[0]?.reason;

        if (reason === 'quotaExceeded') {
          throw new Error('QUOTA');
        }

        throw new Error('YOUTUBE');
      }

      return data;
    }

    const search = await youtube('search', params);

    const ids = [
      ...new Set(
        (search.items || [])
          .map(item => item.id?.videoId)
          .filter(Boolean)
      )
    ];

    if (!ids.length) {
      return res.status(200).json({
        query: q,
        videos: []
      });
    }

    const videoParams = new URLSearchParams({
      key,
      part: 'snippet,statistics,contentDetails',
      id: ids.join(',')
    });

    const details = await youtube('videos', videoParams);

    const channelIds = [
      ...new Set(
        details.items
          .map(v => v.snippet?.channelId)
          .filter(Boolean)
      )
    ];

    let channelMap = {};

    if (channelIds.length) {
      const channelParams = new URLSearchParams({
        key,
        part: 'statistics',
        id: channelIds.join(',')
      });

      const channels = await youtube('channels', channelParams);

      channelMap = Object.fromEntries(
        (channels.items || []).map(c => [
          c.id,
          c.statistics?.hiddenSubscriberCount
            ? null
            : Number(c.statistics?.subscriberCount ?? 0)
        ])
      );
    }

    const videos = details.items.map(v => ({
      id: v.id,
      title: v.snippet?.title || '',
      description: v.snippet?.description || '',
      channelId: v.snippet?.channelId || '',
      channelTitle: v.snippet?.channelTitle || '',
      publishedAt: v.snippet?.publishedAt || '',
      categoryId: v.snippet?.categoryId || '',
      thumbnail:
        v.snippet?.thumbnails?.high?.url ||
        v.snippet?.thumbnails?.medium?.url ||
        '',
      duration: v.contentDetails?.duration || '',
      viewCount: v.statistics?.viewCount == null
        ? null
        : Number(v.statistics.viewCount),
      likeCount: v.statistics?.likeCount == null
        ? null
        : Number(v.statistics.likeCount),
      commentCount: v.statistics?.commentCount == null
        ? null
        : Number(v.statistics.commentCount),
      channelSubscriberCount:
        channelMap[v.snippet?.channelId] ?? null,
      url: `https://www.youtube.com/watch?v=${v.id}`
    }));

    const result = {
      query: q,
      source: 'youtube',
      collectedAt: new Date().toISOString(),
      videos
    };

    cache.set(cacheKey, {
      expires: Date.now() + 300000,
      data: result
    });

    return res.status(200).json(result);

  } catch (error) {
    if (error.message === 'QUOTA') {
      return res.status(429).json({
        error: 'Limite diário de pesquisas do YouTube atingido.'
      });
    }

    return res.status(503).json({
      error: 'Não foi possível consultar o YouTube agora.'
    });
  }
}