const API = 'https://api.github.com'

async function githubFetch(path) {
  const response = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/vnd.github+json' },
  })

  if (response.status === 404) {
    throw new Error('GitHub user not found.')
  }

  if (response.status === 403) {
    throw new Error('GitHub API rate limit reached. Try again later.')
  }

  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status}).`)
  }

  return response.json()
}

export async function fetchProfile(username) {
  const login = username.trim()
  const [user, repos] = await Promise.all([
    githubFetch(`/users/${encodeURIComponent(login)}`),
    githubFetch(`/users/${encodeURIComponent(login)}/repos?per_page=100&sort=updated`),
  ])

  const languageCounts = {}
  for (const repo of repos) {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
    }
  }

  const languages = Object.entries(languageCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 8)

  return { user, repos, languages, topRepos }
}
