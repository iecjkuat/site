/**
 * Feedback Analytics Component
 * Displays comprehensive feedback analytics for event organizers
 */

class FeedbackAnalytics {
    constructor() {
        this.currentEventId = null;
        this.analyticsData = null;
    }

    async show(eventId, eventTitle) {
        this.currentEventId = eventId;
        await this.loadAnalytics();
        this.createAnalyticsModal(eventTitle);
    }

    async loadAnalytics() {
        try {
            const response = await fetch(`/api/feedback/analytics/${this.currentEventId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load analytics');
            }

            this.analyticsData = await response.json();
        } catch (error) {
            console.error('Error loading feedback analytics:', error);
            this.analyticsData = {
                analytics: { total_feedback_count: 0 },
                summary: { total_feedback: 0 },
                sentiment: { sentiment_label: 'No Data' }
            };
        }
    }

    createAnalyticsModal(eventTitle) {
        // Remove existing modal
        const existingModal = document.getElementById('feedbackAnalyticsModal');
        if (existingModal) {
            existingModal.remove();
        }

        const { analytics, summary, sentiment } = this.analyticsData;

        const modalHtml = `
            <div id="feedbackAnalyticsModal" class="analytics-modal-overlay">
                <div class="analytics-modal">
                    <div class="analytics-modal-header">
                        <div>
                            <h2>📊 Feedback Analytics</h2>
                            <p>${eventTitle}</p>
                        </div>
                        <button class="analytics-modal-close" onclick="feedbackAnalytics.close()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="analytics-modal-content">
                        <!-- Overview Stats -->
                        <div class="analytics-section">
                            <h3><i class="fas fa-chart-line"></i> Overview</h3>
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <div class="stat-value">${analytics.total_feedback_count || 0}</div>
                                    <div class="stat-label">Total Feedback</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${analytics.avg_overall_rating || 0}/5</div>
                                    <div class="stat-label">Average Rating</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${summary.recommendation_rate || 0}%</div>
                                    <div class="stat-label">Would Recommend</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-value">${analytics.approved_photos_count || 0}</div>
                                    <div class="stat-label">Photos Shared</div>
                                </div>
                            </div>
                        </div>

                        <!-- Sentiment Analysis -->
                        <div class="analytics-section">
                            <h3><i class="fas fa-heart"></i> Sentiment Analysis</h3>
                            <div class="sentiment-container">
                                <div class="sentiment-score">
                                    <div class="sentiment-circle ${this.getSentimentClass(sentiment.sentiment_score)}">
                                        <span class="sentiment-value">${sentiment.sentiment_score || 0}</span>
                                        <span class="sentiment-max">/5</span>
                                    </div>
                                    <div class="sentiment-label">${sentiment.sentiment_label}</div>
                                </div>
                                <div class="sentiment-breakdown">
                                    <div class="sentiment-item positive">
                                        <i class="fas fa-smile"></i>
                                        <span>Positive: ${sentiment.positive_feedback_count || 0}</span>
                                    </div>
                                    <div class="sentiment-item neutral">
                                        <i class="fas fa-meh"></i>
                                        <span>Neutral: ${sentiment.neutral_feedback_count || 0}</span>
                                    </div>
                                    <div class="sentiment-item negative">
                                        <i class="fas fa-frown"></i>
                                        <span>Negative: ${sentiment.negative_feedback_count || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Rating Distribution -->
                        <div class="analytics-section">
                            <h3><i class="fas fa-star"></i> Rating Distribution</h3>
                            <div class="rating-distribution">
                                ${this.createRatingDistribution(analytics)}
                            </div>
                        </div>

                        <!-- Detailed Ratings -->
                        <div class="analytics-section">
                            <h3><i class="fas fa-chart-bar"></i> Detailed Ratings</h3>
                            <div class="detailed-ratings-chart">
                                ${this.createDetailedRatingsChart(analytics)}
                            </div>
                        </div>

                        <!-- Category Ratings -->
                        ${summary.category_ratings && Object.keys(summary.category_ratings).length > 0 ? `
                        <div class="analytics-section">
                            <h3><i class="fas fa-list"></i> Category Ratings</h3>
                            <div class="category-ratings-chart">
                                ${this.createCategoryRatingsChart(summary.category_ratings)}
                            </div>
                        </div>
                        ` : ''}

                        <!-- Top Comments -->
                        ${summary.top_positive_comments && summary.top_positive_comments.length > 0 ? `
                        <div class="analytics-section">
                            <h3><i class="fas fa-comments"></i> Top Positive Comments</h3>
                            <div class="comments-list">
                                ${summary.top_positive_comments.map(comment => `
                                    <div class="comment-item">
                                        <i class="fas fa-quote-left"></i>
                                        <p>${this.truncateText(comment, 150)}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}

                        <!-- Suggestions -->
                        ${summary.top_suggestions && summary.top_suggestions.length > 0 ? `
                        <div class="analytics-section">
                            <h3><i class="fas fa-lightbulb"></i> Improvement Suggestions</h3>
                            <div class="suggestions-list">
                                ${summary.top_suggestions.map(suggestion => `
                                    <div class="suggestion-item">
                                        <i class="fas fa-arrow-right"></i>
                                        <p>${this.truncateText(suggestion, 150)}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}

                        <!-- Export Options -->
                        <div class="analytics-section">
                            <h3><i class="fas fa-download"></i> Export Data</h3>
                            <div class="export-options">
                                <button class="btn btn-outline" onclick="feedbackAnalytics.exportData('csv')">
                                    <i class="fas fa-file-csv"></i>
                                    Export CSV
                                </button>
                                <button class="btn btn-outline" onclick="feedbackAnalytics.exportData('pdf')">
                                    <i class="fas fa-file-pdf"></i>
                                    Export PDF
                                </button>
                                <button class="btn btn-outline" onclick="feedbackAnalytics.shareReport()">
                                    <i class="fas fa-share"></i>
                                    Share Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.addAnalyticsStyles();
    }

    createRatingDistribution(analytics) {
        const total = analytics.total_feedback_count || 0;
        if (total === 0) {
            return '<p class="no-data">No ratings available</p>';
        }

        const ratings = [
            { stars: 5, count: analytics.five_star_count || 0 },
            { stars: 4, count: analytics.four_star_count || 0 },
            { stars: 3, count: analytics.three_star_count || 0 },
            { stars: 2, count: analytics.two_star_count || 0 },
            { stars: 1, count: analytics.one_star_count || 0 }
        ];

        return ratings.map(rating => {
            const percentage = total > 0 ? (rating.count / total * 100).toFixed(1) : 0;
            return `
                <div class="rating-bar">
                    <div class="rating-label">
                        <span>${rating.stars} ★</span>
                        <span>${rating.count}</span>
                    </div>
                    <div class="rating-progress">
                        <div class="rating-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="rating-percentage">${percentage}%</div>
                </div>
            `;
        }).join('');
    }

    createDetailedRatingsChart(analytics) {
        const ratings = [
            { label: 'Content Quality', value: analytics.avg_content_rating || 0 },
            { label: 'Organization', value: analytics.avg_organization_rating || 0 },
            { label: 'Venue & Facilities', value: analytics.avg_venue_rating || 0 }
        ];

        return ratings.map(rating => `
            <div class="detailed-rating-item">
                <div class="rating-info">
                    <span class="rating-name">${rating.label}</span>
                    <span class="rating-score">${rating.value}/5</span>
                </div>
                <div class="rating-bar-container">
                    <div class="rating-bar-fill" style="width: ${(rating.value / 5) * 100}%"></div>
                </div>
            </div>
        `).join('');
    }

    createCategoryRatingsChart(categoryRatings) {
        return Object.entries(categoryRatings).map(([category, data]) => `
            <div class="category-rating-item">
                <div class="category-info">
                    <span class="category-name">${category}</span>
                    <span class="category-score">${data.avg_rating}/5</span>
                    <span class="category-count">(${data.count} ratings)</span>
                </div>
                <div class="category-bar-container">
                    <div class="category-bar-fill" style="width: ${(data.avg_rating / 5) * 100}%"></div>
                </div>
            </div>
        `).join('');
    }

    getSentimentClass(score) {
        if (score >= 4) return 'positive';
        if (score >= 3) return 'neutral';
        return 'negative';
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    async exportData(format) {
        try {
            const response = await fetch(`/api/feedback/export/${this.currentEventId}?format=${format}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            // Handle file download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `feedback-analytics-${this.currentEventId}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.showNotification(`Analytics exported as ${format.toUpperCase()}`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Export failed', 'error');
        }
    }

    shareReport() {
        const reportUrl = `${window.location.origin}/feedback-report/${this.currentEventId}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Event Feedback Report',
                text: 'Check out the feedback analytics for this event',
                url: reportUrl
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(reportUrl).then(() => {
                this.showNotification('Report link copied to clipboard', 'success');
            }).catch(() => {
                this.showNotification('Could not copy link', 'error');
            });
        }
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification('Analytics', message, type);
        } else {
            alert(message);
        }
    }

    close() {
        const modal = document.getElementById('feedbackAnalyticsModal');
        if (modal) {
            modal.remove();
        }
    }

    addAnalyticsStyles() {
        if (document.getElementById('feedback-analytics-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'feedback-analytics-styles';
        styles.textContent = `
            .analytics-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
                overflow-y: auto;
            }

            .analytics-modal {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                max-width: 1000px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            }

            .analytics-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 24px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            }

            .analytics-modal-header h2 {
                margin: 0 0 4px 0;
                color: #1f2937;
                font-size: 1.5rem;
                font-weight: 700;
            }

            .analytics-modal-header p {
                margin: 0;
                color: #6b7280;
                font-size: 0.875rem;
            }

            .analytics-modal-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #6b7280;
                padding: 8px;
                border-radius: 8px;
                transition: all 0.2s;
            }

            .analytics-modal-close:hover {
                background: rgba(0, 0, 0, 0.1);
                color: #ef4444;
            }

            .analytics-modal-content {
                padding: 24px;
            }

            .analytics-section {
                margin-bottom: 32px;
            }

            .analytics-section h3 {
                margin: 0 0 16px 0;
                color: #1f2937;
                font-size: 1.125rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .analytics-section h3 i {
                color: #10b981;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }

            .stat-card {
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.2);
                border-radius: 12px;
                padding: 20px;
                text-align: center;
            }

            .stat-value {
                font-size: 2rem;
                font-weight: 800;
                color: #065f46;
                margin-bottom: 4px;
            }

            .stat-label {
                color: #047857;
                font-weight: 500;
                font-size: 0.875rem;
            }

            .sentiment-container {
                display: flex;
                align-items: center;
                gap: 32px;
                flex-wrap: wrap;
            }

            .sentiment-score {
                text-align: center;
            }

            .sentiment-circle {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                margin-bottom: 12px;
                position: relative;
            }

            .sentiment-circle.positive {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
            }

            .sentiment-circle.neutral {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: white;
            }

            .sentiment-circle.negative {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
            }

            .sentiment-value {
                font-size: 2rem;
                font-weight: 800;
            }

            .sentiment-max {
                font-size: 1rem;
                opacity: 0.8;
            }

            .sentiment-label {
                font-weight: 600;
                color: #374151;
            }

            .sentiment-breakdown {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .sentiment-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border-radius: 8px;
            }

            .sentiment-item.positive {
                background: rgba(16, 185, 129, 0.1);
                color: #065f46;
            }

            .sentiment-item.neutral {
                background: rgba(245, 158, 11, 0.1);
                color: #92400e;
            }

            .sentiment-item.negative {
                background: rgba(239, 68, 68, 0.1);
                color: #991b1b;
            }

            .rating-distribution {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .rating-bar {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .rating-label {
                min-width: 60px;
                display: flex;
                justify-content: space-between;
                font-weight: 500;
            }

            .rating-progress {
                flex: 1;
                height: 20px;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 10px;
                overflow: hidden;
            }

            .rating-fill {
                height: 100%;
                background: linear-gradient(90deg, #10b981, #059669);
                transition: width 0.3s ease;
            }

            .rating-percentage {
                min-width: 50px;
                text-align: right;
                font-weight: 500;
                color: #6b7280;
            }

            .detailed-rating-item,
            .category-rating-item {
                margin-bottom: 16px;
            }

            .rating-info,
            .category-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }

            .rating-name,
            .category-name {
                font-weight: 500;
                color: #374151;
            }

            .rating-score,
            .category-score {
                font-weight: 600;
                color: #10b981;
            }

            .category-count {
                font-size: 0.875rem;
                color: #6b7280;
            }

            .rating-bar-container,
            .category-bar-container {
                height: 8px;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 4px;
                overflow: hidden;
            }

            .rating-bar-fill,
            .category-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #10b981, #059669);
                transition: width 0.3s ease;
            }

            .comments-list,
            .suggestions-list {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .comment-item,
            .suggestion-item {
                display: flex;
                gap: 12px;
                padding: 16px;
                background: rgba(0, 0, 0, 0.02);
                border-radius: 8px;
                border-left: 4px solid #10b981;
            }

            .comment-item i,
            .suggestion-item i {
                color: #10b981;
                margin-top: 2px;
            }

            .comment-item p,
            .suggestion-item p {
                margin: 0;
                color: #374151;
                line-height: 1.5;
            }

            .export-options {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }

            .export-options .btn {
                padding: 12px 20px;
                border: 1px solid rgba(16, 185, 129, 0.3);
                background: rgba(16, 185, 129, 0.1);
                color: #065f46;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
            }

            .export-options .btn:hover {
                background: rgba(16, 185, 129, 0.2);
                border-color: rgba(16, 185, 129, 0.5);
            }

            .no-data {
                text-align: center;
                color: #6b7280;
                font-style: italic;
                padding: 20px;
            }

            @media (max-width: 768px) {
                .analytics-modal {
                    margin: 10px;
                    max-height: calc(100vh - 20px);
                }

                .sentiment-container {
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }

                .export-options {
                    flex-direction: column;
                }

                .stats-grid {
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Create global instance
window.feedbackAnalytics = new FeedbackAnalytics();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedbackAnalytics;
}