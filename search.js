// Pagination variables
let currentPage = 1;
const resultsPerPage = 10;
let allDogs = [];

async function searchDogs() {
  const breedsRaw = document.getElementById('breedInput').value.trim();
  const zipRaw = document.getElementById('zipInput').value.trim();
  const ageMin = document.getElementById('ageMinInput').value.trim();
  const ageMax = document.getElementById('ageMaxInput').value.trim();

  const params = new URLSearchParams();

  // Convert comma-separated input into array values
  const breeds = breedsRaw ? breedsRaw.split(',').map(b => b.trim()) : [];
  const zipCodes = zipRaw ? zipRaw.split(',').map(z => z.trim()) : [];

  breeds.forEach(breed => params.append('breeds', breed));
  zipCodes.forEach(zip => params.append('zipCodes', zip));

  if (ageMin) params.append('ageMin', ageMin);
  if (ageMax) params.append('ageMax', ageMax);

  // Default sort if nothing is entered
  let sort = document.getElementById('sortInput').value;

  // Force alphabetical sort by name
  if (!breedsRaw && !sort) {
    sort = 'name:asc';
  }

  if (sort) params.append('sort', sort);

  try {
    const searchRes = await fetch(`https://frontend-take-home-service.fetch.com/dogs/search?${params.toString()}`, {
      credentials: 'include',
    });

    if (!searchRes.ok) throw new Error('Search failed');
    const searchData = await searchRes.json();

    const dogIds = searchData.resultIds;

    if (!dogIds || dogIds.length === 0) {
      document.getElementById('results').innerText = 'No dogs found.';
      document.getElementById('paginationButtons').innerHTML = '';
      document.getElementById('currentPageDisplay').innerText = '';
      return;
    }

    const detailsRes = await fetch('https://frontend-take-home-service.fetch.com/dogs', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dogIds),
    });

    if (!detailsRes.ok) throw new Error('Failed to fetch dog details');
    allDogs = await detailsRes.json();

    currentPage = 1;
    renderPage(currentPage);
  } catch (error) {
    console.error('Fetch error:', error);
    document.getElementById('results').innerText = 'Check the console for details.';
  }
}

function renderPage(page) {
  const start = (page - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const pageDogs = allDogs.slice(start, end);

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  pageDogs.forEach(dog => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="${dog.img}" alt="${dog.name}" style="width: 100px; height: auto;"></td>
      <td>${dog.name}</td>
      <td>${dog.breed}</td>
      <td>${dog.age}</td>
      <td>${dog.zip_code}</td>
    `;
    resultsDiv.appendChild(row);
  });

  updatePaginationDisplay();
  addPaginationControls();
}

function updatePaginationDisplay() {
  const currentPageDisplay = document.getElementById('currentPageDisplay');
  currentPageDisplay.innerText = `Page ${currentPage}`;
}

function addPaginationControls() {
  const totalPages = Math.ceil(allDogs.length / resultsPerPage);
  const paginationDiv = document.getElementById('paginationButtons');
  paginationDiv.innerHTML = ''; // Remove old pagination buttons

  // Prev button
  if (currentPage > 1) {
    const prevButton = document.createElement('button');
    prevButton.innerText = 'Previous';
    prevButton.onclick = () => {
      currentPage--;
      renderPage(currentPage);
    };
    paginationDiv.appendChild(prevButton);
  }

  // Page number buttons (limited display to 5 pages max for cleaner UI)
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.innerText = i;
    if (i === currentPage) {
      pageBtn.disabled = true;
      pageBtn.style.fontWeight = 'bold';
    }
    pageBtn.onclick = () => {
      currentPage = i;
      renderPage(currentPage);
    };
    paginationDiv.appendChild(pageBtn);
  }

  // Next button
  if (currentPage < totalPages) {
    const nextButton = document.createElement('button');
    nextButton.innerText = 'Next';
    nextButton.onclick = () => {
      currentPage++;
      renderPage(currentPage);
    };
    paginationDiv.appendChild(nextButton);
  }
}