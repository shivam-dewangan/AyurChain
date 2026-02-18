import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { batchesAPI } from '@/api/client';
import { CheckCircle, Clock, Package, AlertCircle, Scissors, Sparkles, Sun, User, ArrowRight } from 'lucide-react';

const BatchTimeline = ({ batchId }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (batchId) {
      fetchTimeline();
    }
  }, [batchId]);

  const fetchTimeline = async () => {
    try {
      const result = await batchesAPI.getTimeline(batchId);
      if (!result.success) {
        setTimeline([]);
      } else {
        const normalizedTimeline = (result.data || [])
          .filter((item) => item.fieldName === 'status')
          .map((item) => ({
            id: item._id || item.id,
            old_value: item.oldValue,
            new_value: item.newValue,
            changed_at: item.changedAt || item.createdAt,
            changedBy: item.changedBy,
            role: item.changedBy?.role
          }));
        setTimeline(normalizedTimeline);
      }
    } catch (error) {
      console.error('Failed to load timeline:', error);
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending_approval': return Clock;
      case 'approved_by_admin': return User;
      case 'approved': return CheckCircle;
      case 'harvested': return Package;
      case 'processing': return Scissors;
      case 'cleaning': return Sparkles;
      case 'drying': return Sun;
      case 'ready_for_sale': return Package;
      case 'sold': return CheckCircle;
      case 'packaging': return Package;
      case 'shipped': return Package;
      case 'delivered': return CheckCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending_approval': return 'text-yellow-600 border-yellow-200';
      case 'approved_by_admin': return 'text-blue-600 border-blue-200';
      case 'approved': return 'text-green-600 border-green-200';
      case 'harvested': return 'text-blue-600 border-blue-200';
      case 'processing': return 'text-purple-600 border-purple-200';
      case 'cleaning': return 'text-cyan-600 border-cyan-200';
      case 'drying': return 'text-orange-600 border-orange-200';
      case 'ready_for_sale': return 'text-green-600 border-green-200';
      case 'sold': return 'text-gray-600 border-gray-200';
      case 'packaging': return 'text-indigo-600 border-indigo-200';
      case 'shipped': return 'text-blue-600 border-blue-200';
      case 'delivered': return 'text-green-600 border-green-200';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending_approval: 'Batch Created',
      approved_by_admin: 'Approved by Admin',
      approved: 'Approved',
      harvested: 'Harvested',
      processing: 'Processing',
      cleaning: 'Cleaning',
      drying: 'Drying',
      ready_for_sale: 'Ready for Sale',
      sold: 'Sold',
      packaging: 'Packaging',
      shipped: 'Shipped',
      delivered: 'Delivered'
    };
    return labels[status] || status.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="text-center text-muted-foreground">Loading timeline...</div>
        </CardContent>
      </Card>
    );
  }

  if (!batchId) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="text-center text-muted-foreground">No batch selected</div>
        </CardContent>
      </Card>
    );
  }

  const uniqueTimeline = timeline.reduce((acc, current) => {
    const existing = acc.find(item => 
      item.new_value === current.new_value && 
      Math.abs(new Date(item.changed_at).getTime() - new Date(current.changed_at).getTime()) < 60000
    );
    if (!existing) {
      acc.push(current);
    }
    return acc;
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Complete Status Timeline</CardTitle>
          <button 
            onClick={fetchTimeline}
            className="text-xs text-primary hover:underline"
          >
            Refresh
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {uniqueTimeline.length} status changes recorded
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {uniqueTimeline.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm">
            No status changes recorded yet
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
            {uniqueTimeline.map((change, index) => {
              const Icon = getStatusIcon(change.new_value);
              const isLast = index === uniqueTimeline.length - 1;
              const colorClass = getStatusColor(change.new_value);
              
              return (
                <div key={change._id || change.id || `timeline-${index}`} className="relative">
                  {!isLast && (
                    <div className="absolute left-3 top-8 w-0.5 h-10 bg-border" />
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 bg-background flex items-center justify-center ${colorClass}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                        <p className="font-semibold text-sm">
                          {getStatusLabel(change.new_value)}
                        </p>
                        <Badge variant="outline" className="text-xs w-fit">
                          Step {index + 1}
                        </Badge>
                      </div>
                      
                      {change.old_value && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <span>{getStatusLabel(change.old_value)}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="font-medium">{getStatusLabel(change.new_value)}</span>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        <p>📅 {new Date(change.changed_at).toLocaleDateString()}</p>
                        <p>🕐 {new Date(change.changed_at).toLocaleTimeString()}</p>
                      </div>
                      
                      {change.changedBy && (
                        <div className="mt-2 text-xs">
                          {change.role === 'admin' ? (
                            <Badge variant="secondary" className="text-xs">👨‍💼 Updated by Admin</Badge>
                          ) : change.role === 'farmer' ? (
                            <Badge variant="secondary" className="text-xs">👨‍🌾 Updated by Farmer</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">👤 Updated by {change.changedBy.fullName || 'User'}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BatchTimeline;

