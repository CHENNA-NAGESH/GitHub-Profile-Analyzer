import { useState } from 'react'
import { fetchProfile } from './github'
import './App.css'

const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'dev'

function formatNumber(value) {
  return new Intl.NumberFormat().format(value ?? 0)
}

export default function App() {
  const [username, setUsername] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event) {
    event.preventDefault()
    if (!username.trim()) {
      setError('Enter a GitHub username.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const profile = await fetchProfile(username)
      setData(profile)
    } catch (err) {
      setData(null)
      setError(err.message || 'Could not load profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <h1>GitHub Profile Analyzer</h1>
          <p>Search a public GitHub username to inspect profile stats, languages, and top repositories.</p>
        </div>
        <span className="version">build {APP_VERSION}</span>
      </header>

      <form className="search" onSubmit={onSubmit}>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="e.g. octocat"
          aria-label="GitHub username"
          autoComplete="off"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </form>

      {error ? <p className="error">{error}</p> : null}

      {!data && !error ? (
        <section className="card empty">
          <p>Try a username to see followers, repo languages, and starred projects.</p>
        </section>
      ) : null}

      {data ? (
        <section>
          <article className="card profile">
            <img src={data.user.avatar_url} alt={`${data.user.login} avatar`} />
            <div>
              <h2>{data.user.name || data.user.login}</h2>
              <a href={data.user.html_url} target="_blank" rel="noreferrer">
                @{data.user.login}
              </a>
              {data.user.bio ? <p>{data.user.bio}</p> : null}
              <div className="meta">
                {data.user.location ? <span>{data.user.location}</span> : null}
                {data.user.company ? <span>{data.user.company}</span> : null}
                {data.user.blog ? (
                  <a href={data.user.blog.startsWith('http') ? data.user.blog : `https://${data.user.blog}`} target="_blank" rel="noreferrer">
                    {data.user.blog}
                  </a>
                ) : null}
              </div>
            </div>
          </article>

          <div className="stats">
            <div className="stat">
              <strong>{formatNumber(data.user.public_repos)}</strong>
              <span>Public repos</span>
            </div>
            <div className="stat">
              <strong>{formatNumber(data.user.followers)}</strong>
              <span>Followers</span>
            </div>
            <div className="stat">
              <strong>{formatNumber(data.user.following)}</strong>
              <span>Following</span>
            </div>
            <div className="stat">
              <strong>{formatNumber(data.user.public_gists)}</strong>
              <span>Gists</span>
            </div>
          </div>

          <h3 className="section-title">Languages (from up to 100 repos)</h3>
          <div className="languages">
            {data.languages.length ? (
              data.languages.slice(0, 12).map((lang) => (
                <span className="chip" key={lang.name}>
                  {lang.name}
                  <em>{lang.count}</em>
                </span>
              ))
            ) : (
              <span className="chip">No language data</span>
            )}
          </div>

          <h3 className="section-title">Top repositories by stars</h3>
          <div className="repos">
            {data.topRepos.map((repo) => (
              <article className="repo" key={repo.id}>
                <h3>
                  <a href={repo.html_url} target="_blank" rel="noreferrer">
                    {repo.name}
                  </a>
                </h3>
                <p>{repo.description || 'No description'}</p>
                <div className="repo-meta">
                  <span>{repo.language || 'Unknown'}</span>
                  <span>★ {formatNumber(repo.stargazers_count)}</span>
                  <span>⑂ {formatNumber(repo.forks_count)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
