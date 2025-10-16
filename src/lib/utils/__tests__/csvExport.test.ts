/**
 * Basic tests for CSV export functionality
 * These tests verify that the CSV export functions work correctly
 */

import { exportArticlesToCSV, exportQuotesToCSV } from '../csvExport';
import { Article, Quote } from '@/types';

// Mock data for testing
const mockArticles: Article[] = [
  {
    id: 'article-1',
    title: 'Test Article 1',
    author: 'John Doe',
    newsOutlet: 'Test News',
    url: 'https://example.com/article1',
    fullBodyText: 'This is the full body text of article 1.',
    dateWritten: '2025-01-10T10:00:00Z',
    inputMethod: 'newsapi',
    summaryGemini: 'This is a test summary',
    categoryGemini: 'Technology',
    sentimentGemini: 'Positive',
    analysedAt: '2025-01-10T11:00:00Z',
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-01-10T11:00:00Z',
    projectId: 'project-1'
  },
  {
    id: 'article-2',
    title: 'Test Article 2',
    author: 'Jane Smith',
    newsOutlet: 'Another News',
    url: 'https://example.com/article2',
    fullBodyText: 'This is the full body text of article 2.',
    dateWritten: '2025-01-11T10:00:00Z',
    inputMethod: 'manual',
    summaryGemini: 'This is another test summary',
    categoryGemini: 'Politics',
    sentimentGemini: 'Negative',
    analysedAt: null,
    createdAt: '2025-01-11T09:00:00Z',
    updatedAt: '2025-01-11T09:00:00Z',
    projectId: 'project-1'
  }
];

const mockQuotes: Quote[] = [
  {
    id: 'quote-1',
    articleId: 'article-1',
    stakeholderNameGemini: 'Alice Johnson',
    stakeholderAffiliationGemini: 'Tech Corp',
    quoteText: 'This is a test quote from Alice.',
    contextGemini: 'Alice was speaking about technology trends.',
    createdAt: '2025-01-10T11:30:00Z',
    updatedAt: '2025-01-10T11:30:00Z'
  },
  {
    id: 'quote-2',
    articleId: 'article-1',
    stakeholderNameGemini: 'Bob Wilson',
    stakeholderAffiliationGemini: 'Innovation Labs',
    quoteText: 'Another test quote from Bob.',
    contextGemini: 'Bob was discussing future innovations.',
    createdAt: '2025-01-10T11:35:00Z',
    updatedAt: '2025-01-10T11:35:00Z'
  }
];

// Mock the downloadCSV function to prevent actual file downloads during tests
const mockDownloadCSV = jest.fn();
jest.mock('../csvExport', () => ({
  ...jest.requireActual('../csvExport'),
  downloadCSV: mockDownloadCSV
}));

describe('CSV Export Functions', () => {
  beforeEach(() => {
    mockDownloadCSV.mockClear();
  });

  describe('exportArticlesToCSV', () => {
    it('should export selected articles to CSV format', () => {
      const selectedIds = ['article-1'];
      const projectName = 'Test Project';

      expect(() => {
        exportArticlesToCSV(mockArticles, selectedIds, mockQuotes, projectName);
      }).not.toThrow();

      // Verify that downloadCSV was called with proper parameters
      expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      const [csvContent, filename] = mockDownloadCSV.mock.calls[0];
      
      // Check that CSV content contains expected data
      expect(csvContent).toContain('Title');
      expect(csvContent).toContain('Author');
      expect(csvContent).toContain('Source');
      expect(csvContent).toContain('Test Article 1');
      expect(csvContent).toContain('John Doe');
      expect(csvContent).toContain('Test News');
      
      // Check filename format
      expect(filename).toMatch(/Test_Project_articles_\d{4}-\d{2}-\d{2}\.csv/);
    });

    it('should throw error when no articles are selected', () => {
      const selectedIds: string[] = [];
      const projectName = 'Test Project';

      expect(() => {
        exportArticlesToCSV(mockArticles, selectedIds, mockQuotes, projectName);
      }).toThrow('No articles selected for export');
    });

    it('should handle articles with quotes correctly', () => {
      const selectedIds = ['article-1'];
      const projectName = 'Test Project';

      exportArticlesToCSV(mockArticles, selectedIds, mockQuotes, projectName);

      const [csvContent] = mockDownloadCSV.mock.calls[0];
      
      // Check that quote information is included
      expect(csvContent).toContain('Quote Count');
      expect(csvContent).toContain('Stakeholders');
      expect(csvContent).toContain('Alice Johnson');
      expect(csvContent).toContain('Bob Wilson');
      expect(csvContent).toContain('2'); // Quote count
    });
  });

  describe('exportQuotesToCSV', () => {
    it('should export quotes from selected articles to CSV format', () => {
      const selectedIds = ['article-1'];
      const projectName = 'Test Project';

      expect(() => {
        exportQuotesToCSV(mockArticles, selectedIds, mockQuotes, projectName);
      }).not.toThrow();

      // Verify that downloadCSV was called with proper parameters
      expect(mockDownloadCSV).toHaveBeenCalledTimes(1);
      const [csvContent, filename] = mockDownloadCSV.mock.calls[0];
      
      // Check that CSV content contains expected quote data
      expect(csvContent).toContain('Quote ID');
      expect(csvContent).toContain('Article Title');
      expect(csvContent).toContain('Stakeholder Name');
      expect(csvContent).toContain('Quote Text');
      expect(csvContent).toContain('Alice Johnson');
      expect(csvContent).toContain('Bob Wilson');
      expect(csvContent).toContain('Test Article 1');
      
      // Check filename format
      expect(filename).toMatch(/Test_Project_quotes_\d{4}-\d{2}-\d{2}\.csv/);
    });

    it('should throw error when no articles are selected', () => {
      const selectedIds: string[] = [];
      const projectName = 'Test Project';

      expect(() => {
        exportQuotesToCSV(mockArticles, selectedIds, mockQuotes, projectName);
      }).toThrow('No articles selected for export');
    });

    it('should throw error when no quotes are found in selected articles', () => {
      const selectedIds = ['article-2']; // Article 2 has no quotes
      const projectName = 'Test Project';

      expect(() => {
        exportQuotesToCSV(mockArticles, selectedIds, mockQuotes, projectName);
      }).toThrow('No quotes found in selected articles');
    });
  });

  describe('CSV Format Validation', () => {
    it('should properly escape CSV fields with commas and quotes', () => {
      const articleWithSpecialChars: Article = {
        ...mockArticles[0],
        title: 'Article with "quotes" and, commas',
        fullBodyText: 'Text with\nnewlines and "quotes"'
      };

      const selectedIds = ['article-1'];
      const projectName = 'Test Project';

      exportArticlesToCSV([articleWithSpecialChars], selectedIds, mockQuotes, projectName);

      const [csvContent] = mockDownloadCSV.mock.calls[0];
      
      // Check that special characters are properly escaped
      expect(csvContent).toContain('"Article with ""quotes"" and, commas"');
      expect(csvContent).toContain('"Text with\nnewlines and ""quotes"""');
    });
  });
});
