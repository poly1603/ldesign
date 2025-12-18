# Requirements Document

## Introduction

Fix the black screen issue that occurs when users click "Test Connection" in the NPM registry management page. The issue is caused by improper dialog handling and deprecated Flutter APIs.

## Glossary

- **NPM Registry**: A package registry for Node.js packages
- **Test Connection**: A feature that verifies connectivity to an NPM registry
- **Dialog**: A modal popup window in the Flutter application
- **PopScope**: Flutter widget that controls back navigation behavior
- **Context**: Flutter's BuildContext for widget tree navigation

## Requirements

### Requirement 1

**User Story:** As a user, I want to test NPM registry connections without experiencing UI freezes or black screens, so that I can verify my registry configuration works correctly.

#### Acceptance Criteria

1. WHEN a user clicks "Test Connection" from the registry menu THEN the System SHALL display a loading dialog with a progress indicator
2. WHEN the connection test is in progress THEN the System SHALL prevent the dialog from being dismissed by back button or outside taps
3. WHEN the connection test completes successfully THEN the System SHALL close the loading dialog and display a success message
4. WHEN the connection test fails THEN the System SHALL close the loading dialog and display an error message with details
5. WHEN the connection test times out after 10 seconds THEN the System SHALL close the loading dialog and display a timeout error message

### Requirement 2

**User Story:** As a developer, I want the dialog implementation to use current Flutter APIs, so that the code remains maintainable and compatible with future Flutter versions.

#### Acceptance Criteria

1. WHEN implementing dialog dismissal prevention THEN the System SHALL use PopScope instead of deprecated WillPopScope
2. WHEN managing BuildContext across async operations THEN the System SHALL properly check context.mounted before navigation
3. WHEN closing dialogs THEN the System SHALL use rootNavigator parameter to ensure proper dialog dismissal
4. WHEN displaying results THEN the System SHALL add appropriate delays to prevent UI race conditions

### Requirement 3

**User Story:** As a user, I want clear visual feedback during connection testing, so that I understand what the system is doing.

#### Acceptance Criteria

1. WHEN the loading dialog appears THEN the System SHALL display a circular progress indicator
2. WHEN the loading dialog appears THEN the System SHALL display descriptive text "正在测试连接..."
3. WHEN showing success results THEN the System SHALL use a green SnackBar with a checkmark icon
4. WHEN showing error results THEN the System SHALL use a red SnackBar with an error icon
5. WHEN showing results THEN the System SHALL use floating SnackBar behavior with rounded corners
