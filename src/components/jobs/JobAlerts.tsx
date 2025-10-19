import React, { Component } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Switch } from "../ui/Switch";
import { Bell, Settings } from "lucide-react";
import { Button } from "../ui/Button";
import { toast } from "../ui/toast-utils";
import { AuthContext } from "../../providers/AuthProvider";

interface JobAlert {
  id: string;
  title: string;
  keywords: string[];
  location: string;
  isActive: boolean;
}

interface JobAlertsState {
  alerts: JobAlert[];
  loading: boolean;
}

export class JobAlerts extends Component<{}, JobAlertsState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: {}) {
    super(props);
    this.state = {
      alerts: [
        {
          id: "1",
          title: "Software Developer Jobs",
          keywords: ["react", "typescript", "frontend"],
          location: "Remote",
          isActive: true
        },
        {
          id: "2",
          title: "UX Designer Positions",
          keywords: ["figma", "user research", "ui"],
          location: "New York",
          isActive: false
        }
      ],
      loading: false
    };
  }

  handleToggleAlert = async (id: string) => {
    this.setState(prevState => ({
      alerts: prevState.alerts.map(alert => 
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
      )
    }));

    // Simulate API call
    const alert = this.state.alerts.find(a => a.id === id);
    const newStatus = !alert?.isActive;
    
    // Show toast notification
    toast({
      title: newStatus ? "Alert activated" : "Alert deactivated",
      description: `You will ${newStatus ? "now" : "no longer"} receive notifications for this alert`,
    });
  };

  handleCreateAlert = () => {
    // This would normally open a modal or navigate to create alert page
    toast({
      title: "Create Alert",
      description: "This feature is coming soon!",
    });
  };

  handleEditAlert = (id: string) => {
    // This would normally open edit dialog
    toast({
      title: "Edit Alert",
      description: `Editing alert ${id} - coming soon!`,
    });
  };

  render() {
    const { alerts, loading } = this.state;

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Job Alerts</CardTitle>
            <CardDescription>
              Get notified when new matching jobs are posted
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1" 
            onClick={this.handleCreateAlert}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>New Alert</span>
          </Button>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto opacity-20 mb-3" />
              <p>You haven't created any job alerts yet.</p>
              <Button variant="outline" className="mt-4" onClick={this.handleCreateAlert}>
                Create your first alert
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map(alert => (
                <div 
                  key={alert.id} 
                  className="flex items-start justify-between border rounded-lg p-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{alert.title}</h3>
                      {alert.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {alert.keywords.map((keyword, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Location: {alert.location}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={alert.isActive}
                      onCheckedChange={() => this.handleToggleAlert(alert.id)}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => this.handleEditAlert(alert.id)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
} 