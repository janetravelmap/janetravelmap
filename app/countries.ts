import isoCodeRows from "i18n-iso-countries/codes.json";

const sovereignCodes = `
AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VE VN YE ZM ZW PS VA TW
`.trim().split(/\s+/);

const numericByAlpha2 = new Map(isoCodeRows.map((row) => [row[0], row[2]]));
import type { Locale } from "./i18n";

const nameOverrides: Record<Locale, Record<string, string>> = {
  "zh-TW": { TW: "台灣", PS: "巴勒斯坦", VA: "梵蒂岡", XK: "科索沃" },
  en: { TW: "Taiwan", PS: "Palestine", VA: "Vatican City", XK: "Kosovo" },
  ja: { TW: "台湾", PS: "パレスチナ", VA: "バチカン市国", XK: "コソボ" },
};

export function getCountryOptions(locale: Locale) {
  const regionNames = new Intl.DisplayNames([locale], { type: "region" });
  return [...sovereignCodes, "XK"].map((alpha2) => ({
    alpha2,
    id: alpha2 === "XK" ? "383" : numericByAlpha2.get(alpha2) ?? alpha2,
    label: nameOverrides[locale][alpha2] ?? regionNames.of(alpha2) ?? alpha2,
  })).sort((a, b) => a.label.localeCompare(b.label, locale));
}

export const countryOptions = getCountryOptions("zh-TW");

export const countryNameById = new Map(countryOptions.map((country) => [country.id, country.label]));
export const canonicalCountryCount = countryOptions.length;
