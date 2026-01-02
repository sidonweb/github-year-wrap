# GitHub Wrap 🎁

A simple “year wrap” for your GitHub activity.
Think Spotify Wrapped, but instead of songs, it shows how you actually coded through the year.

👉 Live demo: [https://githubwrap.sidonweb.com](https://githubwrap.sidonweb.com)

---

## About the Project

GitHub Wrap gives you a clear snapshot of your GitHub activity for the year.

You enter a GitHub username and it shows things like:

* How active you were during the year
* Commit patterns and contribution trends
* What your coding year *actually* looked like

I built this on the first day of 2026 after realizing that most of my 2025 was spent at my desk coding, while everyone else was posting highlight reels. This is my way of checking the receipts.

Turns out my own wrap was mid. Yours might be better (or worse).

---

## Tech Stack

* **Next.js**
* **Tailwind CSS**
* **GitHub GRAPHQL API**

---

## Getting Started (Local Setup)

### 1. Clone the repo

```bash
git https://github.com/sidonweb/github-year-wrap
cd github-year-wrap
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Create a `.env.local` file in the root and add:

```env
GITHUB_TOKEN=your_github_personal_access_token
```

> The token is used to avoid GitHub API rate limits.
> Public data only (for now).

### 4. Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Deployment

The project is deployed on **Vercel**, but you can deploy it anywhere that supports Next.js.

Just make sure:

* `GITHUB_TOKEN` is added to your environment variables
* Build command: `npm run build`
* Start command (if needed): `npm start`

---

## Contributing

Clone it. Break it. Fix it. Improve it.

You can:

* Fix bugs
* Improve UI/UX
* Optimize API calls
* Add new stats or visuals
* Suggest ideas
* Rewrite half the app if you feel like it

Open a PR, open an issue, or just fork it and do whatever you want.

No gatekeeping here.

---

## Ideas / Roadmap (Optional)

* GitHub OAuth login to include private repos
* Better visualizations
* Downloadable share cards (PNG)
* Weekly / monthly breakdowns
* Comparison with previous years

If you build any of this, even better.

---

## License

Do whatever you want.
Just don’t pretend you built it first.

---