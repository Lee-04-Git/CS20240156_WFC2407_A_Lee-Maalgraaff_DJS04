import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";
const BookConnectApp = {
  page: 1,
  matches: books, // Initialize with all books

  init() {
    this.setupEventListeners(); // Setup event listeners early
    this.setupTheme(); // Setup theme after listeners
    this.populateDropdowns(); // Populate dropdowns next
    this.renderBooks(); // Render books last
    this.updateShowMoreButton();
  },

  /* Setup Event Listeners */
  setupEventListeners() {
    const listButton = document.querySelector("[data-list-button]");
    const searchForm = document.querySelector("[data-search-form]");
    const listItems = document.querySelector("[data-list-items]");
    const settingsForm = document.querySelector("[data-settings-form]");
    const searchCancel = document.querySelector("[data-search-cancel]");
    const settingsCancel = document.querySelector("[data-settings-cancel]");
    const headerSearch = document.querySelector("[data-header-search]");
    const headerSettings = document.querySelector("[data-header-settings]");
    const listClose = document.querySelector("[data-list-close]");

    listButton.addEventListener("click", this.loadMoreBooks.bind(this));
    searchForm.addEventListener("submit", this.handleSearch.bind(this));
    listItems.addEventListener("click", this.showBookDetails.bind(this));
    settingsForm.addEventListener("submit", this.updateTheme.bind(this));
    searchCancel.addEventListener("click", this.closeSearchOverlay.bind(this));
    settingsCancel.addEventListener(
      "click",
      this.closeSettingsOverlay.bind(this)
    );
    headerSearch.addEventListener("click", this.openSearchOverlay.bind(this));
    headerSettings.addEventListener(
      "click",
      this.openSettingsOverlay.bind(this)
    );
    listClose.addEventListener("click", this.closeBookDetails.bind(this));
  },

  /* Book Details Display */
  displayBookDetails(active) {
    if (!active) return; // Ensure active book is defined
    document.querySelector("[data-list-active]").open = true;
    document.querySelector("[data-list-blur]").src = active.image;
    document.querySelector("[data-list-image]").src = active.image;
    document.querySelector("[data-list-title]").innerText = active.title;
    document.querySelector("[data-list-subtitle]").innerText = `${
      authors[active.author]
    } (${new Date(active.published).getFullYear()})`;
    document.querySelector("[data-list-description]").innerText =
      active.description;
  },
  showBookDetails(event) {
    const bookId = event.target.closest("[data-preview]")?.dataset.preview;
    if (bookId) {
      const activeBook = books.find((book) => book.id === bookId);
      this.displayBookDetails(activeBook);
    }
  },

  /* Theme Management Functions */
  setupTheme() {
    const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "night"
      : "day";
    document.querySelector("[data-settings-theme]").value = theme;
    this.applyTheme(theme);
  },

  applyTheme(theme) {
    const darkColor = theme === "night" ? "255, 255, 255" : "10, 10, 20";
    const lightColor = theme === "night" ? "10, 10, 20" : "255, 255, 255";
    document.documentElement.style.setProperty("--color-dark", darkColor);
    document.documentElement.style.setProperty("--color-light", lightColor);
  },

  updateTheme(event) {
    event.preventDefault();
    const theme = new FormData(event.target).get("theme");
    this.applyTheme(theme);
    this.closeSettingsOverlay();
  },
  /* Dropdown Population Functions */
  populateDropdowns() {
    this.populateDropdown("[data-search-genres]", genres, "All Genres");
    this.populateDropdown("[data-search-authors]", authors, "All Authors");
  },

  populateDropdown(selector, data, defaultText) {
    const dropdown = document.querySelector(selector);
    dropdown.innerHTML = ""; // Clear existing options
    dropdown.appendChild(this.createDropdownOption("any", defaultText));

    Object.entries(data).forEach(([id, name]) => {
      dropdown.appendChild(this.createDropdownOption(id, name));
    });
  },

  createDropdownOption(value, text) {
    const option = document.createElement("option");
    option.value = value;
    option.innerText = text;
    return option;
  },

  /* Book Rendering Functions */
  renderBooks() {
    const bookList = document.querySelector("[data-list-items]");
    bookList.innerHTML = ""; // Clear existing content
    const fragment = document.createDocumentFragment();
    this.matches.slice(0, BOOKS_PER_PAGE).forEach((book) => {
      fragment.appendChild(this.createBookButton(book));
    });
    bookList.appendChild(fragment);
  },

  createBookButton({ author, id, image, title }) {
    const button = document.createElement("button");
    button.className = "preview";
    button.setAttribute("data-preview", id);
    button.innerHTML = `
            <img class="preview__image" src="${image}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>`;
    return button;
  },

  /* Search Functionality */
  filterBooks(filters) {
    return books.filter((book) => {
      const genreMatch =
        filters.genre === "any" || book.genres.includes(filters.genre);
      const titleMatch =
        !filters.title.trim() ||
        book.title.toLowerCase().includes(filters.title.toLowerCase());
      const authorMatch =
        filters.author === "any" || book.author === filters.author;
      return titleMatch && authorMatch && genreMatch;
    });
  },

  handleSearch(event) {
    event.preventDefault();
    const filters = Object.fromEntries(new FormData(event.target));
    this.matches = this.filterBooks(filters);
    this.page = 1;
    this.renderBooks();
    this.updateShowMoreButton();
    window.scrollTo({ top: 0, behavior: "smooth" });
    this.closeSearchOverlay();
  },

  /* Load More Books */
  loadMoreBooks() {
    const fragment = document.createDocumentFragment();
    const start = this.page * BOOKS_PER_PAGE;
    const end = start + BOOKS_PER_PAGE;
    this.matches
      .slice(start, end)
      .forEach((book) => fragment.appendChild(this.createBookButton(book)));
    document.querySelector("[data-list-items]").appendChild(fragment);
    this.page += 1;
    this.updateShowMoreButton();
  },

  updateShowMoreButton() {
    const remaining = this.matches.length - this.page * BOOKS_PER_PAGE;
    const showMoreButton = document.querySelector("[data-list-button]");
    showMoreButton.innerHTML = `<span>Show more</span> <span class="list__remaining">(${Math.max(
      remaining,
      0
    )})</span>`;
    showMoreButton.disabled = remaining < 1;
  },

  /* Overlay Handling Functions */
  closeBookDetails() {
    document.querySelector("[data-list-active]").open = false;
  },

  closeSearchOverlay() {
    document.querySelector("[data-search-overlay]").open = false;
  },

  closeSettingsOverlay() {
    document.querySelector("[data-settings-overlay]").open = false;
  },

  openSearchOverlay() {
    document.querySelector("[data-search-overlay]").open = true;
    document.querySelector("[data-search-title]").focus();
  },

  openSettingsOverlay() {
    document.querySelector("[data-settings-overlay]").open = true;
  },
};
// Initialize the application on page load
document.addEventListener("DOMContentLoaded", () => BookConnectApp.init());
