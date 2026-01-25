/**
 * CMS Analytics Module
 * Handles analytics dashboard and reporting functionality
 */

import { CMSData } from './cms-data.js';

export class CMSAnalytics {
    static showAnalyticsModal() {
        const stats = CMSData.getStats();
        
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.style.cssText = `
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
            padding: 1rem;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 1rem; padding: 2rem; position: relative;">
                <button onclick="this.closest('.modal-backdrop').remove()" style="position: absolute; top: 1rem; right: 1rem; width: 2.5rem; height: 2.5rem; border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.1); color: white; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
                
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 60px; height: 60px; background: rgba(6, 182, 212, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                        <i class="fas fa-chart-bar" style="font-size: 1.5rem; color: #06b6d4;"></i>
                    </div>
                    <h2 style="font-size: 1.75rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">Content Analytics</h2>
                    <p style="color: rgba(255, 255, 255, 0.8);">Real-time overview of your content performance</p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div style="background: rgba(59, 130, 246, 0.1); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; color: #3b82f6; margin-bottom: 0.5rem;">${stats.articles}</div>
                        <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Total Articles</div>
                    </div>
                    <div style="background: rgba(16, 185, 129, 0.1); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; color: #10b981; margin-bottom: 0.5rem;">${stats.events}</div>
                        <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Active Events</div>
                    </div>
                    <div style="background: rgba(236, 72, 153, 0.1); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; color: #ec4899; margin-bottom: 0.5rem;">${stats.opportunities}</div>
                        <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Opportunities</div>
                    </div>
                    <div style="background: rgba(139, 92, 246, 0.1); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2rem; font-weight: 700; color: #8b5cf6; margin-bottom: 0.5rem;">${stats.totalViews.toLocaleString()}</div>
                        <div style="color: rgba(255, 255, 255, 0.8); font-size: 0.875rem;">Total Views</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 12px;">
                        <h3 style="color: white; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-users" style="color: #10b981;"></i>
                            Engagement Stats
                        </h3>
                        <div style="space-y: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                <span style="color: rgba(255, 255, 255, 0.8);">Event Registrations</span>
                                <span style="color: #10b981; font-weight: 600;">${stats.totalRegistrations}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                <span style="color: rgba(255, 255, 255, 0.8);">Job Applications</span>
                                <span style="color: #ec4899; font-weight: 600;">${stats.totalApplications}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                                <span style="color: rgba(255, 255, 255, 0.8);">Media Files</span>
                                <span style="color: #8b5cf6; font-weight: 600;">${stats.media}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 12px;">
                        <h3 style="color: white; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas fa-clock" style="color: #f59e0b;"></i>
                            Recent Activity
                        </h3>
                        <div style="space-y: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                <span style="color: rgba(255, 255, 255, 0.8);">Last article published</span>
                                <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">2 hours ago</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                                <span style="color: rgba(255, 255, 255, 0.8);">New event created</span>
                                <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">1 day ago</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                                <span style="color: rgba(255, 255, 255, 0.8);">Opportunity posted</span>
                                <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">3 days ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    static generateReport(type = 'summary') {
        const stats = CMSData.getStats();
        const recentActivity = CMSData.getRecentActivity(10);
        
        const report = {
            generatedAt: new Date().toISOString(),
            type: type,
            summary: stats,
            recentActivity: recentActivity,
            trends: this.calculateTrends(),
            recommendations: this.generateRecommendations(stats)
        };
        
        return report;
    }

    static calculateTrends() {
        // Mock trend calculation - in real implementation, this would analyze historical data
        return {
            articlesGrowth: '+12%',
            eventsGrowth: '+8%',
            opportunitiesGrowth: '+15%',
            engagementGrowth: '+5%'
        };
    }

    static generateRecommendations(stats) {
        const recommendations = [];
        
        if (stats.articles < 10) {
            recommendations.push('Consider publishing more articles to increase content variety');
        }
        
        if (stats.events < 5) {
            recommendations.push('Schedule more events to boost community engagement');
        }
        
        if (stats.totalViews < 1000) {
            recommendations.push('Focus on SEO and social media promotion to increase visibility');
        }
        
        return recommendations;
    }

    static exportData(format = 'json') {
        const report = this.generateReport('full');
        
        if (format === 'json') {
            const dataStr = JSON.stringify(report, null, 2);
            this.downloadFile(dataStr, 'cms-analytics.json', 'application/json');
        } else if (format === 'csv') {
            const csvData = this.convertToCSV(report);
            this.downloadFile(csvData, 'cms-analytics.csv', 'text/csv');
        }
    }

    static convertToCSV(report) {
        const headers = ['Metric', 'Value'];
        const rows = [
            ['Articles', report.summary.articles],
            ['Events', report.summary.events],
            ['Opportunities', report.summary.opportunities],
            ['Total Views', report.summary.totalViews],
            ['Total Applications', report.summary.totalApplications],
            ['Total Registrations', report.summary.totalRegistrations]
        ];
        
        const csvContent = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
        
        return csvContent;
    }

    static downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
}