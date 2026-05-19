const topics = document.querySelectorAll('.sidebar-nav ul li');
topics.forEach(function (item) {
  item.addEventListener('click', function () {
    topics.forEach(function (t) { t.classList.remove('active'); });
    this.classList.add('active');
    const company = this.textContent.trim();
    loadNews(company);
  });
});

async function loadNews(company) {
  const newsList = document.getElementById('news-list');
  newsList.innerHTML = '<p class="loading">Loading live news...</p>';

  const url = `/api/news?company=${encodeURIComponent(company)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'ok' || data.articles.length === 0) {
      newsList.innerHTML = '<p class="loading">No articles found.</p>';
      return;
    }

    newsList.innerHTML = data.articles.map(function (article) {
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
  } catch (err) {
    newsList.innerHTML = '<p class="loading">Could not load news. Try again shortly.</p>';
  }
}

loadNews('Apple Inc');
