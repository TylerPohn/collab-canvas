# AI Canvas Agent Testing Checklist

**IMPORTANT: Do not adjust LangChain agent - it is not in use. Focus only on OpenAI agent.**

## Section 4: AI Canvas Agent (25 points)

### Command Breadth & Capability (10 points)

**Target: 8+ distinct command types covering all categories**

#### Creation Commands (at least 2 required) ✅

- [x] **createShape** - Create rectangles, circles, or text
  - [x] "Create a red circle at position 100, 200"
  - [x] "Add a text layer that says 'Hello World'"
  - [x] "Make a 200x300 rectangle"
  - [x] "Create a green circle with radius 50"
  - [x] "Add bold text 'Welcome' in size 24"
  - [x] "Make a rectangle with stroke width 3"
  - [x] "Create a circle to the right of other shapes" (FIXED: Positional creation detection)

- [x] **createText** - Create text elements
  - [x] "Create text that says 'Welcome to our app'"
  - [x] "Add a title with font size 32"
  - [x] "Create bold text in blue color"

- [x] **createLoginForm** - Create login form with fields
  - [x] "Create a login form with username and password fields"
  - [x] "Make a login form at position 400, 100"
  - [x] "Create a login form with white background and gray border"

- [x] **createNavigationBar** - Create navigation bar
  - [x] "Build a navigation bar with 4 menu items"
  - [x] "Create a navigation bar with items: Home, About, Contact, Login"
  - [x] "Make a navigation bar at position 0, 0"

- [x] **createCardLayout** - Create card layout
  - [x] "Make a card layout with title, image, and description"
  - [x] "Create a product card with title 'iPhone 15'"
  - [x] "Design a card with image placeholder and description"

#### Manipulation Commands (at least 2 required) ⚠️

- [x] **moveShape** - Move shapes to new positions
  - [x] "Move the blue rectangle to the center" // note if existing rectangle has outline it created a new one
  - [x] "Move the circle to position 300, 400"
  - [ ] "Move the rectangle to the center of other shapes"
  - [x] "Move the circle 300px to the right" (FIXED: Tool chaining + proper tool selection)

- [x] **moveShapeByOthers** - Move relative to other shapes
  - [x] "Move the rectangle left by 50 pixels" (FIXED: Negative coordinates now allowed)
  - [x] "Move the circle to the right of other shapes" (FIXED: Positional creation detection)
  - [ ] "Move the text above the rectangle"

- [x] **resizeShape** - Resize shapes
  - [ ] "Resize the circle to be twice as big"
  - [ ] "Make the rectangle 200x150"
  - [ ] "Change the circle radius to 75"

- [x] **resizeLarger** - Make shapes larger
  - [ ] "Make the circle bigger"
  - [ ] "Increase the rectangle size"
  - [ ] "Make the text larger"

- [x] **resizeSmaller** - Make shapes smaller
  - [ ] "Make the circle smaller"
  - [ ] "Decrease the rectangle size"
  - [ ] "Make the text smaller"

- [x] **rotateShape** - Rotate shapes
  - [ ] "Rotate the text 45 degrees"
  - [ ] "Turn the rectangle 90 degrees"
  - [ ] "Rotate the circle 180 degrees"

- [x] **rotateShapeClockwise** - Rotate clockwise
  - [ ] "Rotate the text clockwise"
  - [ ] "Turn the rectangle right"

- [x] **rotateShapeCounterclockwise** - Rotate counterclockwise
  - [ ] "Rotate the text counterclockwise"
  - [ ] "Turn the rectangle left"

#### Layout Commands (at least 1 required) ✅

- [x] **arrangeInGrid** - Arrange shapes in grid
  - [x] "Arrange these shapes in a horizontal row"
  - [x] "Create a grid of 3x3 squares"
  - [x] "Arrange shapes in a 2x2 grid"

- [x] **arrangeInRow** - Arrange in horizontal row
  - [ ] "Arrange these shapes in a row"
  - [ ] "Line up the shapes horizontally"
  - [ ] "Put shapes in a horizontal line"

- [x] **spaceEvenly** - Space shapes evenly
  - [ ] "Space these elements evenly"
  - [ ] "Distribute shapes with equal gaps"
  - [ ] "Space shapes with 30px padding"

#### Complex Commands (at least 1 required) ✅

- [x] **createLoginForm** - Multi-element form creation
  - [x] "Create a login form with username and password fields"
  - [x] "Build a login form with proper styling"
  - [x] "Make a complete login interface"

- [x] **createNavigationBar** - Multi-item navigation
  - [x] "Build a navigation bar with 4 menu items"
  - [x] "Create a navigation menu with multiple links"
  - [x] "Make a header navigation bar"

- [x] **createCardLayout** - Complex card design
  - [x] "Make a card layout with title, image, and description"
  - [x] "Create a product showcase card"
  - [x] "Design a content card with multiple elements"

### Complex Command Execution (8 points)

**Target: 3+ properly arranged elements with smart positioning**

#### Login Form Creation ✅

- [x] **Username field created**
- [x] **Password field created**
- [x] **Login button created**
- [x] **Elements properly positioned relative to each other**
- [x] **Styling applied correctly (background, borders)**
- [x] **Form layout is logical and usable**

#### Navigation Bar Creation ✅

- [x] **Multiple menu items created (4+ items)**
- [x] **Items arranged horizontally**
- [x] **Proper spacing between items**
- [x] **Consistent styling across items**
- [x] **Navigation bar positioned correctly**

#### Card Layout Creation ✅

- [x] **Title text created**
- [x] **Image placeholder (rectangle) created**
- [x] **Description text created**
- [x] **Elements stacked vertically**
- [x] **Proper spacing and alignment**
- [x] **Card has defined boundaries**

### AI Performance & Reliability (7 points)

**Target: <2 second responses, 90%+ accuracy, natural UX**

#### Response Time Testing ⚠️

- [ ] **Simple creation commands: <2 seconds**
  - [ ] "Create a red circle" - Response time: **\_** seconds
  - [ ] "Add text 'Hello'" - Response time: **\_** seconds
  - [ ] "Make a blue rectangle" - Response time: **\_** seconds

- [ ] **Manipulation commands: <2 seconds**
  - [ ] "Move the circle to center" - Response time: **\_** seconds
  - [ ] "Resize the rectangle" - Response time: **\_** seconds
  - [ ] "Rotate the text 45 degrees" - Response time: **\_** seconds

- [ ] **Complex commands: <3 seconds**
  - [ ] "Create a login form" - Response time: **\_** seconds
  - [ ] "Build a navigation bar" - Response time: **\_** seconds
  - [ ] "Make a card layout" - Response time: **\_** seconds

#### Accuracy Testing ⚠️

- [ ] **Command interpretation accuracy: 90%+**
  - [ ] "Create a blue square" → Creates rectangle (not circle)
  - [ ] "Move the rectangle left by 50 pixels" → Moves left (not right)
  - [ ] "Make the text bigger" → Increases font size
  - [ ] "Rotate clockwise" → Rotates in correct direction
  - [ ] "Arrange in grid" → Creates proper grid layout

- [ ] **Parameter accuracy: 90%+**
  - [ ] Colors specified correctly (hex codes)
  - [ ] Positions match requested coordinates
  - [ ] Sizes match requested dimensions
  - [ ] Text content matches exactly

#### Multi-User Collaboration ⚠️

- [ ] **Shared state works flawlessly**
  - [ ] User 1 creates shape, User 2 sees it immediately
  - [ ] User 1 moves shape, User 2 sees movement
  - [ ] Multiple users can use AI simultaneously
  - [ ] No conflicts or overwrites

- [ ] **Real-time synchronization**
  - [ ] Changes appear instantly across all users
  - [ ] No lag or delay in state updates
  - [ ] Consistent state across all clients

#### Error Handling & UX ⚠️

- [ ] **Natural UX with feedback**
  - [ ] Clear success messages
  - [ ] Helpful error messages
  - [ ] Loading indicators during processing
  - [ ] Graceful handling of invalid commands

- [ ] **Error scenarios handled properly**
  - [ ] Invalid coordinates handled gracefully
  - [ ] Missing shapes handled with clear messages
  - [ ] Rate limits respected and communicated
  - [ ] Network errors handled with retry logic

### Edge Cases and Stress Testing ⚠️

#### Ambiguous Commands

- [ ] **"Create a shape"** → Uses defaults or asks for clarification
- [ ] **"Move the thing"** → Handles ambiguous references
- [ ] **"Make it bigger"** → Identifies what "it" refers to
- [ ] **"Arrange these"** → Works with current selection

#### Complex Multi-Step Commands

- [ ] **"Create a dashboard with header, sidebar, and main content"**
- [ ] **"Build a contact form with name, email, message fields and submit button"**
- [ ] **"Design a product showcase with 3 product cards in a row"**
- [ ] **"Make a complete website header with logo, navigation, and search"**

#### Rate Limiting

- [ ] **30 requests per minute limit respected**
- [ ] **500 requests per hour limit respected**
- [ ] **Clear error messages when limits exceeded**
- [ ] **Graceful degradation under load**

#### Context Awareness

- [ ] **Remembers previous commands in session**
- [ ] **"Move it" refers to last created shape**
- [ ] **"Make it bigger" works with context**
- [ ] **Multi-step commands maintain context**

## Scoring Summary

### Command Breadth & Capability: \_\_\_/10 points

- [ ] 8+ command types (9-10 points)
- [ ] 6-7 command types (7-8 points)
- [ ] Exactly 6 command types (5-6 points)
- [ ] <6 command types (0-4 points)

### Complex Command Execution: \_\_\_/8 points

- [ ] 3+ elements, smart positioning (7-8 points)
- [ ] 2-3 elements, basic layouts (5-6 points)
- [ ] Basic interpretation (3-4 points)
- [ ] Complex commands fail (0-2 points)

### AI Performance & Reliability: \_\_\_/7 points

- [ ] <2s responses, 90%+ accuracy (6-7 points)
- [ ] 2-3s responses, 80%+ accuracy (4-5 points)
- [ ] 3-5s responses, 60%+ accuracy (2-3 points)
- [ ] > 5s responses, unreliable (0-1 points)

## Total Score: \_\_\_/25 points

## Notes

- ✅ = Implemented and ready for testing
- ⚠️ = Needs testing/verification
- [ ] = Test case to be executed

## Recent Fixes

**Directional Movement Tool Selection Fix (2024-01-XX):**

- **MAJOR FIX**: Fixed tool selection for directional movements like "move 300px to the right"
- **Problem**: AI was calling `moveShapeByOthers` (which fails with single shapes) instead of `moveShape`
- **Solution**: Clarified tool descriptions and added fallback logic
- **New Flow**:
  1. AI calls `findShapes` to locate the shape
  2. AI calculates new position: current_x + distance
  3. AI calls `moveShape` with calculated absolute position
  4. Shape moves successfully
- **Technical Changes**:
  - Updated `moveShape` description to emphasize directional movements
  - Updated `moveShapeByOthers` description to clarify when to use it
  - Added fallback logic to `moveShapeByOthers` for single-shape scenarios
  - Enhanced system prompts with clear tool selection guidance
  - **BONUS FIX**: Removed `.min(0)` constraint from PositionSchema to allow negative coordinates
  - **ADDITIONAL FIX**: Enhanced `needsFollowUp()` to detect positional creation commands like "create X to the right of other shapes"

**Previous Tool Chaining Implementation:**

- Implemented tool chaining for OpenAI agent to handle multi-step operations
- Added conversation-based tool chaining with up to 3 iterations
- Added `generateResponseWithMessages()` method to OpenAI service
- Implemented conversation history tracking

**Previous Fixes:**

- Updated system prompts and tool descriptions to guide AI through proper workflow
- Improved tool return messages to include guidance for next steps

**Grid Layout Spacing Fix (2024-01-XX):**

- **MAJOR FIX**: Fixed `arrangeInGrid` to use uniform cell dimensions and center-point positioning
- **Problem**: Objects were touching because the grid used variable column widths and row heights
- **Solution**:
  - Calculate maximum width and height across ALL shapes (not per column/row)
  - Use uniform grid cells based on these maximum dimensions
  - Position shapes by their center points within each grid cell
  - Apply proper spacing between grid cells
- **Result**: Shapes now have even spacing and don't overlap when arranged in grids

## Testing Environment Setup

1. Ensure `VITE_OPENAI_API_KEY` is set in `.env` file
2. Start the development server
3. Open multiple browser tabs for multi-user testing
4. Have a timer ready for response time measurements
5. Prepare test scenarios in advance

## Test Execution Order

1. Start with creation commands (already implemented)
2. Test manipulation commands
3. Test layout commands
4. Test complex commands
5. Measure performance metrics
6. Test multi-user scenarios
7. Test edge cases and error handling
