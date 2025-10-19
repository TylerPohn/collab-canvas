# Canvas Management System Testing Guide

This guide provides comprehensive testing instructions for the Canvas Management System implemented in PR #29.

## 🧪 Testing Checklist

### 1. **Gallery Page Button Error Fix**

- [ ] Navigate to `/gallery` page
- [ ] Verify page loads without "Button is not defined" error
- [ ] Test "Try Again" button in error state
- [ ] Test "Clear Search" button in no results state
- [ ] Verify all buttons are properly styled and functional

### 2. **Canvas Creation Flashing Fix**

- [ ] Navigate to `/dashboard`
- [ ] Click "Create Canvas" button
- [ ] Verify smooth transition without flashing warning/error pages
- [ ] Check that loading states are stable and don't flicker
- [ ] Verify canvas loads properly after creation

### 3. **Toolbar Menu Implementation**

- [ ] Open any canvas
- [ ] Click the three-dot menu (⋮) in the toolbar
- [ ] Verify menu opens with options:
  - [ ] "Back to Dashboard" - navigates to dashboard
  - [ ] "Canvas Settings" - logs to console (placeholder)
  - [ ] "Share Canvas" - logs to console (placeholder)
- [ ] Test menu positioning and styling
- [ ] Verify menu closes when clicking outside

### 4. **Thumbnail Generation**

- [ ] Create a new canvas
- [ ] Add some shapes (rectangles, circles, text)
- [ ] Wait 2 seconds for debounced thumbnail generation
- [ ] Check browser network tab for thumbnail upload
- [ ] Navigate to dashboard and verify thumbnail appears
- [ ] Test with different shape types and layouts

### 5. **Canvas Access Control Testing**

#### **Private Canvas Access**

- [ ] Create a new canvas (defaults to private)
- [ ] Share the canvas URL with another user
- [ ] Verify other user gets "Access Denied" page
- [ ] Verify owner can access and edit the canvas

#### **Link-Based Sharing**

- [ ] Create a canvas and set access type to "link"
- [ ] Share the canvas URL
- [ ] Verify anyone with the link can access
- [ ] Test with password protection (if implemented)

#### **Public Canvas Access**

- [ ] Create a canvas and set access type to "public"
- [ ] Verify canvas appears in gallery
- [ ] Test accessing public canvas without authentication
- [ ] Verify public canvas shows in gallery search

#### **Guest Access (Default Canvas)**

- [ ] Navigate to `/canvas/default-canvas` without authentication
- [ ] Verify guest user banner appears
- [ ] Test creating, editing, and deleting shapes as guest
- [ ] Verify guest name is generated and persisted
- [ ] Test sign-up prompts in guest banner

### 6. **Dashboard and Gallery Functionality**

#### **Dashboard Testing**

- [ ] Login and navigate to `/dashboard`
- [ ] Verify user's canvases are displayed
- [ ] Test search functionality
- [ ] Test sorting options (recent, modified, name)
- [ ] Test "Create Canvas" button
- [ ] Verify canvas cards show thumbnails and metadata

#### **Gallery Testing**

- [ ] Navigate to `/gallery`
- [ ] Verify public canvases are displayed
- [ ] Test search functionality
- [ ] Test sorting options (recent, name, popular)
- [ ] Test clicking on canvas cards
- [ ] Verify empty state when no public canvases

### 7. **Canvas Management Features**

#### **Canvas Settings**

- [ ] Open canvas settings (via toolbar menu)
- [ ] Test changing canvas name
- [ ] Test changing canvas description
- [ ] Test changing access type (private/link/public)
- [ ] Test password protection for link-based access

#### **Canvas Sharing**

- [ ] Open share dialog (via toolbar menu)
- [ ] Test copying canvas link
- [ ] Test generating shareable links
- [ ] Test sharing with different access levels

### 8. **Error Handling and Edge Cases**

#### **Network Error Handling**

- [ ] Disconnect internet and test canvas operations
- [ ] Verify appropriate error messages
- [ ] Test reconnection and data sync

#### **Authentication Edge Cases**

- [ ] Test session expiration during canvas editing
- [ ] Test switching between authenticated and guest modes
- [ ] Test concurrent access by multiple users

#### **Data Persistence**

- [ ] Test canvas data persistence across browser refreshes
- [ ] Test viewport state persistence
- [ ] Test thumbnail generation after canvas changes

### 9. **Performance Testing**

#### **Large Canvas Testing**

- [ ] Create canvas with many shapes (100+)
- [ ] Test performance during real-time collaboration
- [ ] Test thumbnail generation with complex canvases
- [ ] Test search and filtering with many canvases

#### **Real-time Collaboration**

- [ ] Test multiple users editing same canvas
- [ ] Test presence indicators
- [ ] Test cursor tracking
- [ ] Test shape synchronization

### 10. **Browser Compatibility**

- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test on mobile devices

## 🐛 Known Issues to Watch For

### **High Priority Issues**

- [ ] Gallery page button errors (should be fixed)
- [ ] Canvas creation flashing (should be fixed)
- [ ] Thumbnail generation performance with large canvases

### **Medium Priority Issues**

- [ ] Canvas settings dialog not implemented (placeholder)
- [ ] Share dialog not implemented (placeholder)
- [ ] Password protection for link-based access not implemented

### **Low Priority Issues**

- [ ] Thumbnail generation may be slow with complex shapes
- [ ] Guest user presence tracking disabled (security limitation)

## 📊 Success Criteria

### **Functionality**

- ✅ All buttons work without errors
- ✅ Canvas creation is smooth and stable
- ✅ Thumbnail generation works reliably
- ✅ Access control functions properly
- ✅ Dashboard and gallery are functional

### **User Experience**

- ✅ No flashing or jarring transitions
- ✅ Clear loading states
- ✅ Intuitive navigation
- ✅ Responsive design
- ✅ Proper error handling

### **Performance**

- ✅ Fast canvas loading
- ✅ Smooth real-time collaboration
- ✅ Efficient thumbnail generation
- ✅ Responsive UI interactions

## 🔧 Testing Tools

### **Browser Developer Tools**

- Network tab for API calls
- Console for error messages
- Performance tab for timing
- Application tab for localStorage

### **Testing Scenarios**

1. **New User Flow**: Sign up → Create canvas → Share canvas
2. **Guest User Flow**: Visit default canvas → Create shapes → Sign up
3. **Collaboration Flow**: Multiple users → Same canvas → Real-time editing
4. **Management Flow**: Dashboard → Gallery → Canvas settings

## 📝 Test Results Template

```
Test Date: ___________
Tester: ___________
Browser: ___________

### Issues Found:
1. [Issue description] - Priority: High/Medium/Low
2. [Issue description] - Priority: High/Medium/Low

### Features Working:
1. [Feature description] - Status: ✅ Working
2. [Feature description] - Status: ✅ Working

### Recommendations:
1. [Recommendation]
2. [Recommendation]
```

---

**Note**: This testing guide should be used to verify that all implemented features work correctly and to identify any remaining issues that need to be addressed.
