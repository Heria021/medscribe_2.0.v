# Patient Portal - Settings, Records & Complete Feature Documentation

## 📋 Table of Contents
1. [Settings Pages](#settings-pages)
2. [Medical Records](#medical-records)
3. [Floating Chat Widget](#floating-chat-widget)
4. [Loading States & Skeletons](#loading-states--skeletons)
5. [Error Handling UI](#error-handling-ui)
6. [Responsive Design Details](#responsive-design-details)

---

## ⚙️ Settings Pages

### **Profile Settings** (`/patient/settings/profile`)

#### **Profile Form Layout**
```typescript
<DashboardLayout>
  <div className="max-w-4xl mx-auto space-y-6">
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
      <p className="text-muted-foreground">
        Manage your personal information and medical details
      </p>
    </div>

    <Tabs defaultValue="personal" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="personal">Personal Info</TabsTrigger>
        <TabsTrigger value="medical">Medical History</TabsTrigger>
        <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your basic personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                    <SelectItem value="P">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</DashboardLayout>
```

**Profile Settings Features**:
- **Tabbed Interface**: Organized sections for different information types
- **Form Validation**: Real-time validation with error messages
- **Auto-save**: Saves changes automatically after user stops typing
- **Required Fields**: Visual indicators for mandatory information
- **Privacy Controls**: Options for data sharing preferences
- **Purpose**: Comprehensive profile management with user-friendly interface

#### **Medical History Tab**
```typescript
<TabsContent value="medical" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Heart className="h-5 w-5" />
        Medical History
      </CardTitle>
      <CardDescription>
        Manage your medical conditions, allergies, and family history
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      {/* Allergies Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Allergies</Label>
          <Button variant="outline" size="sm" onClick={() => setShowAddAllergy(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Allergy
          </Button>
        </div>
        <div className="grid gap-2">
          {allergies?.map((allergy) => (
            <div key={allergy._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">{allergy.allergen}</p>
                <p className="text-sm text-muted-foreground">
                  {allergy.reaction} • Severity: {allergy.severity}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveAllergy(allergy._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Conditions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Current Conditions</Label>
          <Button variant="outline" size="sm" onClick={() => setShowAddCondition(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
        </div>
        <div className="grid gap-2">
          {medicalConditions?.map((condition) => (
            <div key={condition._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">{condition.name}</p>
                <p className="text-sm text-muted-foreground">
                  Diagnosed: {format(new Date(condition.diagnosedDate), "MMM yyyy")}
                </p>
              </div>
              <Badge variant={condition.status === "active" ? "default" : "secondary"}>
                {condition.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

**Medical History Features**:
- **Dynamic Lists**: Add/remove allergies and conditions
- **Severity Indicators**: Color-coded severity levels
- **Status Tracking**: Active vs. resolved conditions
- **Date Tracking**: When conditions were diagnosed
- **Quick Actions**: Easy add/remove functionality
- **Purpose**: Comprehensive medical history management

### **Account Settings** (`/patient/settings/account`)

#### **Security Settings**
```typescript
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Shield className="h-5 w-5" />
      Security & Privacy
    </CardTitle>
    <CardDescription>
      Manage your account security and privacy preferences
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-base">Two-Factor Authentication</Label>
          <p className="text-sm text-muted-foreground">
            Add an extra layer of security to your account
          </p>
        </div>
        <Switch
          checked={twoFactorEnabled}
          onCheckedChange={handleToggleTwoFactor}
        />
      </div>
      
      <Separator />
      
      <div className="space-y-3">
        <Label className="text-base">Change Password</Label>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.new}
              onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
            />
          </div>
          <Button onClick={handlePasswordChange} disabled={!isPasswordFormValid}>
            Update Password
          </Button>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

**Security Features**:
- **Two-Factor Authentication**: Toggle for enhanced security
- **Password Management**: Secure password change workflow
- **Privacy Controls**: Data sharing preferences
- **Session Management**: View and manage active sessions
- **Account Deletion**: Secure account deletion process
- **Purpose**: Comprehensive account security management

---

## 📁 Medical Records (`/patient/records`)

### **Coming Soon Interface**
```typescript
<DashboardLayout>
  <div className="space-y-6 h-full flex flex-col">
    <div className="flex-shrink-0">
      <h1 className="text-xl font-bold tracking-tight">Medical Records</h1>
      <p className="text-muted-foreground text-sm">
        View and manage your medical records and documents
      </p>
    </div>

    <div className="flex-1 min-h-0 space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Medical Records</CardTitle>
          <CardDescription>
            This feature is coming soon! You'll be able to view all your medical records, 
            test results, and documents here.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Eye className="h-5 w-5" />
              <span>View Records</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Download className="h-5 w-5" />
              <span>Download Files</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>Track History</span>
            </div>
          </div>
          <Button disabled className="mt-6">
            Coming Soon
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</DashboardLayout>
```

**Planned Features**:
- **Document Viewer**: PDF and image viewing capabilities
- **Download Options**: Export records in various formats
- **Search Functionality**: Find specific records quickly
- **Categorization**: Organize by type, date, provider
- **Sharing**: Secure sharing with healthcare providers
- **Purpose**: Centralized medical document management

---

## 💬 Floating Chat Widget

### **Widget Implementation**
```typescript
<div className="fixed bottom-4 right-4 z-50">
  {isExpanded ? (
    <Card className="w-80 h-96 flex flex-col shadow-lg">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Quick Chat
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full p-3">
          <div className="space-y-2">
            {quickChatMessages.map((message) => (
              <div key={message.id} className="text-sm">
                <div className={cn(
                  "p-2 rounded-lg max-w-[80%]",
                  message.sender === "user" 
                    ? "bg-primary text-primary-foreground ml-auto" 
                    : "bg-muted"
                )}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-3 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={quickMessage}
              onChange={(e) => setQuickMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendQuickMessage()}
              className="text-sm"
            />
            <Button size="sm" onClick={handleSendQuickMessage}>
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Button
      onClick={() => setIsExpanded(true)}
      className="rounded-full w-12 h-12 shadow-lg"
    >
      <MessageCircle className="h-5 w-5" />
    </Button>
  )}
</div>
```

**Widget Features**:
- **Expandable Interface**: Minimized button expands to full chat
- **Quick Access**: Available on all pages
- **Message History**: Maintains conversation context
- **Responsive Design**: Adapts to screen size
- **Purpose**: Instant communication access from anywhere

---

## ⏳ Loading States & Skeletons

### **Dashboard Skeleton**
```typescript
function DashboardSkeleton() {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-4">
        {/* Header Skeleton */}
        <div className="flex-shrink-0 space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* AI Assistant Card Skeleton */}
        <div className="flex-shrink-0">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-6 w-12 ml-auto" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-3 w-full" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

**Skeleton Features**:
- **Accurate Layout**: Matches actual content structure
- **Smooth Animation**: Subtle shimmer effect
- **Responsive Design**: Adapts to different screen sizes
- **Performance**: Lightweight placeholder content
- **Purpose**: Maintains layout stability during loading

---

## 🚨 Error Handling UI

### **Error Boundary Component**
```typescript
function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              We encountered an unexpected error. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <details className="text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Error details
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
            <div className="flex gap-2">
              <Button onClick={resetErrorBoundary} className="flex-1">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/patient/dashboard"}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
```

**Error Handling Features**:
- **User-Friendly Messages**: Clear, non-technical language
- **Recovery Options**: Try again or navigate home
- **Error Details**: Collapsible technical information
- **Consistent Design**: Matches overall application style
- **Purpose**: Graceful error recovery with user guidance

---

## 📱 Responsive Design Details

### **Breakpoint Strategy**
```css
/* Mobile First Approach */
.container {
  padding: 1rem; /* Mobile: 16px */
}

@media (min-width: 640px) {
  .container {
    padding: 1.5rem; /* Tablet: 24px */
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 2rem; /* Desktop: 32px */
  }
}
```

### **Grid Adaptations**
- **Mobile**: Single column layout
- **Tablet**: 2-column grid for cards
- **Desktop**: 3-5 column complex grids
- **Large Desktop**: Maximum width constraints

### **Navigation Adaptations**
- **Mobile**: Collapsible sidebar with overlay
- **Tablet**: Persistent sidebar with icons
- **Desktop**: Full sidebar with labels
- **Touch Targets**: Minimum 44px for mobile interactions

This comprehensive documentation covers every aspect of the patient portal's UI, from major page layouts to minor interactive details, providing a complete reference for developers and designers working on the healthcare platform.
