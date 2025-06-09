"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Clock, 
  ArrowLeft,
  Stethoscope,
  Save,
  Plus,
  Trash2,
  Settings
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface WorkingHours {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

interface ScheduleSettings {
  workingHours: WorkingHours[];
  appointmentDuration: number;
  bufferTime: number;
  maxAdvanceBooking: number;
  allowWeekendAppointments: boolean;
  autoConfirmAppointments: boolean;
  emergencySlots: number;
}

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

export default function DoctorScheduleSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState<ScheduleSettings>({
    workingHours: daysOfWeek.map(day => ({
      day,
      enabled: !["Saturday", "Sunday"].includes(day),
      startTime: "09:00",
      endTime: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00"
    })),
    appointmentDuration: 30,
    bufferTime: 15,
    maxAdvanceBooking: 30,
    allowWeekendAppointments: false,
    autoConfirmAppointments: true,
    emergencySlots: 2
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "doctor") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const handleWorkingHoursChange = (dayIndex: number, field: keyof WorkingHours, value: any) => {
    setSettings(prev => ({
      ...prev,
      workingHours: prev.workingHours.map((day, index) => 
        index === dayIndex ? { ...day, [field]: value } : day
      )
    }));
  };

  const handleSettingChange = (field: keyof ScheduleSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Here you would save the settings to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Schedule settings saved",
        description: "Your schedule preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "doctor") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/doctor/settings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-tight">Schedule & Availability</h1>
              <p className="text-muted-foreground text-sm">
                Manage your working hours and appointment preferences
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Stethoscope className="h-3 w-3" />
              Doctor Account
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full scrollbar-hide">
            <div className="space-y-6">
              {/* Working Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Working Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settings.workingHours.map((daySchedule, index) => (
                    <div key={daySchedule.day} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-20">
                        <Switch
                          checked={daySchedule.enabled}
                          onCheckedChange={(value) => handleWorkingHoursChange(index, 'enabled', value)}
                        />
                      </div>
                      <div className="w-24 font-medium text-sm">
                        {daySchedule.day}
                      </div>
                      {daySchedule.enabled ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Select
                            value={daySchedule.startTime}
                            onValueChange={(value) => handleWorkingHoursChange(index, 'startTime', value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-sm text-muted-foreground">to</span>
                          <Select
                            value={daySchedule.endTime}
                            onValueChange={(value) => handleWorkingHoursChange(index, 'endTime', value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-sm text-muted-foreground mx-2">Break:</span>
                          <Select
                            value={daySchedule.breakStart}
                            onValueChange={(value) => handleWorkingHoursChange(index, 'breakStart', value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-sm text-muted-foreground">to</span>
                          <Select
                            value={daySchedule.breakEnd}
                            onValueChange={(value) => handleWorkingHoursChange(index, 'breakEnd', value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="flex-1 text-sm text-muted-foreground">
                          Not available
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Appointment Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Appointment Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Appointment Duration (minutes)</Label>
                      <Select
                        value={settings.appointmentDuration.toString()}
                        onValueChange={(value) => handleSettingChange('appointmentDuration', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Buffer Time Between Appointments (minutes)</Label>
                      <Select
                        value={settings.bufferTime.toString()}
                        onValueChange={(value) => handleSettingChange('bufferTime', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No buffer</SelectItem>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Maximum Advance Booking (days)</Label>
                      <Input
                        type="number"
                        value={settings.maxAdvanceBooking}
                        onChange={(e) => handleSettingChange('maxAdvanceBooking', parseInt(e.target.value))}
                        min="1"
                        max="365"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Emergency Slots per Day</Label>
                      <Input
                        type="number"
                        value={settings.emergencySlots}
                        onChange={(e) => handleSettingChange('emergencySlots', parseInt(e.target.value))}
                        min="0"
                        max="10"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow Weekend Appointments</Label>
                        <p className="text-sm text-muted-foreground">Enable patients to book appointments on weekends</p>
                      </div>
                      <Switch
                        checked={settings.allowWeekendAppointments}
                        onCheckedChange={(value) => handleSettingChange('allowWeekendAppointments', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Auto-Confirm Appointments</Label>
                        <p className="text-sm text-muted-foreground">Automatically confirm new appointment requests</p>
                      </div>
                      <Switch
                        checked={settings.autoConfirmAppointments}
                        onCheckedChange={(value) => handleSettingChange('autoConfirmAppointments', value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </DashboardLayout>
  );
}
