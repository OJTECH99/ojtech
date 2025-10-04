import apiClient from './apiClient';

interface GithubRepository {
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  topics: string[];
}

interface GitHubProject {
  name: string;
  url: string;
  description?: string;
  technologies?: string[];
  stars?: number;
  forks?: number;
  lastUpdated?: string;
  readme?: string;
}

/**
 * Fetches repository details from GitHub API
 * @param repoUrl The full GitHub repository URL (e.g., https://github.com/username/repository)
 * @returns Promise with the parsed repository details
 */
const fetchRepositoryDetails = async (repoUrl: string): Promise<GitHubProject> => {
  try {
    // Extract owner and repo name from URL
    // URL format: https://github.com/owner/repo
    const urlParts = repoUrl.split('/');
    if (urlParts.length < 5) {
      throw new Error('Invalid GitHub repository URL format');
    }
    
    const owner = urlParts[urlParts.length - 2];
    const repo = urlParts[urlParts.length - 1];
    
    // Call GitHub API
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    
    const data: GithubRepository = await response.json();
    
    // Get language data (technologies)
    const languagesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    let technologies: string[] = [];
    if (languagesResponse.ok) {
      const languagesData = await languagesResponse.json();
      technologies = Object.keys(languagesData);
    }
    
    // Add topics if available
    if (data.topics && data.topics.length > 0) {
      technologies = [...new Set([...technologies, ...data.topics])];
    }
    
    // If language is not already in technologies, add it
    if (data.language && !technologies.includes(data.language)) {
      technologies.unshift(data.language);
    }
    
    // Try to fetch the README content
    let readme: string | undefined;
    try {
      readme = await fetchRepositoryReadme(owner, repo);
    } catch (error) {
      console.log('README not found, skipping');
      // No readme found, continue without it
    }
    
    // Format to match our application's project structure
    return {
      name: data.name,
      url: data.html_url,
      description: data.description || '',
      technologies: technologies,
      stars: data.stargazers_count,
      forks: data.forks_count,
      lastUpdated: data.updated_at,
      readme
    };
  } catch (error: any) {
    console.error('Error fetching GitHub repository details:', error);
    
    // Return basic info from URL if API call fails
    const urlParts = repoUrl.split('/');
    const repoName = urlParts[urlParts.length - 1] || 'Unknown Project';
    
    return {
      name: repoName,
      url: repoUrl,
      description: '',
      technologies: []
    };
  }
};

/**
 * Fetches the README content from a GitHub repository
 * @param owner The repository owner (username or organization)
 * @param repo The repository name
 * @returns Promise with the README content as Markdown
 */
const fetchRepositoryReadme = async (owner: string, repo: string): Promise<string> => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: {
      'Accept': 'application/vnd.github.v3.raw'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch README: ${response.statusText}`);
  }
  
  // Return the raw README content
  return await response.text();
};

/**
 * Extracts a summary from the README content
 * @param readme The full README content
 * @param maxLength Maximum length of the summary in characters
 * @returns A summarized version of the README
 */
const extractReadmeSummary = (readme: string, maxLength: number = 500): string => {
  if (!readme) return '';
  
  // Remove Markdown links, images, and headers
  let clean = readme
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with just their text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // Remove images
    .replace(/<img[^>]*>/g, '') // Remove HTML images
    .replace(/#{1,6} /g, '') // Remove headers
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/<\/?[^>]+(>|$)/g, ''); // Remove HTML tags
  
  // Split by lines and find the first paragraph with meaningful content
  const lines = clean.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Find the first paragraph that's not just a heading or short line
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length > 30) { // Assume this is a proper paragraph
      // Get the content until maxLength
      return lines[i].length <= maxLength 
        ? lines[i] 
        : lines[i].substring(0, maxLength) + '...';
    }
  }
  
  // If no good paragraph found, just return the first part of the README
  return clean.length <= maxLength 
    ? clean 
    : clean.substring(0, maxLength) + '...';
};

/**
 * Enhances project description using basic information
 * @param description Original brief description
 * @param technologies List of technologies used
 * @param stats Additional stats like stars and last update
 * @returns Enhanced description for display
 */
const enhanceProjectDescription = (
  description: string,
  technologies: string[],
  stats: { stars?: number, forks?: number, lastUpdated?: string }
): string => {
  if (!description || description.trim() === '') {
    return `A project built with ${technologies.slice(0, 3).join(', ')}${technologies.length > 3 ? ' and more' : ''}.`;
  }
  
  // Format last updated date if available
  let enhancedDesc = description;
  if (stats.lastUpdated) {
    const date = new Date(stats.lastUpdated);
    const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    
    if (stats.stars && stats.stars > 0) {
      enhancedDesc += ` This project has ${stats.stars} ${stats.stars === 1 ? 'star' : 'stars'} on GitHub and was last updated in ${formattedDate}.`;
    }
  }
  
  return enhancedDesc;
};

/**
 * Extracts GitHub username from a repository URL
 * @param repoUrl The full GitHub repository URL (e.g., https://github.com/username/repository)
 * @returns The extracted GitHub username or undefined if not found
 */
const extractGitHubUsername = (repoUrl: string): string | undefined => {
  try {
    if (!repoUrl || typeof repoUrl !== 'string') return undefined;
    
    // Check if this is a GitHub URL
    if (!repoUrl.includes('github.com')) return undefined;
    
    // Extract owner from URL
    // URL format: https://github.com/owner/repo
    const urlParts = repoUrl.split('/');
    if (urlParts.length < 5) return undefined;
    
    // Username is the part after github.com
    return urlParts[urlParts.length - 2];
  } catch (error) {
    console.error('Error extracting GitHub username:', error);
    return undefined;
  }
};

export default {
  fetchRepositoryDetails,
  fetchRepositoryReadme,
  extractReadmeSummary,
  enhanceProjectDescription,
  extractGitHubUsername
}; 