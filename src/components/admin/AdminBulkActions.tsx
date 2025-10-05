import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/Checkbox';
import { Input } from '../ui/Input';

import { BulkOperationResult, BULK_OPERATIONS } from '@/lib/types/adminJob';
import { 
  Play, 
  Pause, 
  Trash2, 
  Star, 
  Flag, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface AdminBulkActionsProps {
  selectedJobIds: string[];
  onBulkOperation: (operation: string, parameters?: Record<string, any>) => Promise<void>;
  bulkOperationResult: BulkOperationResult | null;
  isProcessing: boolean;
  onClearSelection: () => void;
}

export const AdminBulkActions: React.FC<AdminBulkActionsProps> = ({
  selectedJobIds,
  onBulkOperation,
  bulkOperationResult,
  isProcessing,
  onClearSelection,
}) => {
  const [selectedOperation, setSelectedOperation] = useState<string>('');
  const [priority, setPriority] = useState<number>(1);
  const [featuredUntil, setFeaturedUntil] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleOperationSelect = (operation: string) => {
    setSelectedOperation(operation);
    if (operation === 'DELETE' || operation === 'ACTIVATE' || operation === 'DEACTIVATE') {
      setShowConfirmDialog(true);
    } else {
      executeOperation(operation);
    }
  };

  const executeOperation = async (operation: string) => {
    const parameters: Record<string, any> = {};
    
    if (operation === 'PRIORITY') {
      parameters.priority = priority;
    } else if (operation === 'FEATURE') {
      if (featuredUntil) {
        parameters.featuredUntil = new Date(featuredUntil).toISOString();
      }
    }

    await onBulkOperation(operation, parameters);
    setShowConfirmDialog(false);
    setSelectedOperation('');
  };

  const confirmOperation = () => {
    executeOperation(selectedOperation);
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'DELETE': return <Trash2 className="w-4 h-4" />;
      case 'ACTIVATE': return <Play className="w-4 h-4" />;
      case 'DEACTIVATE': return <Pause className="w-4 h-4" />;
      case 'FEATURE': return <Star className="w-4 h-4" />;
      case 'UNFEATURE': return <Star className="w-4 h-4" />;
      case 'PRIORITY': return <Flag className="w-4 h-4" />;
      default: return null;
    }
  };

  const getOperationColor = (operation: string) => {
    const config = BULK_OPERATIONS.find(op => op.value === operation);
    return config?.dangerous ? 'destructive' : 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  if (selectedJobIds.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            <Checkbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Select jobs to perform bulk actions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            Bulk Actions
            <Badge variant="secondary" className="ml-2">
              {selectedJobIds.length} selected
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
          >
            Clear Selection
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Operation Buttons */}
          <div className="flex flex-wrap gap-2">
            {BULK_OPERATIONS.map(operation => (
              <Button
                key={operation.value}
                variant={getOperationColor(operation.value)}
                size="sm"
                onClick={() => handleOperationSelect(operation.value)}
                disabled={isProcessing}
                className="flex items-center"
              >
                {getOperationIcon(operation.value)}
                <span className="ml-1">{operation.label}</span>
              </Button>
            ))}
          </div>

          {/* Operation Parameters */}
          {selectedOperation === 'PRIORITY' && (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority Level:
              </label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="10"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <Button
                size="sm"
                onClick={() => executeOperation('PRIORITY')}
                disabled={isProcessing}
              >
                Apply Priority
              </Button>
            </div>
          )}

          {selectedOperation === 'FEATURE' && (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <label htmlFor="featuredUntil" className="text-sm font-medium">
                Featured Until (optional):
              </label>
              <Input
                id="featuredUntil"
                type="datetime-local"
                value={featuredUntil}
                onChange={(e) => setFeaturedUntil(e.target.value)}
                className="w-48"
              />
              <Button
                size="sm"
                onClick={() => executeOperation('FEATURE')}
                disabled={isProcessing}
              >
                Feature Jobs
              </Button>
            </div>
          )}

          {/* Operation Result */}
          {bulkOperationResult && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(bulkOperationResult.status)}
                  <span className="font-medium">
                    Bulk {bulkOperationResult.operation} Operation
                  </span>
                </div>
                <Badge 
                  variant={
                    bulkOperationResult.status === 'COMPLETED' ? 'default' :
                    bulkOperationResult.status === 'FAILED' ? 'destructive' :
                    'secondary'
                  }
                >
                  {bulkOperationResult.status}
                </Badge>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Total Jobs:</span>
                  <span>{bulkOperationResult.totalJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span>Successful:</span>
                  <span className="text-green-600">
                    {bulkOperationResult.successfulJobs}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Failed:</span>
                  <span className="text-red-600">
                    {bulkOperationResult.failedJobs}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Time:</span>
                  <span>{bulkOperationResult.processingTimeMs}ms</span>
                </div>
              </div>

              {bulkOperationResult.errorMessage && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  {bulkOperationResult.errorMessage}
                </div>
              )}

              {bulkOperationResult.jobResults && bulkOperationResult.jobResults.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium hover:text-blue-600">
                    View Job Results ({bulkOperationResult.jobResults.length})
                  </summary>
                  <div className="mt-2 max-h-32 overflow-y-auto">
                    {bulkOperationResult.jobResults.map((result, index) => (
                      <div 
                        key={index}
                        className={`text-xs p-1 ${result.success ? 'text-green-600' : 'text-red-600'}`}
                      >
                        Job {result.jobId.slice(0, 8)}...: {result.success ? 'Success' : result.errorMessage}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Clock className="w-5 h-5 mr-2 animate-spin text-blue-500" />
              <span className="text-blue-700">Processing bulk operation...</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-2">Confirm Bulk Operation</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to {selectedOperation.toLowerCase()} {selectedJobIds.length} job(s)?
            </p>
            {selectedOperation === 'DELETE' && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                This action cannot be undone. Jobs will be permanently deleted.
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmOperation}
                variant={selectedOperation === 'DELETE' ? 'destructive' : 'default'}
              >
                Confirm {selectedOperation}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AdminBulkActions;