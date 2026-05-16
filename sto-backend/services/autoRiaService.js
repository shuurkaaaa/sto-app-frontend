const axios = require('axios');

const AUTORIA_API_BASE_URL = process.env.AUTORIA_API_BASE_URL || 'https://developers.ria.com';
const AUTORIA_API_KEY = (process.env.AUTORIA_API_KEY || '').trim();
const AUTORIA_USER_ID = (process.env.AUTORIA_USER_ID || '').trim();
const AUTORIA_LANG_ID = Number(process.env.AUTORIA_LANG_ID || 4);
const AUTORIA_PERIOD_DAYS = Number(process.env.AUTORIA_PERIOD_DAYS || 365);

const autoRiaClient = axios.create({
  baseURL: AUTORIA_API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'sto-app/1.0',
  },
});

const normalizeVin = (vin) => String(vin || '')
  .toUpperCase()
  .replace(/[^A-Z0-9]/g, '')
  .substring(0, 17);

const getConfigStatus = () => {
  const missing = [];
  if (!AUTORIA_API_KEY) missing.push('AUTORIA_API_KEY');
  if (!AUTORIA_USER_ID) missing.push('AUTORIA_USER_ID');

  return {
    provider: 'AUTO.RIA',
    configured: Boolean(AUTORIA_API_KEY),
    paidVinLookupConfigured: Boolean(AUTORIA_API_KEY && AUTORIA_USER_ID),
    searchFallbackConfigured: Boolean(AUTORIA_API_KEY),
    missing,
    langId: AUTORIA_LANG_ID,
    periodDays: AUTORIA_PERIOD_DAYS,
  };
};

const getChipValue = (chips, entity) => {
  const chip = chips.find((item) => item.entity === entity);
  return chip?.name || null;
};

const pickValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const extractYear = (yearText) => {
  if (!yearText) return null;
  const match = String(yearText).match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
};

const toAbsoluteAutoRiaUrl = (url) => {
  if (!url) return null;
  if (String(url).startsWith('http')) return url;
  if (String(url).startsWith('/')) return `https://auto.ria.com${url}`;
  return `https://auto.ria.com/${url}`;
};

const buildDescription = ({ brand, model, year, noticeString }) => {
  if (noticeString) return noticeString;
  return [brand, model, year].filter(Boolean).join(' ').trim() || null;
};

const mapAutoInfoResponse = (payload, vin, source = 'AUTO.RIA Search') => {
  const autoData = payload?.autoData || {};
  const autoInfoBar = payload?.autoInfoBar || {};
  const technicalCondition = payload?.technicalCondition || {};
  const checkedVin = payload?.checkedVin || {};

  return {
    success: true,
    found: true,
    source,
    vin,
    autoId: payload?.autoId || payload?.id || autoData?.autoId || null,
    brand: payload?.markName || payload?.marka || null,
    model: payload?.modelName || payload?.model || null,
    year: payload?.year || autoData?.year || null,
    body: payload?.bodyName || autoData?.bodyName || null,
    fuel: payload?.fuelName || autoData?.fuelName || null,
    engineVolume: payload?.engineVolume || null,
    gearbox: payload?.gearboxName || autoData?.gearboxName || null,
    drive: payload?.driveName || autoData?.driveName || null,
    color: payload?.color?.name || payload?.colorName || null,
    region: payload?.stateName || payload?.locationCityName || null,
    mileage: autoData?.race || payload?.race || null,
    priceUsd: payload?.USD || payload?.priceUSD || null,
    description: buildDescription({
      brand: payload?.markName || payload?.marka,
      model: payload?.modelName || payload?.model,
      year: payload?.year || autoData?.year,
      noticeString: payload?.title,
    }),
    sellerDescription: autoData?.description || null,
    generation: autoData?.generationName || null,
    modification: autoData?.modificationName || null,
    technicalConditionTitle: technicalCondition?.title || null,
    technicalConditionAnnotation: technicalCondition?.annotation || null,
    technicalChecked: payload?.technicalChecked ?? null,
    damage: autoInfoBar?.damage ?? null,
    onRepairParts: autoInfoBar?.onRepairParts ?? null,
    underCredit: autoInfoBar?.underCredit ?? null,
    abroad: autoInfoBar?.abroad ?? null,
    confiscatedCar: autoInfoBar?.confiscatedCar ?? null,
    checkedVin: {
      isShow: checkedVin?.isShow ?? null,
      orderId: checkedVin?.orderId ?? null,
      vin: checkedVin?.vin || null,
    },
    haveInfotechReport: payload?.haveInfotechReport ?? null,
    url: toAbsoluteAutoRiaUrl(payload?.linkToView || payload?.exchangeLink || null),
    linkText: payload?.linkToView ? 'Відкрити оголошення' : null,
    raw: payload,
  };
};

const fetchAutoInfo = async (autoId, vin) => {
  const response = await autoRiaClient.get('/auto/info', {
    params: {
      api_key: AUTORIA_API_KEY,
      auto_id: autoId,
    },
  });

  return mapAutoInfoResponse(response.data || {}, vin);
};

const searchBySearchApi = async (vin) => {
  const response = await autoRiaClient.get('/auto/search', {
    params: {
      api_key: AUTORIA_API_KEY,
      searchType: 4,
      status_id: 0,
      countpage: 1,
      'VIN[0]': vin,
    },
  });

  const payload = response.data || {};
  const ids = payload?.result?.search_result?.ids || [];
  if (!ids.length) {
    return {
      success: true,
      found: false,
      source: 'AUTO.RIA Search',
      vin,
      message: 'AUTO.RIA search не знайшов оголошення за цим VIN.',
      raw: payload,
    };
  }

  const firstId = ids[0];
  try {
    const infoResult = await fetchAutoInfo(firstId, vin);
    return {
      ...infoResult,
      searchIds: ids,
    };
  } catch (error) {
    console.error('[AUTO.RIA] auto/info fallback error:', error.response?.data || error.message);
    return {
      success: true,
      found: true,
      source: 'AUTO.RIA Search',
      vin,
      autoId: firstId,
      searchIds: ids,
      description: `Знайдено оголошення AUTO.RIA #${firstId}`,
      url: `https://auto.ria.com/uk/auto_${firstId}.html`,
      linkText: 'Відкрити оголошення',
      raw: payload,
    };
  }
};

const searchByPaidVinApi = async (vin) => {
  const response = await autoRiaClient.post('/auto/params/by/vin-code/', {
    langId: AUTORIA_LANG_ID,
    period: AUTORIA_PERIOD_DAYS,
    params: {
      omniId: vin,
    },
  }, {
    params: {
      user_id: AUTORIA_USER_ID,
      api_key: AUTORIA_API_KEY,
    },
  });

  const payload = response.data || {};
  const chips = payload?.chipsData?.chips || [];
  const link = payload?.chipsData?.link || {};
  const notices = Array.isArray(payload.noticeData) ? payload.noticeData : [];
  const notice = notices.find((item) => item.noticeType === 'success') || notices[0] || null;

  const result = {
    success: true,
    found: chips.length > 0 || Boolean(link.url) || Boolean(notice?.noticeString),
    source: 'AUTO.RIA VIN API',
    vin,
    searchType: payload.searchType || 'VIN',
    brand: getChipValue(chips, 'brandId'),
    model: getChipValue(chips, 'modelId'),
    year: extractYear(getChipValue(chips, 'year')),
    body: getChipValue(chips, 'bodyId'),
    fuel: getChipValue(chips, 'fuelId'),
    engineVolume: getChipValue(chips, 'engineVolume'),
    gearbox: getChipValue(chips, 'gearBoxId'),
    drive: getChipValue(chips, 'driveId'),
    color: getChipValue(chips, 'colorId'),
    region: getChipValue(chips, 'stateId'),
    mileage: getChipValue(chips, 'mileage'),
    generation: getChipValue(chips, 'generationId'),
    modification: getChipValue(chips, 'modificationId'),
    description: buildDescription({
      brand: getChipValue(chips, 'brandId'),
      model: getChipValue(chips, 'modelId'),
      year: extractYear(getChipValue(chips, 'year')),
      noticeString: notice?.noticeString,
    }),
    linkText: link.text || null,
    url: toAbsoluteAutoRiaUrl(link.url || null),
    notices,
    chips,
    raw: payload,
  };

  if (!result.found) {
    result.message = 'AUTO.RIA не знайшов дані за цим VIN.';
  }

  return result;
};

const mergeAutoRiaResults = (vin, paidResult, searchResult, config) => {
  const mode = paidResult && searchResult
    ? 'paid_vin_lookup+search_listing'
    : paidResult
      ? 'paid_vin_lookup'
      : 'search_fallback';

  return {
    success: Boolean(paidResult?.success || searchResult?.success),
    found: Boolean(paidResult?.found || searchResult?.found),
    source: 'AUTO.RIA',
    mode,
    vin,
    brand: pickValue(paidResult?.brand, searchResult?.brand),
    model: pickValue(paidResult?.model, searchResult?.model),
    year: pickValue(paidResult?.year, searchResult?.year),
    body: pickValue(paidResult?.body, searchResult?.body),
    fuel: pickValue(paidResult?.fuel, searchResult?.fuel),
    engineVolume: pickValue(paidResult?.engineVolume, searchResult?.engineVolume),
    gearbox: pickValue(paidResult?.gearbox, searchResult?.gearbox),
    drive: pickValue(paidResult?.drive, searchResult?.drive),
    color: pickValue(paidResult?.color, searchResult?.color),
    region: pickValue(paidResult?.region, searchResult?.region),
    mileage: pickValue(searchResult?.mileage, paidResult?.mileage),
    generation: pickValue(searchResult?.generation, paidResult?.generation),
    modification: pickValue(searchResult?.modification, paidResult?.modification),
    description: pickValue(searchResult?.description, paidResult?.description),
    sellerDescription: searchResult?.sellerDescription || null,
    technicalConditionTitle: searchResult?.technicalConditionTitle || null,
    technicalConditionAnnotation: searchResult?.technicalConditionAnnotation || null,
    technicalChecked: searchResult?.technicalChecked ?? null,
    damage: searchResult?.damage ?? null,
    onRepairParts: searchResult?.onRepairParts ?? null,
    underCredit: searchResult?.underCredit ?? null,
    abroad: searchResult?.abroad ?? null,
    confiscatedCar: searchResult?.confiscatedCar ?? null,
    checkedVin: searchResult?.checkedVin || null,
    haveInfotechReport: searchResult?.haveInfotechReport ?? null,
    priceUsd: searchResult?.priceUsd ?? null,
    url: pickValue(searchResult?.url, paidResult?.url),
    linkText: pickValue(searchResult?.linkText, paidResult?.linkText),
    notices: paidResult?.notices || [],
    chips: paidResult?.chips || [],
    searchIds: searchResult?.searchIds || [],
    config,
    raw: {
      paidVinApi: paidResult?.raw || null,
      searchListing: searchResult?.raw || null,
    },
  };
};

const searchByVin = async (vin) => {
  const normalizedVin = normalizeVin(vin);
  if (!normalizedVin) {
    return {
      success: false,
      found: false,
      source: 'AUTO.RIA',
      error: 'VIN-код не вказаний',
    };
  }

  const config = getConfigStatus();
  if (!config.searchFallbackConfigured) {
    return {
      success: false,
      found: false,
      source: 'AUTO.RIA',
      requiresSetup: true,
      error: 'AUTO.RIA API не налаштований. Додайте AUTORIA_API_KEY у .env.',
      config,
    };
  }

  try {
    if (config.paidVinLookupConfigured) {
      const [paidResultSettled, searchResultSettled] = await Promise.allSettled([
        searchByPaidVinApi(normalizedVin),
        searchBySearchApi(normalizedVin),
      ]);

      const paidResult = paidResultSettled.status === 'fulfilled' ? paidResultSettled.value : null;
      const searchResult = searchResultSettled.status === 'fulfilled' ? searchResultSettled.value : null;

      if (paidResult || searchResult) {
        return mergeAutoRiaResults(normalizedVin, paidResult, searchResult, config);
      }
    }

    const fallbackResult = await searchBySearchApi(normalizedVin);
    return {
      ...fallbackResult,
      config,
      mode: 'search_fallback',
    };
  } catch (error) {
    const details = error.response?.data || error.message;
    console.error('[AUTO.RIA] VIN lookup error:', details);

    if (config.searchFallbackConfigured) {
      try {
        const fallbackResult = await searchBySearchApi(normalizedVin);
        return {
          ...fallbackResult,
          config,
          mode: config.paidVinLookupConfigured ? 'search_fallback_after_paid_error' : 'search_fallback',
        };
      } catch (fallbackError) {
        console.error('[AUTO.RIA] Search fallback error:', fallbackError.response?.data || fallbackError.message);
      }
    }

    return {
      success: false,
      found: false,
      source: 'AUTO.RIA',
      error: error.response?.data?.message || error.message || 'Не вдалося отримати дані з AUTO.RIA',
      statusCode: error.response?.status || null,
      config,
    };
  }
};

module.exports = {
  getConfigStatus,
  normalizeVin,
  searchByVin,
};
