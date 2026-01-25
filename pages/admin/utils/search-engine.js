/**
 * Advanced Search Engine
 * Provides intelligent search functionality across all admin data
 */

class SearchEngine {
    constructor() {
        this.indices = new Map();
        this.searchHistory = [];
        this.maxHistorySize = 50;
        this.searchFilters = new Map();
        this.searchOperators = ['AND', 'OR', 'NOT', '(', ')'];
        
        this.initializeIndices();
    }

    initializeIndices() {
        // Initialize search indices for different data types
        this.indices.set('users', new Map());
        this.indices.set('events', new Map());
        this.indices.set('payments', new Map());
        this.indices.set('ideas', new Map());
        this.indices.set('messages', new Map());
    }

    // Index data for fast searching
    indexData(type, items) {
        console.log(`🔍 Indexing ${items.length} ${type} items...`);
        
        const index = this.indices.get(type) || new Map();
        
        items.forEach(item => {
            const searchableText = this.extractSearchableText(type, item);
            const tokens = this.tokenize(searchableText);
            
            tokens.forEach(token => {
                if (!index.has(token)) {
                    index.set(token, new Set());
                }
                index.get(token).add(item.id);
            });
        });
        
        this.indices.set(type, index);
        console.log(`✅ Indexed ${type}: ${index.size} unique tokens`);
    }

    extractSearchableText(type, item) {
        let text = '';
        
        switch (type) {
            case 'users':
                text = [
                    item.name,
                    item.email,
                    item.college,
                    item.program,
                    item.role,
                    item.status,
                    item.phone,
                    item.studentId
                ].filter(Boolean).join(' ');
                break;
                
            case 'events':
                text = [
                    item.title,
                    item.description,
                    item.type,
                    item.category,
                    item.location,
                    item.status,
                    item.organizer,
                    item.tags?.join(' ')
                ].filter(Boolean).join(' ');
                break;
                
            case 'payments':
                text = [
                    item.transactionId,
                    item.userName,
                    item.userEmail,
                    item.method,
                    item.status,
                    item.reference,
                    item.description,
                    item.purpose
                ].filter(Boolean).join(' ');
                break;
                
            case 'ideas':
                text = [
                    item.title,
                    item.description,
                    item.category,
                    item.status,
                    item.submitterName,
                    item.submitterCollege,
                    item.tags?.join(' ')
                ].filter(Boolean).join(' ');
                break;
                
            case 'messages':
                text = [
                    item.subject,
                    item.content,
                    item.type,
                    item.status,
                    item.recipientType,
                    item.senderName
                ].filter(Boolean).join(' ');
                break;
        }
        
        return text.toLowerCase();
    }

    tokenize(text) {
        // Advanced tokenization with stemming and normalization
        return text
            .toLowerCase()
            .replace(/[^\w\s@.-]/g, ' ') // Keep alphanumeric, @, ., -
            .split(/\s+/)
            .filter(token => token.length > 1) // Remove single characters
            .map(token => this.stem(token)); // Apply stemming
    }

    stem(word) {
        // Simple stemming algorithm
        const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'sion', 'ness'];
        
        for (const suffix of suffixes) {
            if (word.endsWith(suffix) && word.length > suffix.length + 2) {
                return word.slice(0, -suffix.length);
            }
        }
        
        return word;
    }

    // Advanced search with query parsing
    search(query, type = 'all', options = {}) {
        const startTime = performance.now();
        
        // Parse the search query
        const parsedQuery = this.parseQuery(query);
        
        // Get search results
        let results;
        if (type === 'all') {
            results = this.searchAllTypes(parsedQuery, options);
        } else {
            results = this.searchType(type, parsedQuery, options);
        }
        
        // Apply filters
        if (options.filters) {
            results = this.applyFilters(results, options.filters);
        }
        
        // Sort results by relevance
        results = this.sortByRelevance(results, query);
        
        // Apply pagination
        if (options.limit) {
            results = results.slice(0, options.limit);
        }
        
        const endTime = performance.now();
        
        // Add to search history
        this.addToHistory(query, type, results.length, endTime - startTime);
        
        return {
            query,
            type,
            results,
            totalResults: results.length,
            searchTime: endTime - startTime,
            suggestions: this.generateSuggestions(query, results)
        };
    }

    parseQuery(query) {
        // Parse advanced search syntax
        const tokens = query.toLowerCase().split(/\s+/);
        const parsed = {
            terms: [],
            phrases: [],
            exclude: [],
            operators: []
        };
        
        let currentPhrase = '';
        let inPhrase = false;
        let excludeNext = false;
        
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            
            if (token.startsWith('"')) {
                inPhrase = true;
                currentPhrase = token.slice(1);
                continue;
            }
            
            if (token.endsWith('"') && inPhrase) {
                currentPhrase += ' ' + token.slice(0, -1);
                parsed.phrases.push(currentPhrase);
                inPhrase = false;
                currentPhrase = '';
                continue;
            }
            
            if (inPhrase) {
                currentPhrase += ' ' + token;
                continue;
            }
            
            if (token === '-' || token === 'NOT') {
                excludeNext = true;
                continue;
            }
            
            if (this.searchOperators.includes(token.toUpperCase())) {
                parsed.operators.push(token.toUpperCase());
                continue;
            }
            
            if (excludeNext) {
                parsed.exclude.push(token);
                excludeNext = false;
            } else {
                parsed.terms.push(token);
            }
        }
        
        return parsed;
    }

    searchAllTypes(parsedQuery, options) {
        const allResults = [];
        
        for (const [type, index] of this.indices) {
            const typeResults = this.searchType(type, parsedQuery, options);
            allResults.push(...typeResults.map(result => ({ ...result, type })));
        }
        
        return allResults;
    }

    searchType(type, parsedQuery, options) {
        const index = this.indices.get(type);
        if (!index) return [];
        
        const matchingIds = new Set();
        
        // Search for terms
        parsedQuery.terms.forEach(term => {
            const stemmed = this.stem(term);
            
            // Exact match
            if (index.has(stemmed)) {
                index.get(stemmed).forEach(id => matchingIds.add(id));
            }
            
            // Partial match
            for (const [indexTerm, ids] of index) {
                if (indexTerm.includes(stemmed) || stemmed.includes(indexTerm)) {
                    ids.forEach(id => matchingIds.add(id));
                }
            }
        });
        
        // Search for phrases
        parsedQuery.phrases.forEach(phrase => {
            const phraseTokens = this.tokenize(phrase);
            const phraseIds = this.findPhrase(type, phraseTokens);
            phraseIds.forEach(id => matchingIds.add(id));
        });
        
        // Exclude terms
        parsedQuery.exclude.forEach(term => {
            const stemmed = this.stem(term);
            if (index.has(stemmed)) {
                index.get(stemmed).forEach(id => matchingIds.delete(id));
            }
        });
        
        // Convert IDs to actual data
        return this.getItemsByIds(type, Array.from(matchingIds));
    }

    findPhrase(type, tokens) {
        // Find items containing all tokens in sequence
        const index = this.indices.get(type);
        const matchingIds = new Set();
        
        // This is a simplified phrase search
        // In a real implementation, you'd need position indexing
        const firstToken = tokens[0];
        if (index.has(firstToken)) {
            const candidateIds = Array.from(index.get(firstToken));
            
            candidateIds.forEach(id => {
                const item = this.getItemById(type, id);
                if (item) {
                    const text = this.extractSearchableText(type, item);
                    const phrase = tokens.join(' ');
                    if (text.includes(phrase)) {
                        matchingIds.add(id);
                    }
                }
            });
        }
        
        return Array.from(matchingIds);
    }

    getItemsByIds(type, ids) {
        // This would typically fetch from your data store
        // For now, return mock data structure
        return ids.map(id => ({ id, type, score: 1 }));
    }

    getItemById(type, id) {
        // This would typically fetch a single item from your data store
        return { id, type };
    }

    applyFilters(results, filters) {
        return results.filter(result => {
            for (const [key, value] of Object.entries(filters)) {
                if (result[key] !== value) {
                    return false;
                }
            }
            return true;
        });
    }

    sortByRelevance(results, originalQuery) {
        const queryTokens = this.tokenize(originalQuery);
        
        return results.sort((a, b) => {
            const scoreA = this.calculateRelevanceScore(a, queryTokens);
            const scoreB = this.calculateRelevanceScore(b, queryTokens);
            return scoreB - scoreA;
        });
    }

    calculateRelevanceScore(item, queryTokens) {
        let score = 0;
        const text = this.extractSearchableText(item.type, item);
        const itemTokens = this.tokenize(text);
        
        queryTokens.forEach(queryToken => {
            itemTokens.forEach(itemToken => {
                if (itemToken === queryToken) {
                    score += 10; // Exact match
                } else if (itemToken.includes(queryToken) || queryToken.includes(itemToken)) {
                    score += 5; // Partial match
                }
            });
        });
        
        return score;
    }

    generateSuggestions(query, results) {
        const suggestions = [];
        
        // Suggest corrections for typos
        const corrections = this.suggestCorrections(query);
        suggestions.push(...corrections);
        
        // Suggest related terms
        const related = this.suggestRelatedTerms(query, results);
        suggestions.push(...related);
        
        // Suggest filters
        const filters = this.suggestFilters(results);
        suggestions.push(...filters);
        
        return suggestions.slice(0, 5); // Limit to 5 suggestions
    }

    suggestCorrections(query) {
        // Simple typo correction using Levenshtein distance
        const corrections = [];
        const queryTokens = this.tokenize(query);
        
        queryTokens.forEach(token => {
            for (const [type, index] of this.indices) {
                for (const indexToken of index.keys()) {
                    const distance = this.levenshteinDistance(token, indexToken);
                    if (distance === 1 && indexToken.length > 3) {
                        corrections.push({
                            type: 'correction',
                            original: token,
                            suggestion: indexToken,
                            query: query.replace(token, indexToken)
                        });
                    }
                }
            }
        });
        
        return corrections.slice(0, 2);
    }

    suggestRelatedTerms(query, results) {
        // Suggest terms that appear frequently with search results
        const related = [];
        const queryTokens = new Set(this.tokenize(query));
        const termFrequency = new Map();
        
        results.forEach(result => {
            const text = this.extractSearchableText(result.type, result);
            const tokens = this.tokenize(text);
            
            tokens.forEach(token => {
                if (!queryTokens.has(token)) {
                    termFrequency.set(token, (termFrequency.get(token) || 0) + 1);
                }
            });
        });
        
        const sortedTerms = Array.from(termFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        sortedTerms.forEach(([term, frequency]) => {
            related.push({
                type: 'related',
                term,
                query: `${query} ${term}`,
                frequency
            });
        });
        
        return related;
    }

    suggestFilters(results) {
        // Suggest filters based on result distribution
        const filters = [];
        const typeDistribution = new Map();
        
        results.forEach(result => {
            typeDistribution.set(result.type, (typeDistribution.get(result.type) || 0) + 1);
        });
        
        for (const [type, count] of typeDistribution) {
            if (count > 1) {
                filters.push({
                    type: 'filter',
                    filterType: type,
                    count,
                    label: `Show only ${type} (${count})`
                });
            }
        }
        
        return filters;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    addToHistory(query, type, resultCount, searchTime) {
        const historyEntry = {
            query,
            type,
            resultCount,
            searchTime,
            timestamp: new Date()
        };
        
        this.searchHistory.unshift(historyEntry);
        
        if (this.searchHistory.length > this.maxHistorySize) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
        }
    }

    getSearchHistory() {
        return this.searchHistory;
    }

    getPopularSearches(limit = 10) {
        const queryFrequency = new Map();
        
        this.searchHistory.forEach(entry => {
            queryFrequency.set(entry.query, (queryFrequency.get(entry.query) || 0) + 1);
        });
        
        return Array.from(queryFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([query, frequency]) => ({ query, frequency }));
    }

    clearHistory() {
        this.searchHistory = [];
    }

    // Export search index for backup
    exportIndex() {
        const exportData = {};
        
        for (const [type, index] of this.indices) {
            exportData[type] = Object.fromEntries(
                Array.from(index.entries()).map(([key, value]) => [key, Array.from(value)])
            );
        }
        
        return exportData;
    }

    // Import search index from backup
    importIndex(exportData) {
        for (const [type, indexData] of Object.entries(exportData)) {
            const index = new Map();
            
            for (const [key, value] of Object.entries(indexData)) {
                index.set(key, new Set(value));
            }
            
            this.indices.set(type, index);
        }
    }
}

// Global search engine instance
window.searchEngine = new SearchEngine();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchEngine;
}