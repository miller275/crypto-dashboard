export const APP = {
  name: "CryptoWatch",
  version: "9.0.0",
  dataBasePath: "./data",
  defaultCurrency: "USD",
  defaultLang: "ru",
  supportedLangs: ["ru","en"],
  supportedCurrencies: ["USD"], // keep USD only for stability
  marketFile: (cur) => `market_${cur.toLowerCase()}.json`,
  historyFile: (cur) => `history_${cur.toLowerCase()}.json`,
};
