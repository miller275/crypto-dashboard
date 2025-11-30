(function() {
  const state = { /* ... как в твоём коде ... */ };
  const dom = { /* ... все getElementById ... */ };

  // Тема
  document.body.setAttribute('data-theme', state.theme);
  dom.toggleTheme.onclick = () => setTheme(state.theme === 'dark' ? 'light' : 'dark');

  // Поиск/сортировка/фильтры
  dom.search.oninput = e => { state.search = e.target.value; applyFilters(); };
  dom.sort.onchange = e => { state.sort = e.target.value; applyFilters(); };
  dom.favOnly.onchange = e => { state.favOnly = e.target.checked; applyFilters(); };
  dom.pageSize.onchange = e => { state.pageSize = +e.target.value; setPage(1); };

  dom.prevPage.onclick = () => setPage(state.page - 1);
  dom.nextPage.onclick = () => setPage(state.page + 1);

  // Обновление
  async function refreshData() {
    try {
      const coins = await API.markets({ page: 1, perPage: 250, order: state.sort });
      state.coins = coins;
      state.lastUpdate = Date.now();
      dom.lastUpdate.textContent = fmt.time(state.lastUpdate);
      applyFilters();

      const g = await API.global();
      state.global = g.data;
      dom.statDominance.textContent = 'BTC ' + g.data.market_cap_percentage.btc.toFixed(1) + '%';
      dom.statMarketCap.textContent = fmt.money(g.data.total_market_cap.usd);
      dom.statVolume.textContent = fmt.money(g.data.total_volume.usd);
      dom.statCount.textContent = fmt.num(g.data.active_cryptocurrencies);
    } catch (e) {
      console.error(e);
    }
  }
  dom.refreshBtn.onclick = refreshData;
  refreshData();

  // Модалка
  dom.closeModal.onclick = () => {
    dom.modalBackdrop.style.display = 'none';
    dom.modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  async function openModal(id) {
    const detail = await API.coinDetail(id);
    const market = state.coins.find(x => x.id === id) || {};
    state.modal.id = id;
    state.modal.symbol = (market.symbol || detail.symbol || '').toUpperCase();

    dom.modalTitle.textContent = detail.name + ' (' + state.modal.symbol + ')';
    dom.modalIcon.src = detail.image?.small || market.image || '';
    dom.mPrice.textContent = fmt.money(market.current_price ?? detail.market_data?.current_price?.usd);
    dom.mChange.textContent = fmt.pct(market.price_change_percentage_24h ?? detail.market_data?.price_change_percentage_24h);
    dom.mCap.textContent = fmt.money(market.market_cap ?? detail.market_data?.market_cap?.usd);
    dom.mVol.textContent = fmt.money(market.total_volume ?? detail.market_data?.total_volume?.usd);
    dom.mSupply.textContent = fmt.num(detail.market_data?.circulating_supply) + ' / ' + fmt.num(detail.market_data?.total_supply);
    dom.mRank.textContent = detail.market_cap_rank ?? market.market_cap_rank ?? '—';

    dom.mDescription.textContent = fmt.trimHtml(detail.description?.ru || detail.description?.en || '');

    dom.mLinks.innerHTML = (detail.links.homepage[0] ? `<a href="${detail.links.homepage[0]}" target="_blank">Сайт</a>` : '');

    // TradingView
    dom.tvWidget.innerHTML = '';
    new TradingView.widget({
      container_id: "tvWidget",
      symbol: toTVSymbol(state.modal.symbol),
      autosize: true,
      theme: state.modal.tvTheme,
      interval: "60",
      locale: "ru",
    });

    dom.modalBackdrop.style.display = 'flex';
    dom.modalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

})();
