package com.melardev.spring.jwtoauth.dtos.admin;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class BulkOperationResult {

    private boolean success;
    private String message;
    private int totalRequested;
    private int successCount;
    private int failureCount;
    private List<BulkOperationItem> results;
    private LocalDateTime executedAt;
    private String executedBy;
    private BulkOperationType operationType;

    // Constructors
    public BulkOperationResult() {
        this.results = new ArrayList<>();
        this.executedAt = LocalDateTime.now();
    }

    public BulkOperationResult(BulkOperationType operationType, int totalRequested) {
        this();
        this.operationType = operationType;
        this.totalRequested = totalRequested;
    }

    public BulkOperationResult(BulkOperationType operationType, int totalRequested, String executedBy) {
        this(operationType, totalRequested);
        this.executedBy = executedBy;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getTotalRequested() {
        return totalRequested;
    }

    public void setTotalRequested(int totalRequested) {
        this.totalRequested = totalRequested;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getFailureCount() {
        return failureCount;
    }

    public void setFailureCount(int failureCount) {
        this.failureCount = failureCount;
    }

    public List<BulkOperationItem> getResults() {
        return results;
    }

    public void setResults(List<BulkOperationItem> results) {
        this.results = results;
    }

    public LocalDateTime getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(LocalDateTime executedAt) {
        this.executedAt = executedAt;
    }

    public String getExecutedBy() {
        return executedBy;
    }

    public void setExecutedBy(String executedBy) {
        this.executedBy = executedBy;
    }

    public BulkOperationType getOperationType() {
        return operationType;
    }

    public void setOperationType(BulkOperationType operationType) {
        this.operationType = operationType;
    }

    // Helper methods
    public void addSuccessResult(UUID itemId, String message) {
        this.results.add(new BulkOperationItem(itemId, true, message));
        this.successCount++;
        updateSuccess();
    }

    public void addFailureResult(UUID itemId, String errorMessage) {
        this.results.add(new BulkOperationItem(itemId, false, errorMessage));
        this.failureCount++;
        updateSuccess();
    }

    public void addResult(BulkOperationItem item) {
        this.results.add(item);
        if (item.isSuccess()) {
            this.successCount++;
        } else {
            this.failureCount++;
        }
        updateSuccess();
    }

    private void updateSuccess() {
        this.success = failureCount == 0 && successCount > 0;
        updateMessage();
    }

    private void updateMessage() {
        if (totalRequested == 0) {
            this.message = "No items to process";
        } else if (failureCount == 0) {
            this.message = String.format("Successfully processed all %d items", successCount);
        } else if (successCount == 0) {
            this.message = String.format("Failed to process all %d items", failureCount);
        } else {
            this.message = String.format("Processed %d/%d items successfully (%d failed)", 
                    successCount, totalRequested, failureCount);
        }
    }

    public double getSuccessRate() {
        if (totalRequested == 0) return 0.0;
        return (double) successCount / totalRequested * 100;
    }

    public boolean isPartialSuccess() {
        return successCount > 0 && failureCount > 0;
    }

    public boolean isCompleteSuccess() {
        return successCount > 0 && failureCount == 0;
    }

    public boolean isCompleteFailure() {
        return successCount == 0 && failureCount > 0;
    }

    public List<BulkOperationItem> getSuccessfulResults() {
        return results.stream().filter(BulkOperationItem::isSuccess).toList();
    }

    public List<BulkOperationItem> getFailedResults() {
        return results.stream().filter(item -> !item.isSuccess()).toList();
    }

    // Inner class for individual operation results
    public static class BulkOperationItem {
        private UUID itemId;
        private boolean success;
        private String message;
        private LocalDateTime processedAt;

        public BulkOperationItem() {
            this.processedAt = LocalDateTime.now();
        }

        public BulkOperationItem(UUID itemId, boolean success, String message) {
            this();
            this.itemId = itemId;
            this.success = success;
            this.message = message;
        }

        // Getters and Setters
        public UUID getItemId() {
            return itemId;
        }

        public void setItemId(UUID itemId) {
            this.itemId = itemId;
        }

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public LocalDateTime getProcessedAt() {
            return processedAt;
        }

        public void setProcessedAt(LocalDateTime processedAt) {
            this.processedAt = processedAt;
        }

        @Override
        public String toString() {
            return "BulkOperationItem{" +
                    "itemId=" + itemId +
                    ", success=" + success +
                    ", message='" + message + '\'' +
                    '}';
        }
    }

    // Enum for bulk operation types
    public enum BulkOperationType {
        DELETE("Delete"),
        UPDATE_STATUS("Update Status"),
        UPDATE_PRIORITY("Update Priority"),
        SET_FEATURED("Set Featured"),
        MODERATE("Moderate"),
        APPROVE("Approve"),
        REJECT("Reject"),
        TRANSFER_EMPLOYER("Transfer Employer"),
        UPDATE_CATEGORY("Update Category"),
        EXPORT("Export");

        private final String displayName;

        BulkOperationType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    @Override
    public String toString() {
        return "BulkOperationResult{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", operationType=" + operationType +
                ", totalRequested=" + totalRequested +
                ", successCount=" + successCount +
                ", failureCount=" + failureCount +
                ", successRate=" + String.format("%.1f%%", getSuccessRate()) +
                ", executedAt=" + executedAt +
                ", executedBy='" + executedBy + '\'' +
                '}';
    }
}