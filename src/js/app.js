document.addEventListener('DOMContentLoaded', main);

function main() {
  setupColorScheme();
}

function setupColorScheme() {
  const colorSchemeBtn = document.getElementById('colorSchemeBtn');

  document.body.dataset.scheme = matchMedia('(prefers-color-scheme: light)')
    .matches
    ? 'light'
    : 'dark';

  colorSchemeBtn.addEventListener('click', changeColorScheme);
}

function changeColorScheme() {
  return (document.body.dataset.scheme =
    document.body.dataset.scheme === 'light' ? 'dark' : 'light');
}
