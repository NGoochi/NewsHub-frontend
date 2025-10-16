import { Article, Quote } from '@/types';

/**
 * Escapes CSV field values to handle commas, quotes, and newlines
 */
function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Converts an array of objects to CSV format
 */
function arrayToCSV(data: Record<string, any>[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.map(escapeCsvField).join(',');
  
  const csvRows = data.map(row => 
    headers.map(header => escapeCsvField(String(row[header] || ''))).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Downloads a CSV file to the user's device
 */
function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Formats a date string for CSV export
 */
function formatDateForCSV(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

/**
 * Exports selected articles to CSV format
 */
export function exportArticlesToCSV(
  articles: Article[], 
  selectedArticleIds: string[], 
  quotesData: Quote[],
  projectName: string = 'NewsHub Project'
): void {
  if (selectedArticleIds.length === 0) {
    throw new Error('No articles selected for export');
  }

  // Filter articles to only selected ones
  const selectedArticles = articles.filter(article => 
    selectedArticleIds.includes(article.id)
  );

  // Create a map of quotes for quick lookup
  const quotesMap = new Map<string, Quote[]>();
  quotesData.forEach(quote => {
    if (selectedArticleIds.includes(quote.articleId)) {
      const existing = quotesMap.get(quote.articleId) || [];
      quotesMap.set(quote.articleId, [...existing, quote]);
    }
  });

  // Convert articles to CSV format
  const csvData = selectedArticles.map(article => {
    const quotes = quotesMap.get(article.id) || [];
    
    return {
      // Basic article information
      'Title': article.title,
      'Author': article.author || 'Unknown',
      'Source': article.newsOutlet || 'Unknown',
      'URL': article.url || '',
      'Publication Date': formatDateForCSV(article.dateWritten),
      'Input Method': article.inputMethod || 'unknown',
      
      // Analysis results
      'Analysis Status': article.analysedAt ? 'Analyzed' : 'Pending',
      'Analysis Date': article.analysedAt ? formatDateForCSV(article.analysedAt) : '',
      'Summary': article.summaryGemini || '',
      'Category': article.categoryGemini || '',
      'Sentiment': article.sentimentGemini || '',
      
      // Quote information
      'Quote Count': quotes.length,
      'Stakeholders': quotes.map(q => q.stakeholderNameGemini || 'Unknown').join('; '),
      'Quote Text': quotes.map(q => `"${q.stakeholderNameGemini || 'Unknown'}": ${q.quoteText}`).join(' | '),
      
      // Full article content
      'Full Text': article.fullBodyText || '',
      
      // Technical fields
      'Article ID': article.id,
      'Created At': formatDateForCSV(article.createdAt),
      'Updated At': formatDateForCSV(article.updatedAt)
    };
  });

  // Generate CSV content
  const csvContent = arrayToCSV(csvData);
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const filename = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_articles_${timestamp}.csv`;
  
  // Download the CSV file
  downloadCSV(csvContent, filename);
}

/**
 * Exports quotes from selected articles to CSV format
 */
export function exportQuotesToCSV(
  articles: Article[],
  selectedArticleIds: string[],
  quotesData: Quote[],
  projectName: string = 'NewsHub Project'
): void {
  if (selectedArticleIds.length === 0) {
    throw new Error('No articles selected for export');
  }

  // Filter quotes to only those from selected articles
  const selectedQuotes = quotesData.filter(quote => 
    selectedArticleIds.includes(quote.articleId)
  );

  if (selectedQuotes.length === 0) {
    throw new Error('No quotes found in selected articles');
  }

  // Create a map of articles for quick lookup
  const articlesMap = new Map<string, Article>();
  articles.forEach(article => {
    if (selectedArticleIds.includes(article.id)) {
      articlesMap.set(article.id, article);
    }
  });

  // Convert quotes to CSV format
  const csvData = selectedQuotes.map(quote => {
    const article = articlesMap.get(quote.articleId);
    
    return {
      'Quote ID': quote.id,
      'Article Title': article?.title || 'Unknown Article',
      'Article Author': article?.author || 'Unknown',
      'Article Source': article?.newsOutlet || 'Unknown',
      'Article URL': article?.url || '',
      'Publication Date': article ? formatDateForCSV(article.dateWritten) : '',
      
      // Quote information
      'Stakeholder Name': quote.stakeholderNameGemini || 'Unknown',
      'Stakeholder Affiliation': quote.stakeholderAffiliationGemini || '',
      'Quote Text': quote.quoteText || '',
      'Quote Context': quote.contextGemini || '',
      
      // Technical fields
      'Article ID': quote.articleId,
      'Created At': formatDateForCSV(quote.createdAt),
      'Updated At': formatDateForCSV(quote.updatedAt)
    };
  });

  // Generate CSV content
  const csvContent = arrayToCSV(csvData);
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const filename = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_quotes_${timestamp}.csv`;
  
  // Download the CSV file
  downloadCSV(csvContent, filename);
}
