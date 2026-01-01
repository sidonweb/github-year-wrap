import { NextRequest, NextResponse } from 'next/server';

interface CommitData {
  week: string;
  commits: number;
}

interface DayCommit {
  date: string;
  count: number;
}

interface GitHubStats {
  user: any;
  repos: number;
  languages: Array<{ name: string; count: number }>;
  weeklyCommits: CommitData[];
  dailyCommits: DayCommit[];
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalStars: number;
  totalForks: number;
  contributions: number;
  mostActiveDay: string;
  mostActiveWeek: string;
  mostActiveMonth: string;
  mostActiveDayOfWeek: string;
  peakCommitsInDay: number;
  badges: string[];
}

function getDayOfWeek(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

function calculateBadges(stats: any): string[] {
  const badges: string[] = [];
  const { totalCommits, languages, totalStars, totalPRs } = stats;

  // Language badges
  if (languages.length > 0) {
    const topLang = languages[0].name;
    const langBadges: Record<string, string> = {
      'TypeScript': '🧙 TypeScript Wizard - Master of typed magic',
      'JavaScript': '⚡ JavaScript Ninja - Master of the dynamic arts',
      'Python': '🐍 Python Charmer - Serpent code whisperer',
      'Java': '☕ Java Architect - Builder of enterprise empires',
      'Go': '🚀 Gopher Guardian - Concurrent code crusader',
      'Rust': '🦀 Rust Warrior - Memory-safe champion',
      'C++': '⚔️ C++ Gladiator - Performance perfectionist',
      'Ruby': '💎 Ruby Artisan - Elegant code craftsman',
      'PHP': '🐘 PHP Veteran - Web backend master',
      'Swift': '🍎 Swift Pioneer - iOS innovator',
    };
    badges.push(langBadges[topLang] || `💻 ${topLang} Developer - Code creator`);
  }

  // Commit frequency badges
  if (totalCommits >= 500) {
    badges.push('🔥 Commit Machine - 500+ commits in 2025');
  } else if (totalCommits >= 250) {
    badges.push('💪 Dedicated Coder - 250+ commits strong');
  } else if (totalCommits >= 100) {
    badges.push('🌟 Consistent Contributor - 100+ commits');
  } else if (totalCommits >= 50) {
    badges.push('🌱 Growing Developer - 50+ commits');
  }

  // PR badges
  if (totalPRs >= 50) {
    badges.push('🤝 Collaboration King - 50+ pull requests');
  } else if (totalPRs >= 20) {
    badges.push('👥 Team Player - 20+ pull requests');
  }

  // Star badges
  if (totalStars >= 100) {
    badges.push('⭐ Star Collector - 100+ stars earned');
  } else if (totalStars >= 50) {
    badges.push('✨ Rising Star - 50+ stars');
  }

  // Polyglot badge
  if (languages.length >= 5) {
    badges.push('🌈 Polyglot Programmer - 5+ languages mastered');
  }

  return badges.slice(0, 3);
}

async function fetchGraphQL(query: string, variables: any, token: string) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
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
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    const now = new Date();

    // End = now (e.g. 2026-01-01Txx)
    const yearEnd = now.toISOString();

    // Start = same date last year
    const yearStart = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate(),
      0, 0, 0
    ).toISOString();




    // Main GraphQL query to get user data and contributions
    const mainQuery = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          login
          name
          avatarUrl
          bio
          company
          location
          email
          websiteUrl
          twitterUsername
          createdAt
          followers {
            totalCount
          }
          following {
            totalCount
          }
          repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: UPDATED_AT, direction: DESC}) {
            totalCount
            nodes {
              name
              stargazerCount
              forkCount
              primaryLanguage {
                name
              }
              updatedAt
              isFork
            }
          }
          contributionsCollection(from: $from, to: $to) {
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
            totalRepositoryContributions
            totalPullRequestReviewContributions
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  weekday
                }
              }
            }
          }
        }
      }
    `;

    const data = await fetchGraphQL(mainQuery, {
      username,
      from: yearStart,
      to: yearEnd,
    }, token);

    if (!data.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = data.user;
    const contributionsCollection = user.contributionsCollection;
    const calendar = contributionsCollection.contributionCalendar;

    // Process repositories
    const repos = user.repositories.nodes;
    const languages: Record<string, number> = {};
    let totalStars = 0;
    let totalForks = 0;

    repos.forEach((repo: any) => {
      if (!repo.isFork) {
        if (repo.primaryLanguage) {
          languages[repo.primaryLanguage.name] = (languages[repo.primaryLanguage.name] || 0) + 1;
        }
        totalStars += repo.stargazerCount;
        totalForks += repo.forkCount;
      }
    });

    const languageData = Object.entries(languages)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Process contribution calendar
    const dailyCommits: Record<string, number> = {};
    const weeklyCommits: Record<number, number> = {};
    const dayOfWeekCommits: Record<string, number> = {
      'Sunday': 0,
      'Monday': 0,
      'Tuesday': 0,
      'Wednesday': 0,
      'Thursday': 0,
      'Friday': 0,
      'Saturday': 0,
    };
    const monthlyCommits: Record<number, number> = {};

    let weekNumber = 1;
    calendar.weeks.forEach((week: any) => {
      let weekTotal = 0;
      week.contributionDays.forEach((day: any) => {
        const count = day.contributionCount;
        const date = day.date;

        // Daily commits
        dailyCommits[date] = count;
        weekTotal += count;

        // Day of week commits
        const dateObj = new Date(date);
        const dayName = getDayOfWeek(dateObj);
        dayOfWeekCommits[dayName] += count;

        // Monthly commits
        const month = dateObj.getMonth();
        monthlyCommits[month] = (monthlyCommits[month] || 0) + count;
      });

      // Weekly commits
      weeklyCommits[weekNumber] = weekTotal;
      weekNumber++;
    });

    // Find most active day
    let mostActiveDayKey = '';
    let peakCommitsInDay = 0;
    Object.entries(dailyCommits).forEach(([date, count]) => {
      if (count > peakCommitsInDay) {
        peakCommitsInDay = count;
        mostActiveDayKey = date;
      }
    });

    let mostActiveDay = '-';
    if (mostActiveDayKey) {
      const date = new Date(mostActiveDayKey);
      const day = date.getDate();
      const monthName = date.toLocaleString('en-US', { month: 'short' });
      mostActiveDay = `${day} ${monthName}`;
    }

    // Find most active week
    let mostActiveWeekNum = 0;
    let maxWeekCommits = 0;
    Object.entries(weeklyCommits).forEach(([week, count]) => {
      if (count > maxWeekCommits) {
        maxWeekCommits = count;
        mostActiveWeekNum = parseInt(week);
      }
    });
    const mostActiveWeek = mostActiveWeekNum > 0 ? `Week ${mostActiveWeekNum}` : '-';

    // Find most active day of week
    let mostActiveDayOfWeek = 'Monday';
    let maxDayOfWeekCommits = 0;
    Object.entries(dayOfWeekCommits).forEach(([day, count]) => {
      if (count > maxDayOfWeekCommits) {
        maxDayOfWeekCommits = count;
        mostActiveDayOfWeek = day;
      }
    });

    // Find most active month
    let mostActiveMonthNum = 0;
    let maxMonthCommits = 0;
    Object.entries(monthlyCommits).forEach(([month, count]) => {
      if (count > maxMonthCommits) {
        maxMonthCommits = count;
        mostActiveMonthNum = parseInt(month);
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mostActiveMonth = maxMonthCommits > 0 ? monthNames[mostActiveMonthNum] : '-';

    // Prepare weekly commit data
    const weeklyCommitData: CommitData[] = [];
    for (let week = 1; week <= 52; week++) {
      weeklyCommitData.push({
        week: `W${week}`,
        commits: weeklyCommits[week] || 0,
      });
    }

    // Prepare daily commit data for heatmap
    const dailyCommitData: DayCommit[] = Object.entries(dailyCommits).map(
      ([date, count]) => ({
        date,
        count,
      })
    );

    const totalCommits = contributionsCollection.totalCommitContributions;
    const totalPRs = contributionsCollection.totalPullRequestContributions;
    const totalIssues = contributionsCollection.totalIssueContributions;

    // Calculate badges
    const badges = calculateBadges({
      totalCommits,
      languages: languageData,
      totalStars,
      totalPRs,
    });

    // Format user data
    const userData = {
      login: user.login,
      name: user.name,
      avatar_url: user.avatarUrl,
      bio: user.bio,
      company: user.company,
      location: user.location,
      email: user.email,
      blog: user.websiteUrl,
      twitter_username: user.twitterUsername,
      created_at: user.createdAt,
      followers: user.followers.totalCount,
      following: user.following.totalCount,
    };

    const stats: GitHubStats = {
      user: userData,
      repos: user.repositories.totalCount,
      languages: languageData,
      weeklyCommits: weeklyCommitData,
      dailyCommits: dailyCommitData,
      totalCommits,
      totalPRs,
      totalIssues,
      totalStars,
      totalForks,
      contributions: calendar.totalContributions,
      mostActiveDay,
      mostActiveWeek,
      mostActiveMonth,
      mostActiveDayOfWeek,
      peakCommitsInDay,
      badges,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching GitHub data:', error);

    if (error.message.includes('Could not resolve to a User')) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}