const API_KEY = "UduWpdrz7CE63fowEfFHEqE4zpvp9M9r";

const topicsBox = document.getElementById("topics");
const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");
const clearBtn = document.getElementById("clearBtn");
const statusEl = document.getElementById("status");
const newsEl = document.getElementById("news");

const STORAGE_NAME = "saved_topics";

function getTopics() {
  const boxes = topicsBox.querySelectorAll("input[type='checkbox']");
  const selected = [];
  boxes.forEach(box => {
    if (box.checked) selected.push(box.value);
  });
    return selected;
}

function saveTopics() {
  const topics = getTopics();
  localStorage.setItem(STORAGE_NAME, JSON.stringify(topics));
  statusEl.textContent = "Saved your topics!";
}

function loadTopics() {
  const saved = localStorage.getItem(STORAGE_NAME);
  let topics = ["world", "technology"]; 
  if (saved) {
    topics = JSON.parse(saved);
  }

  const boxes = topicsBox.querySelectorAll("input[type='checkbox']");
  boxes.forEach(box => {
    box.checked = topics.includes(box.value);
  });

  return topics;
}

async function getNews(section) {
  const url = `https://api.nytimes.com/svc/topstories/v2/${section}.json?api-key=${API_KEY}`;
  try{
    const res = await fetch(url);
    if (!res.ok) throw new Error("API error for " + section);
    const data = await res.json();
    return data.results || [];
    } catch (error) {
      console.error(error);
      return [];
    }
}

function showNews(articles) {
  newsEl.innerHTML = "";
  if (articles.length === 0) {
    newsEl.innerHTML = "<p>No news found.</p>";
    return;
  }

  articles.slice(0, 10).forEach(a => {
    const div = document.createElement("article");
    div.innerHTML = `
      <h3><a href="${a.url}" target="_blank">${a.title}</a></h3>
      <div class="meta">${a.byline || "NYT"} • ${new Date(a.published_date).toLocaleString()}</div>
      <p>${a.abstract}</p>
    `;
    newsEl.appendChild(div);
  });
}

function loadNews() {
  const topics = getTopics();
  if (topics.length === 0) {
    statusEl.textContent = "Please select at least one topic.";
    return;
  }

  statusEl.textContent = "Loading...";
  newsEl.innerHTML = "";

  const promises = topics.map(section => getNews(section));

  Promise.all(promises).then(allResults => {
    const allArticles = allResults.flat().sort((a, b) =>
      new Date(b.published_date) - new Date(a.published_date)
    );

    showNews(allArticles);
    statusEl.textContent = "Showing latest stories for: " + topics.join(", ");
  }).catch(() => {
    statusEl.textContent = "Something went wrong. Please try again.";
  });
}

saveBtn.addEventListener("click", saveTopics);
loadBtn.addEventListener("click", loadNews);
clearBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_NAME);
  statusEl.textContent = "Cleared saved topics.";
  newsEl.innerHTML = "";
});

topicsBox.addEventListener("change", loadNews);

loadTopics();
loadNews();