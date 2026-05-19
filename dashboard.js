const topics = document.querySelectorAll('.sidebar-nav ul li');
topics.forEach(function (item) {
  item.addEventListener('click', function () {
    topics.forEach(function (t) { t.classList.remove('active'); });
    this.classList.add('active');
    const company = this.textContent.trim();
    loadDashboard(company);
  });
});

async function loadDashboard(company) {
  document.getElementById('news-list').innerHTML = '<p class="loading">Loading live news...</p>';
  document.getElementById('ai-analysis').innerHTML = '<p class="loading">Analysing narrative...</p>';

  const url = `/api/news?company=${encodeURIComponent(company)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok' || data.articles.length === 0) {
      document.getElementById('news-list').innerHTML = '<p class="loading">No articles found.</p>';
      document.getElementById('ai-analysis').innerHTML = '<p class="loading">No data to analyse.</p>';
      return;
    }

    renderNews(data.articles);
    await runAnalysis(data.articles, company);

  } catch (err) {
    document.getElementById('news-list').innerHTML = '<p class="loading">Could not load news.</p>';
    document.getElementById('ai-analysis').innerHTML = '<p class="loading">Analysis unavailable.</p>';
  }
}

function renderNews(articles) {
  document.getElementById('news-list').innerHTML = articles.map(function (article) {
    const date = new Date(article.publishedAt).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    return `
      <div class="news-card">
        <div class="news-meta">
          <span class="news-source">${article.source.name}</span>
          <span class="news-date">${date}</span>
        </div>
        <a class="news-title" href="${article.url}" target="_blank">${article.title}</a>
        <p class="news-desc">${article.description || ''}</p>
      </div>
    `;
  }).join('');
}

async function runAnalysis(articles, company) {
  try {
    const response = await fetch('/api/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articles, company })
    });

    const analysis = await response.json();

    const sentimentColor = {
      'Positive': '#4ade80',
      'Neutral': '#8888aa',
      'Cautious': '#facc15',
      'Negative': '#f87171'
    }[analysis.sentiment] || '#8888aa';

    document.getElementById('ai-analysis').innerHTML = `
      <div class="ai-card">
        <div class="ai-header">
          <div class="ai-sentiment" style="color: ${sentimentColor}">${analysis.sentiment}</div>
          <div class="ai-score">Narrative Score: <strong>${analysis.score}/100</strong></div>
        </div>
        <p class="ai-summary">${analysis.summary}</p>
        <div class="ai-sections">
          <div>
            <p class="ai-label">Key Signals Detected</p>
            <ul class="ai-list">
              ${analysis.key_signals.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          <div>
            <p class="ai-label">Dominant Language</p>
            <div class="ai-tags">
              ${analysis.tone_words.map(w => `<span class="ai-tag">${w}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById('ai-analysis').innerHTML = '<p class="loading">Analysis unavailable.</p>';
  }
}

loadDashboard('Apple Inc');
