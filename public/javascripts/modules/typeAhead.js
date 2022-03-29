import axios from 'axios';
import DOMPurify from 'dompurify';

const searchResultsHtml = (stores) =>
  stores
    .map(
      (store) =>
        `<a href="/stores/${store.slug}" class="search__result">
          <strong>${store.name}</strong>
        </a>`
    )
    .join('');

function typeAhead(search) {
  if (!search) return;

  const searchInput = search.querySelector('input');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', ({ currentTarget: { value } }) => {
    if (!value) return (searchResults.style.display = 'none');
    searchResults.style.display = 'block';
    axios
      .get(`/api/v1/search?q=${value}`)
      .then((res) => {
        if (res.data.length)
          return (searchResults.innerHTML = DOMPurify.sanitize(
            searchResultsHtml(res.data)
          ));
        searchResults.innerHTML = DOMPurify.sanitize(
          `<div class="search__result">No results found for ${value}...</div>`
        );
      })
      .catch((err) => console.error(err));
  });

  searchInput.on('keydown', ({ key }) => {
    if (!['ArrowUp', 'ArrowDown', 'Enter'].includes(key)) return;
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const first = searchResults.firstElementChild;
    const last = searchResults.lastElementChild;
    let next;

    if (key === 'ArrowUp')
      next = current ? current.previousElementSibling || last : last;
    else if (key === 'ArrowDown')
      next = current ? current.nextElementSibling || first : first;
    else if (key === 'Enter' && current.href) {
      return (window.location = current.href);
    }

    if (current) current.classList.remove(activeClass);
    next.classList.add(activeClass);
  });
}

export default typeAhead;
