const topics = document.querySelectorAll('.sidebar-nav ul li');
topics.forEach(function (item) {
  item.addEventListener('click', function () {
    topics.forEach(function (t) { t.classList.remove('active'); });
    this.classList.add('active');
  });
});
