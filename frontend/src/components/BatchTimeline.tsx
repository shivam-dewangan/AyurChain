import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authAPI } from '@/api/client';
import { CheckCircle, Clock, Package, AlertCircle } from 'lucide-react';

interface BatchTimelineProps {
  batchId: string;
}

const BatchTimeline = ({ batchId }: BatchTimelineProps) => {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (batchId) {
      fetchTimeline();
      
      // Set up real-time subscription for batch changes
      const subscription = supabase
        .channel(`batch_changes_${batchId}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'batch_changes',
            filter: `batch_id=eq.${batchId}`
          },
          (payload) => {
            console.log('New batch change received:', payload);
            fetchTimeline(); // Refresh timeline when new change is added
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [batchId]);

  const fetchTimeline = async () => {
    try {
      console.log('Fetching timeline for batch:', batchId);
      
      const { data, error } = await supabase
        .from('batch_changes')
        .select('*')
        .eq('batch_id', batchId)
        .eq('field_name', 'status')
        .order('changed_at', { ascending: true });

      console.log('Timeline data:', data);
      console.log('Timeline error:', error);

      if (error) {
        console.error('Timeline fetch error:', error);
        setTimeline([]);
      } else {
        setTimeline(data || []);
      }
    } catch (error) {
      console.error('Failed to load timeline:', error);
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending_approval': return Clock;
      case 'approved': return CheckCircle;
      case 'in_process': return Clock;
      case 'quality_check': return AlertCircle;
      case 'packaging': return Package;
      case 'ready_for_sale': return Package;
      case 'shipped': return CheckCircle;
      case 'delivered': return CheckCircle;
      case 'sold': return CheckCircle;
      case 'unavailable': return AlertCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending_approval': return 'text-yellow-600';
      case 'approved': return 'text-green-600';
      case 'in_process': return 'text-blue-600';
      case 'quality_check': return 'text-orange-600';
      case 'packaging': return 'text-purple-600';
      case 'ready_for_sale': return 'text-green-600';
      case 'shipped': return 'text-blue-600';
      case 'delivered': return 'text-green-600';
      case 'sold': return 'text-gray-600';
      case 'unavailable': return 'text-red-600';
      default: return 'text-gray-600';
    }
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

  // Filter unique status changes (remove duplicates)
  const uniqueTimeline = timeline.reduce((acc: any[], current) => {
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Status Timeline</CardTitle>
          <button 
            onClick={fetchTimeline}
            className="text-xs text-primary hover:underline"
          >
            Refresh
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {uniqueTimeline.length} status changes
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {uniqueTimeline.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm">
            No status changes recorded yet
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto pr-2 space-y-3">
            {uniqueTimeline.map((change, index) => {
              const Icon = getStatusIcon(change.new_value);
              const isLast = index === uniqueTimeline.length - 1;
              
              return (
                <div key={change.id || index} className="relative flex items-start gap-3">
                  {!isLast && (
                    <div className="absolute left-3 top-6 w-0.5 h-8 bg-border" />
                  )}
                  
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border bg-background flex items-center justify-center ${getStatusColor(change.new_value)}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                      <p className="font-medium text-sm">
                        {change.new_value?.replace(/_/g, ' ').toUpperCase()}
                      </p>
                      <Badge variant="outline" className="text-xs w-fit">
                        Updated
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(change.changed_at).toLocaleString()}
                    </p>
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