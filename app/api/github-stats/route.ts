import { NextRequest, NextResponse } from 'next/server';

interface CommitData {
  month: string;
  commits: number;
}

interface GitHubStats {
  user: any;
  repos: number;
  languages: Array<{ name: string; count: number }>;
  commits: CommitData[];
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalStars: number;
  totalForks: number;
  contributions: number;
  mostActiveDay: string;
  mostActiveMonth: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    );
  }

  try {
    const headers = {
      Accept: 'application/vnd.github.v3+json',
      // Add your GitHub token here for higher rate limits
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    };

    // Fetch user data
    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers,
    });

    if (!userRes.ok) {
      if (userRes.status === 404) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      if (userRes.status === 403) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch user data: ${userRes.status}` },
        { status: userRes.status }
      );
    }
    const userData = await userRes.json();

    // Fetch repositories
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { headers }
    );
    if (!reposRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch repositories' },
        { status: reposRes.status }
      );
    }
    const repos = await reposRes.json();

    // Process repository data
    const languages: Record<string, number> = {};
    let totalStars = 0;
    let totalForks = 0;

    repos.forEach((repo: any) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
      totalStars += repo.stargazers_count;
      totalForks += repo.forks_count;
    });

    // Fetch commits for 2025 from each repository
    const monthlyCommits = Array(12).fill(0);
    const dayMap: Record<string, number> = {};
    let totalCommits = 0;

    const currentYear = new Date().getFullYear();
    const since = `${currentYear}-01-01T00:00:00Z`;
    const until = `${currentYear}-12-31T23:59:59Z`;

    // Limit to first 30 repos to avoid rate limits
    const reposToFetch = repos.slice(0, 30);

    await Promise.all(
      reposToFetch.map(async (repo: any) => {
        try {
          // Fetch commits for this repo
          const commitsRes = await fetch(
            `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?since=${since}&until=${until}&per_page=100&author=${username}`,
            { headers }
          );

          if (commitsRes.ok) {
            const commits = await commitsRes.json();

            commits.forEach((commit: any) => {
              const commitDate = new Date(commit.commit.author.date);
              const month = commitDate.getMonth();
              const year = commitDate.getFullYear();

              if (year === currentYear) {
                monthlyCommits[month]++;
                totalCommits++;

                // Track by day
                const dateKey = `${year}-${String(month + 1).padStart(
                  2,
                  '0'
                )}-${String(commitDate.getDate()).padStart(2, '0')}`;
                dayMap[dateKey] = (dayMap[dateKey] || 0) + 1;
              }
            });
          }
        } catch (error) {
          console.error(`Error fetching commits for ${repo.name}:`, error);
        }
      })
    );

    // Fetch events for PRs and Issues
    const eventsRes = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=100`,
      { headers }
    );
    let events = [];
    if (eventsRes.ok) {
      events = await eventsRes.json();
    }

    const totalPRs = events.filter(
      (e: any) => e.type === 'PullRequestEvent'
    ).length;
    const totalIssues = events.filter(
      (e: any) => e.type === 'IssuesEvent'
    ).length;

    // Find most active day
    let mostActiveDayKey: string | null = null;
    let mostActiveDayCommits = -1;

    Object.entries(dayMap).forEach(([key, count]) => {
      if (count > mostActiveDayCommits) {
        mostActiveDayCommits = count;
        mostActiveDayKey = key;
      }
    });

    let mostActiveDay = '-';
    if (mostActiveDayKey) {
      const [y, m, d] = mostActiveDayKey.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const day = dateObj.getDate();
      const monthName = dateObj.toLocaleString('en-US', { month: 'short' });
      mostActiveDay = `${day} ${monthName}`;
    }

    // Process language data
    const languageData = Object.entries(languages)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Process commit data by month
    const commitData = monthlyCommits.map((commits, i) => ({
      month: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ][i],
      commits,
    }));

    // Find most active month
    const mostActiveMonthObj = commitData.reduce(
      (best, m) => (m.commits > best.commits ? m : best),
      { month: '-', commits: -1 }
    );
    const mostActiveMonth = mostActiveMonthObj.month;

    const stats: GitHubStats = {
      user: userData,
      repos: repos.length,
      languages: languageData,
      commits: commitData,
      totalCommits,
      totalPRs,
      totalIssues,
      totalStars,
      totalForks,
      contributions: events.length,
      mostActiveDay,
      mostActiveMonth,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching GitHub data:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
