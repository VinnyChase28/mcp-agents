'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calculator, 
  FileText, 
  Globe, 
  Folder,
  CheckCircle,
  Clock,
  AlertCircle,
  Wrench
} from 'lucide-react';

export interface ToolUsage {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'error';
  timestamp: Date;
  duration?: number;
  arguments?: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

interface ToolSidebarProps {
  toolUsages: ToolUsage[];
}

const toolIcons = {
  add: Calculator,
  multiply: Calculator,
  divide: Calculator,
  read_file: FileText,
  write_file: FileText,
  list_directory: Folder,
  get_request: Globe,
  post_request: Globe,
} as const;

const toolCategories = {
  calculator: ['add', 'multiply', 'divide'],
  'file-manager': ['read_file', 'write_file', 'list_directory'],
  'api-client': ['get_request', 'post_request'],
} as const;

function getToolIcon(toolName: string) {
  const IconComponent = toolIcons[toolName as keyof typeof toolIcons] || Wrench;
  return IconComponent;
}

function getToolCategory(toolName: string): string {
  for (const [category, tools] of Object.entries(toolCategories)) {
    if ((tools as readonly string[]).includes(toolName)) {
      return category;
    }
  }
  return 'unknown';
}

function getStatusIcon(status: ToolUsage['status']) {
  switch (status) {
    case 'active':
      return <Clock className="h-3 w-3 text-blue-500" />;
    case 'completed':
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-3 w-3 text-red-500" />;
  }
}

function getStatusColor(status: ToolUsage['status']) {
  switch (status) {
    case 'active':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatArguments(args: Record<string, unknown>): string {
  const entries = Object.entries(args);
  if (entries.length === 0) return '';
  
  return entries
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join(', ');
}

export function ToolSidebar({ toolUsages }: ToolSidebarProps) {
  const recentUsages = toolUsages.slice(0, 10); // Show last 10 tool usages
  
  // Group by category
  const categorizedUsages = recentUsages.reduce((acc, usage) => {
    const category = getToolCategory(usage.name);
    if (!acc[category]) acc[category] = [];
    acc[category].push(usage);
    return acc;
  }, {} as Record<string, ToolUsage[]>);

  const activeTools = toolUsages.filter(usage => usage.status === 'active');

  return (
    <Card className="w-80 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Tool Activity
        </CardTitle>
        {activeTools.length > 0 && (
          <Badge variant="secondary" className="w-fit">
            {activeTools.length} active
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-8rem)] px-4">
          {recentUsages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tools used yet</p>
              <p className="text-sm mt-1">
                Try asking for calculations, file operations, or web requests!
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {Object.entries(categorizedUsages).map(([category, usages]) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground capitalize">
                    {category.replace('-', ' ')} Tools
                  </h3>
                  <div className="space-y-2">
                    {usages.map((usage) => {
                      const IconComponent = getToolIcon(usage.name);
                      return (
                        <div
                          key={usage.id}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                        >
                          <div className="flex-shrink-0">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {usage.name}
                              </span>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(usage.status)}
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getStatusColor(usage.status)}`}
                                >
                                  {usage.status}
                                </Badge>
                              </div>
                            </div>
                            
                            {usage.arguments && (
                              <div className="text-xs text-muted-foreground mb-1">
                                {formatArguments(usage.arguments)}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {usage.timestamp.toLocaleTimeString()}
                              </span>
                              {usage.duration && (
                                <span>
                                  {formatDuration(usage.duration)}
                                </span>
                              )}
                            </div>
                            
                            {usage.error && (
                              <div className="text-xs text-red-600 mt-1 p-2 bg-red-50 rounded">
                                {usage.error}
                              </div>
                            )}
                            
                            {usage.status === 'completed' && (
                              <div className="text-xs text-green-600 mt-1 p-2 bg-green-50 rounded">
                                ✓ Completed successfully
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 